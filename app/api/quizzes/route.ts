import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { quizSchema } from "../../lib/schemas";

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

      const quizzes = await prisma.quiz.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: true,
          attempts: { where: { userId: user.id } },
        },
      });

      const flattened = quizzes.map((q) => {
        const attempt = q.attempts[0];
        return {
          id: q.id,
          quizId: q.id,
          title: q.title,
          course: q.course.name,
          duration: q.duration,
          questionsCount: q.questionsCount,
          questions: q.questions,
          status: attempt ? attempt.status : "Not Started",
          score: attempt ? attempt.score : null,
        };
      });

      return NextResponse.json(flattened);
    } else {
      // Admin / Instructor
      // Show all quizzes
      const quizzes = await prisma.quiz.findMany({
        include: {
          course: {
            include: {
              enrollments: { include: { user: true } },
            },
          },
          attempts: true,
        },
      });

      const flattened: any[] = [];
      for (const q of quizzes) {
        if (q.course.enrollments.length === 0) {
          flattened.push({
            id: q.id,
            quizId: q.id,
            title: q.title,
            course: q.course.name,
            duration: q.duration,
            questionsCount: q.questionsCount,
            questions: q.questions,
            status: "Not Started",
            score: null,
            studentId: null,
            studentName: "No students enrolled",
          });
          continue;
        }

        for (const enr of q.course.enrollments) {
          const attempt = q.attempts.find((a) => a.userId === enr.userId);
          
          flattened.push({
            id: `${q.id}_${enr.userId}`,
            quizId: q.id,
            title: q.title,
            course: q.course.name,
            duration: q.duration,
            questionsCount: q.questionsCount,
            questions: q.questions,
            status: attempt ? attempt.status : "Not Started",
            score: attempt ? attempt.score : null,
            studentId: enr.userId,
            studentName: enr.user.name || "Unknown Student",
          });
        }
      }

      return NextResponse.json(flattened);
    }
  } catch (error: any) {
    console.error("GET Quizzes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role?.toUpperCase() !== "TUTOR") {
      return NextResponse.json({ error: "Unauthorized: Only Tutors can create quizzes" }, { status: 403 });
    }

    const body = await req.json();
    const validated = quizSchema.parse(body);

    const newQuiz = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: validated,
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "course",
          message: `New quiz added: ${quiz.title}`,
          icon: "📝",
        },
      });

      return quiz;
    });

    return NextResponse.json(newQuiz);
  } catch (error: any) {
    console.error("POST Quiz Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
