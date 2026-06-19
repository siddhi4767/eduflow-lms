import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { courseSchema } from "../../lib/schemas";
import { auth } from "../../../auth";
import { hasRole } from "../../../lib/rbac";

// GET /api/courses — Fetch all courses with pagination
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count(),
    ]);

    const result = courses.map((c) => ({
      id: c.id,
      name: c.name,
      duration: c.duration,
      fee: c.fee,
      category: c.category,
      imageUrl: c.imageUrl,
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch courses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/courses — Create a new course
export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = courseSchema.parse(body);

    const newCourse = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: validated,
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "course",
          message: `${course.name} course added to catalog`,
          icon: "📚",
        },
      });

      return course;
    });

    return NextResponse.json(
      { id: newCourse.id, name: newCourse.name, duration: newCourse.duration, fee: newCourse.fee, category: newCourse.category, imageUrl: newCourse.imageUrl },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
