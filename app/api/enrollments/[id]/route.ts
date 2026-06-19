import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { enrollmentSchema } from "../../../lib/schemas";
import { auth } from "../../../../auth";
import { hasRole, ROUTE_PERMISSIONS } from "../../../../lib/rbac";

// PATCH /api/enrollments/:id — Update an enrollment
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = enrollmentSchema.partial().parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      // Omit courseName and studentName if they are in the update payload since prisma data doesn't accept them directly
      const { courseName, studentName, ...dataToUpdate } = validated;
      
      const enrollment = await tx.enrollment.update({
        where: { id },
        data: dataToUpdate,
        include: { user: true, course: true },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "enrollment",
          message: `Enrollment for ${enrollment.user.name} updated`,
          icon: "✏️",
        },
      });

      return enrollment;
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      courseId: updated.courseId,
      studentName: updated.user.name,
      courseName: updated.course.name,
      enrolledDate: updated.enrolledDate,
      status: updated.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update enrollment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/enrollments/:id — Delete an enrollment
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!hasRole(role, ["ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.delete({
        where: { id },
        include: { user: true },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "enrollment",
          message: `${enrollment.user.name}'s enrollment removed`,
          icon: "🗑️",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete enrollment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
