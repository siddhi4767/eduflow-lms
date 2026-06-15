import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../../lib/db";
import { enrollmentSchema } from "../../../lib/schemas";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = enrollmentSchema.partial().parse(body);

    const db = getDb();
    const index = db.enrollments.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.enrollments[index] = { ...db.enrollments[index], ...validated };

    db.activities.unshift({
      id: generateId(),
      type: "enrollment",
      message: `Enrollment for ${db.enrollments[index].studentName} updated`,
      timestamp: new Date().toISOString(),
      icon: "✏️"
    });

    saveDb(db);
    return NextResponse.json(db.enrollments[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const enrollment = db.enrollments.find((e) => e.id === id);
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.enrollments = db.enrollments.filter((e) => e.id !== id);

    db.activities.unshift({
      id: generateId(),
      type: "enrollment",
      message: `${enrollment.studentName}'s enrollment removed`,
      timestamp: new Date().toISOString(),
      icon: "🗑️"
    });

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
