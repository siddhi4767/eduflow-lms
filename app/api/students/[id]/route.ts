import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { studentSchema } from "../../../lib/schemas";
import { auth } from "../../../../auth";
import { hasRole, ROUTE_PERMISSIONS } from "../../../../lib/rbac";

// PATCH /api/students/:id — Update a student
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ROUTE_PERMISSIONS["/api/students"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = studentSchema.partial().parse(body);

    const { course, ...userData } = validated;
    
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: userData,
        include: {
          enrollments: { include: { course: true } }
        }
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "student",
          message: `${user.name}'s profile updated`,
          icon: "✏️",
        },
      });

      return user;
    });

    return NextResponse.json({
      id: updated.id, name: updated.name, email: updated.email, course: updated.enrollments?.[0]?.course?.name || "No Course",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update student";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/students/:id — Delete a student
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ROUTE_PERMISSIONS["/api/students"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // First delete associated enrollments, quiz attempts, assignment submissions
      await tx.enrollment.deleteMany({ where: { userId: id } });
      await tx.quizAttempt.deleteMany({ where: { userId: id } });
      await tx.assignmentSubmission.deleteMany({ where: { userId: id } });

      const student = await tx.user.delete({
        where: { id },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "student",
          message: `${student.name} was removed`,
          icon: "🗑️",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
