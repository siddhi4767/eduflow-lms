// =============================================================================
// app/api/auth/new-password/route.ts — EduFlow LMS | New Password API
//
// POST: Validates the reset token and updates the user's password.
// =============================================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

const newPasswordSchema = z.object({
  password: z.string().min(6, "Minimum 6 characters required"),
  token: z.string().min(1, "Missing token"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = newPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input." },
        { status: 400 }
      );
    }

    const { password, token } = validated.data;

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid token!" }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Email does not exist!" }, { status: 400 });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    // Clean up the token
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: "Password updated successfully!" });
  } catch (error) {
    console.error("[NEW_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
