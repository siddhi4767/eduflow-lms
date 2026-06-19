const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const email = "yhshadgunasiddhi@gmail.com";
  console.log(`\n=== 🔍 VERIFICATION TOKEN AUDIT ===`);
  
  // 1. Find Verification Token
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { email: email }
  });
  
  if (tokenRecord) {
    console.log(`✅ Token FOUND in VerificationToken table:`);
    console.log(`   Email: ${tokenRecord.email}`);
    console.log(`   Token: ${tokenRecord.token}`);
    console.log(`   Expires: ${tokenRecord.expires}`);
    
    // 2. Show Verification URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/auth/verify?token=${tokenRecord.token}`;
    console.log(`\n🔗 VERIFICATION URL:`);
    console.log(`   ${verificationUrl}`);
  } else {
    console.log(`❌ No token found for ${email} in VerificationToken table.`);
  }

  console.log(`\n=== 🚀 DEVELOPMENT TESTING: FORCING VERIFICATION ===`);
  // Update user's emailVerified
  const updatedUser = await prisma.user.update({
    where: { email: email },
    data: { emailVerified: new Date() }
  });
  
  console.log(`✅ User ${updatedUser.email} emailVerified updated to: ${updatedUser.emailVerified}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
