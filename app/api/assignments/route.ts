import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { assignmentSchema } from "../../lib/schemas";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    const isStudent = (user as any).role?.toUpperCase() === "STUDENT";

    if (isStudent) {
      // Find courses student is enrolled in
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      });
      const courseIds = enrollments.map((e) => e.courseId);

      // Fetch assignments for those courses
      const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: true,
          submissions: { where: { userId: user.id } },
        },
      });

      const flattened = assignments.map((a) => {
        const sub = a.submissions[0];
        let status = "Pending";
        let score = null;
        let fileUrl = null;
        let textResponse = null;

        if (sub) {
          status = sub.status; // "Submitted" or "Graded"
          score = sub.score;
          fileUrl = sub.fileUrl;
          textResponse = sub.textResponse;
        } else if (new Date(a.dueDate) < new Date()) {
          status = "Overdue";
        }

        return {
          id: a.id, // Primary key for frontend rendering
          assignmentId: a.id,
          title: a.title,
          course: a.course.name,
          dueDate: a.dueDate.toISOString(),
          status,
          score,
          fileUrl,
          textResponse,
        };
      });

      return NextResponse.json(flattened);
    } else {
      // Admin / Instructor
      // Need to see every student's status for every assignment
      const assignments = await prisma.assignment.findMany({
        include: {
          course: {
            include: {
              enrollments: { include: { user: true } },
            },
          },
          submissions: true,
        },
      });

      const flattened: any[] = [];
      for (const a of assignments) {
        if (a.course.enrollments.length === 0) {
          // No students enrolled, but still show the assignment to admin
          flattened.push({
            id: a.id,
            assignmentId: a.id,
            title: a.title,
            course: a.course.name,
            dueDate: a.dueDate.toISOString(),
            status: "Pending",
            score: null,
            fileUrl: null,
            textResponse: null,
            studentId: null,
            studentName: "No students enrolled",
          });
          continue;
        }

        // Only show assignments for enrolled students
        for (const enr of a.course.enrollments) {
          const sub = a.submissions.find((s) => s.userId === enr.userId);
          let status = "Pending";
          let score = null;
          let fileUrl = null;
          let textResponse = null;

          if (sub) {
            status = sub.status;
            score = sub.score;
            fileUrl = sub.fileUrl;
            textResponse = sub.textResponse;
          } else if (new Date(a.dueDate) < new Date()) {
            status = "Overdue";
          }

          flattened.push({
            id: `${a.id}_${enr.userId}`, // Composite ID
            assignmentId: a.id,
            title: a.title,
            course: a.course.name,
            dueDate: a.dueDate.toISOString(),
            status,
            score,
            fileUrl,
            textResponse,
            studentId: enr.userId,
            studentName: enr.user.name || "Unknown Student",
          });
        }
      }

      return NextResponse.json(flattened);
    }
  } catch (error: any) {
    console.error("GET Assignments Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role?.toUpperCase() === "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = assignmentSchema.parse(body);

    const newAssignment = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          title: validated.title,
          courseId: validated.courseId,
          dueDate: new Date(validated.dueDate),
        },
      });

      await tx.activity.create({
        data: {
          type: "course",
          message: `New assignment added: ${assignment.title}`,
          icon: "📝",
        },
      });

      return assignment;
    });

    return NextResponse.json(newAssignment);
  } catch (error: any) {
    console.error("POST Assignment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
