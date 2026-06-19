import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { auth } from "../../../auth";
import bcrypt from "bcryptjs";
import { profileUpdateSchema, changePasswordSchema } from "../../lib/schemas";

export const dynamic = "force-dynamic";

// GET /api/profile — Fetch current user details
export const GET = auth(async (req) => {
  try {
    const session = req.auth;
    console.log("=== GET /api/profile ===");
    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id && !session?.user?.email) {
      console.log("Unauthorized: Missing user id or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = session.user.id
      ? { id: session.user.id }
      : { email: session.user.email! };

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    console.log("Found user:", user ? "YES" : "NO");

    if (!user) {
      console.log("User not found in DB for session.user.id:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("GET /api/profile Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

// PUT /api/profile — Update user name and/or password
export const PUT = auth(async (req) => {
  try {
    const session = req.auth;
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if it's a password update or name update
    if (body.type === "password") {
      const validated = changePasswordSchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
      }

      const { currentPassword, newPassword } = validated.data;

      const user = await prisma.user.findUnique({
        where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      });

      if (!user || !user.password) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordsMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: "security",
          message: `${user.name || user.email} updated their password`,
          icon: "🔒",
        },
      });

      return NextResponse.json({ success: "Password updated successfully!" });
    } else {
      // Profile details update
      const validated = profileUpdateSchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
      }

      const { name } = validated.data;

      const userToUpdate = session.user.id
        ? await prisma.user.findUnique({ where: { id: session.user.id } })
        : await prisma.user.findUnique({ where: { email: session.user.email! } });

      if (!userToUpdate) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userToUpdate.id },
        data: { name },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: "student",
          message: `${updatedUser.name} updated their profile information`,
          icon: "✏️",
        },
      });

      return NextResponse.json(updatedUser);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
