import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { auth } from "../../../auth";
import { z } from "zod";

const activitySchema = z.object({
  type: z.string().min(1, "Type is required"),
  message: z.string().min(1, "Message is required"),
  timestamp: z.string().optional(),
  icon: z.string().optional(),
});

// GET /api/activities — Fetch all activities (most recent first)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      orderBy: { timestamp: "desc" },
      take: 100, // Reasonable limit
    });

    // Map to match the frontend Activity interface (timestamp as ISO string)
    const result = activities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      timestamp: a.timestamp.toISOString(),
      icon: a.icon,
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch activities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/activities — Create a new activity
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = activitySchema.parse(body);

    const newActivity = await prisma.activity.create({
      data: {
        type: validated.type,
        message: validated.message,
        timestamp: validated.timestamp ? new Date(validated.timestamp) : new Date(),
        icon: validated.icon || "🔔",
      },
    });

    return NextResponse.json(
      {
        id: newActivity.id,
        type: newActivity.type,
        message: newActivity.message,
        timestamp: newActivity.timestamp.toISOString(),
        icon: newActivity.icon,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create activity";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
