const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runAudit() {
  const testEmail = "yhshadgunasiddhi@gmail.com";
  console.log(`\n=== 🔍 AUTHENTICATION AUDIT ===`);
  
  // 1. Check user record
  console.log(`\n1. Querying Prisma User table for: ${testEmail}`);
  const user = await prisma.user.findUnique({ where: { email: testEmail } });
  
  if (!user) {
    console.log(`❌ User NOT FOUND in database.`);
    return;
  }
  
  console.log(`✅ User FOUND:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Email Verified: ${user.emailVerified}`);
  console.log(`   Password Hash Length: ${user.password ? user.password.length : 'NULL'}`);
  console.log(`   Password Hash starts with: ${user.password ? user.password.substring(0, 7) + '...' : 'NULL'}`);
  
  // 2. Test bcrypt
  console.log(`\n2. Testing bcrypt compare...`);
  const passwordToTest = "password123"; // Assuming this is what they type
  console.log(`   Testing against password: "${passwordToTest}"`);
  
  if (!user.password) {
     console.log(`   ❌ Cannot compare, stored password is null`);
  } else {
    try {
      const isMatch = await bcrypt.compare(passwordToTest, user.password);
      console.log(`   Result of bcrypt.compare(): ${isMatch}`);
      if (!isMatch) {
         console.log(`   ⚠️ This explains the "Invalid Credentials" error! The password hashes do not match.`);
      } else {
         console.log(`   ✅ Password matches.`);
      }
    } catch (err) {
      console.log(`   ❌ bcrypt.compare threw an error:`, err);
    }
  }

  // 3. Check verify status
  console.log(`\n3. Checking Verification Status...`);
  if (!user.emailVerified) {
    console.log(`   ❌ emailVerified is NULL. Under the new rules, auth.ts will reject this login with UnverifiedEmailError.`);
  } else {
    console.log(`   ✅ emailVerified is populated: ${user.emailVerified}. Login should proceed.`);
  }
}

runAudit()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
