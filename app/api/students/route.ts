import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { studentSchema } from "../../lib/schemas";
import { auth } from "../../../auth";
import { hasRole, ROUTE_PERMISSIONS } from "../../../lib/rbac";

// GET /api/students — Fetch all students
export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ROUTE_PERMISSIONS["/api/students"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [students, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          enrollments: {
            include: { course: true }
          }
        }
      }),
      prisma.user.count({ where: { role: "STUDENT" } })
    ]);

    // Map to match the frontend interface shape (strip Prisma metadata)
    const result = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      course: s.enrollments[0]?.course?.name || "Not Enrolled",
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/students — Create a new student
export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ROUTE_PERMISSIONS["/api/students"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = studentSchema.parse(body);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          role: "STUDENT",
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "student",
          message: `${user.name} registered as a new student`,
          icon: "🎓",
        },
      });

      return user;
    });

    return NextResponse.json(
      { id: newUser.id, name: newUser.name, email: newUser.email, course: "Not Enrolled" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
