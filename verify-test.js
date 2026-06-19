const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  
  await prisma.user.updateMany({
    where: { email: { in: ['admin@eduflow.com', 'yhshadgunasiddhi@gmail.com'] } },
    data: { emailVerified: new Date(), password: hash }
  });
  console.log("Verified admin and student accounts, set passwords to 'password123'");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
