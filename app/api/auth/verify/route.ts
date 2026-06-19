// =============================================================================
// app/api/auth/verify/route.ts — EduFlow LMS | Email Verification API
//
// POST: Validates the token and marks the user's email as verified in the DB.
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    console.log("[VERIFY_DEBUG] Token received:", token);

    // Find the token
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    console.log("[VERIFY_DEBUG] Token lookup result:", !!existingToken, existingToken);

    if (!existingToken) {
      return NextResponse.json({ error: "Token does not exist!" }, { status: 400 });
    }

    // Check expiration
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" }, { status: 400 });
    }

    // Find the user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Email does not exist!" }, { status: 400 });
    }

    // Update user to verified and potentially handle email changes
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });
    
    console.log("[VERIFY_DEBUG] User updated. New emailVerified:", updatedUser.emailVerified);

    // Delete the token
    await prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: "Email verified successfully!" });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong during verification." },
      { status: 500 }
    );
  }
}
