import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hash = await bcrypt.hash("password123", 10);
    
    // Check if admin exists to avoid unique constraint errors
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@eduflow.com" }
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          name: "EduFlow Admin",
          email: "admin@eduflow.com",
          password: hash,
          role: "ADMIN",
          emailVerified: new Date(),
        }
      });
      return NextResponse.json({ success: true, message: "Admin account created successfully!" });
    }

    // Force reset the password just in case
    await prisma.user.update({
      where: { email: "admin@eduflow.com" },
      data: { password: hash, emailVerified: new Date() }
    });

    return NextResponse.json({ success: true, message: "Admin account reset and ready!" });
  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
