import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { courseSchema } from "../../../lib/schemas";
import { auth } from "../../../../auth";
import { hasRole } from "../../../../lib/rbac";

// PATCH /api/courses/:id — Update a course
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = courseSchema.partial().parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id },
        data: validated,
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "course",
          message: `${course.name} course updated`,
          icon: "✏️",
        },
      });

      return course;
    });

    return NextResponse.json({
      id: updated.id, name: updated.name, duration: updated.duration, fee: updated.fee, category: updated.category, imageUrl: updated.imageUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/courses/:id — Delete a course
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // First, delete related enrollments, assignments, quizzes
      await tx.enrollment.deleteMany({ where: { courseId: id } });
      await tx.assignment.deleteMany({ where: { courseId: id } });
      await tx.quiz.deleteMany({ where: { courseId: id } });

      const course = await tx.course.delete({
        where: { id },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "course",
          message: `${course.name} course removed`,
          icon: "🗑️",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
