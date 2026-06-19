import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import { quizSchema } from "../../../lib/schemas";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("GET Quiz Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || (session.user as any).role === "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = quizSchema.partial().parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.update({
        where: { id: params.id },
        data: validated,
      });

      await tx.activity.create({
        data: {
          type: "course",
          message: `Quiz updated: ${quiz.title}`,
          icon: "📝",
        },
      });

      return quiz;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || (session.user as any).role === "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.quizAttempt.deleteMany({ where: { quizId: params.id } });

      const quiz = await tx.quiz.delete({
        where: { id: params.id },
      });

      await tx.activity.create({
        data: {
          type: "course",
          message: `Quiz removed: ${quiz.title}`,
          icon: "🗑️",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
