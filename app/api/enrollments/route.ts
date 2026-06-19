import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { enrollmentSchema } from "../../lib/schemas";
import { auth } from "../../../auth";
import { hasRole, ROUTE_PERMISSIONS } from "../../../lib/rbac";

// GET /api/enrollments — Fetch all enrollments
export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ROUTE_PERMISSIONS["/enrollment"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [enrollments, total] = await prisma.$transaction([
      prisma.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: true,
          course: true,
        }
      }),
      prisma.enrollment.count()
    ]);

    const result = enrollments.map((e) => ({
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      studentName: e.user.name,
      courseName: e.course.name,
      enrolledDate: e.enrolledDate,
      status: e.status,
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch enrollments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/enrollments — Create a new enrollment
export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = enrollmentSchema.parse(body);

    const user = await prisma.user.findFirst({ where: { name: validated.studentName, role: "STUDENT" } });
    const course = await prisma.course.findFirst({ where: { name: validated.courseName } });
    
    if (!user) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const newEnrollment = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledDate: validated.enrolledDate,
          status: validated.status,
        },
        include: { user: true, course: true }
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "enrollment",
          message: `${enrollment.user.name} enrolled in ${enrollment.course.name}`,
          icon: "📋",
        },
      });

      return enrollment;
    });

    return NextResponse.json(
      {
        id: newEnrollment.id,
        userId: newEnrollment.userId,
        courseId: newEnrollment.courseId,
        studentName: newEnrollment.user.name,
        courseName: newEnrollment.course.name,
        enrolledDate: newEnrollment.enrolledDate,
        status: newEnrollment.status,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create enrollment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
