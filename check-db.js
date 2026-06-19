const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.assignment.findMany();
  console.log("Assignments:", assignments);
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log("Users:", users);
  const enrollments = await prisma.enrollment.findMany();
  console.log("Enrollments:", enrollments);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
