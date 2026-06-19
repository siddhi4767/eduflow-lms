// =============================================================================
// lib/tokens.ts — EduFlow LMS | Token Generation Utilities
//
// Generates unique verification and password-reset tokens stored in the DB.
// Each token replaces any existing token for the same email (one active at a time).
// Tokens expire after 1 hour.
// =============================================================================

import { prisma } from "../app/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const TOKEN_EXPIRY_MS = 3600 * 1000; // 1 hour

/**
 * Generate a verification token for email confirmation.
 * Deletes any existing token for the same email before creating a new one.
 */
export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Remove any existing token for this email
  await prisma.verificationToken.deleteMany({ where: { email } });

  const verificationToken = await prisma.verificationToken.create({
    data: { email, token, expires },
  });

  return verificationToken;
}

/**
 * Generate a password reset token.
 * Deletes any existing token for the same email before creating a new one.
 */
export async function generatePasswordResetToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Remove any existing token for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  return passwordResetToken;
}
