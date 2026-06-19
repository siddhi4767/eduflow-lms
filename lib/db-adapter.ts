import { prisma } from "./prisma";
import { putItem, getItem } from "./aws/dynamo";

// Set to true to read from DynamoDB instead of Prisma.
// Writes are currently sent to both (Dual-Write strategy) to ensure rollback capability.
const READ_FROM_DYNAMO = process.env.USE_DYNAMO === "true";

export const dbAdapter = {
  user: {
    findUnique: async ({ where }: any) => {
      if (READ_FROM_DYNAMO && where.email) {
        // Assume PK = USER#<email>, SK = PROFILE
        const item = await getItem(`USER#${where.email}`, "PROFILE");
        if (item) return item;
      }
      return prisma.user.findUnique({ where });
    },
    create: async ({ data }: any) => {
      const user = await prisma.user.create({ data });
      
      try {
        await putItem({
          PK: `USER#${user.email}`,
          SK: "PROFILE",
          ...user,
        });
        console.log(`Dual-write successful for User: ${user.email}`);
      } catch (error) {
        console.error("DynamoDB Dual-write failed for user:", error);
      }
      
      return user;
    },
    update: async ({ where, data, select }: any) => {
      const user = await prisma.user.update({ where, data, select });
      
      try {
        if (user.email) {
          await putItem({
            PK: `USER#${user.email}`,
            SK: "PROFILE",
            ...user,
          });
        }
      } catch (error) {
        console.error("DynamoDB Dual-write failed for user update:", error);
      }
      
      return user;
    }
  },
  course: {
    create: async ({ data }: any) => {
      const course = await prisma.course.create({ data });
      try {
        await putItem({
          PK: `COURSE#${course.id}`,
          SK: `COURSE#${course.id}`,
          ...course,
        });
      } catch (error) {
        console.error("DynamoDB Dual-write failed for course:", error);
      }
      return course;
    }
    // Implement other methods as needed during progressive migration
  }
};
