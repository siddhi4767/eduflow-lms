import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import { quizAttemptSchema } from "../../../lib/schemas";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = quizAttemptSchema.parse(body);
    const userId = session.user.id as string;

    const attempt = await prisma.$transaction(async (tx) => {
      const isCompleted = validated.status === "Completed" || (validated.score !== undefined && validated.score > 0);
      const status = isCompleted ? "Completed" : "In Progress";
      const score = validated.score ?? 0;
      const completedAt = isCompleted ? new Date() : null;

      return tx.quizAttempt.upsert({
        where: {
          quizId_userId: { quizId: validated.quizId, userId }
        },
        update: {
          status,
          score,
          completedAt
        },
        create: {
          quizId: validated.quizId,
          userId,
          status,
          score,
          completedAt
        }
      });
    });

    return NextResponse.json(attempt);
  } catch (error: any) {
    console.error("POST Quiz Attempt Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
