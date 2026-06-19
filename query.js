const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQuery() {
  const emailToFind = "siddhi@example.com";
  
  const user = await prisma.user.findUnique({
    where: { email: emailToFind }
  });

  if (!user) {
    console.log(`User ${emailToFind} not found.`);
  } else {
    console.log(`=== DATABASE RECORD ===`);
    console.log(`Email: ${user.email}`);
    console.log(`EmailVerified: ${user.emailVerified}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password hash length: ${user.password ? user.password.length : "NULL"}`);
  }
}

runQuery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
