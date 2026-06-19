const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('tutor123', 10);
  
  await prisma.user.upsert({
    where: { email: 'tutor@eduflow.com' },
    update: {
      password,
      role: 'TUTOR',
    },
    create: {
      name: 'Tutor User',
      email: 'tutor@eduflow.com',
      password,
      role: 'TUTOR',
    },
  });

  console.log('Tutor user added or updated successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
