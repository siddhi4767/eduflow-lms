// =============================================================================
// app/api/auth/reset/route.ts — EduFlow LMS | Password Reset Request API
//
// POST: Generates a password reset token and sends a reset email.
// =============================================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { generatePasswordResetToken } from "../../../../lib/tokens";
import { sendPasswordResetEmail } from "../../../../lib/mail";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = resetSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Return success even if user doesn't exist for security reasons (prevent enumeration)
      return NextResponse.json({ success: "Reset email sent!" });
    }

    // Generate token and send email
    const passwordResetToken = await generatePasswordResetToken(email);
    const emailResult = await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send reset email. " + ((emailResult as any).error?.message || "Please contact support.") },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: "Reset email sent!" });
  } catch (error) {
    console.error("[RESET_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
