// =============================================================================
// lib/mail.ts — EduFlow LMS | Email Service
//
// Sends verification and password-reset emails via Resend.
// If RESEND_API_KEY is not configured, falls back to printing links in the
// server console — perfect for local development without external services.
// =============================================================================

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = "EduFlow LMS <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${APP_URL}/auth/verify?token=${token}`;
  
  console.log(`\n[EMAIL_TRACE] Preparing to send verification email...`);
  console.log(`[EMAIL_TRACE] Recipient: ${email}`);
  console.log(`[EMAIL_TRACE] Verification URL: ${confirmLink}`);
  console.log(`[EMAIL_TRACE] From: ${FROM_EMAIL}`);
  console.log(`[EMAIL_TRACE] Has Resend API Key configured: ${!!process.env.RESEND_API_KEY}`);

  if (!resend) {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  📧  EMAIL VERIFICATION (console mode)                  ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log(`║  To:   ${email}`);
    console.log(`║  Link: ${confirmLink}`);
    console.log("╚══════════════════════════════════════════════════════════╝\n");
    return { success: true, mode: "console" };
  }

  try {
    console.log(`[EMAIL_TRACE] Calling Resend API...`);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "EduFlow — Verify your email address",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Welcome to EduFlow! 🎓</h2>
          <p style="color: #475569; line-height: 1.6;">
            Click the button below to verify your email address and activate your account.
          </p>
          <a href="${confirmLink}" 
             style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Verify Email Address
          </a>
          <p style="color: #94a3b8; font-size: 14px;">
            This link expires in 1 hour. If you didn't create an account, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[EMAIL_TRACE] ❌ Resend API returned an ERROR:", error);
      return { success: false, error, mode: "resend" };
    }

    console.log("[EMAIL_TRACE] ✅ Resend API returned SUCCESS:", data);
    return { success: true, data, mode: "resend" };
  } catch (err) {
    console.error("[EMAIL_TRACE] 💥 Unexpected exception during Resend API call:", err);
    return { success: false, error: err, mode: "resend" };
  }
}

/**
 * Send a password reset link.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/auth/new-password?token=${token}`;

  if (!resend) {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  🔑  PASSWORD RESET (console mode)                      ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log(`║  To:   ${email}`);
    console.log(`║  Link: ${resetLink}`);
    console.log("╚══════════════════════════════════════════════════════════╝\n");
    return { success: true, mode: "console" };
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "EduFlow — Reset your password",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset Request 🔐</h2>
        <p style="color: #475569; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${resetLink}" 
           style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 14px;">
          This link expires in 1 hour. If you didn't request a reset, you can ignore this email.
        </p>
      </div>
    `,
  });

  return { success: true, mode: "resend" };
}
