import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../../lib/db";
import { studentSchema } from "../../../lib/schemas";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = studentSchema.partial().parse(body);

    const db = getDb();
    const index = db.students.findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.students[index] = { ...db.students[index], ...validated };

    db.activities.unshift({
      id: generateId(),
      type: "student",
      message: `${db.students[index].name}'s profile updated`,
      timestamp: new Date().toISOString(),
      icon: "✏️"
    });

    saveDb(db);
    return NextResponse.json(db.students[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const student = db.students.find((s) => s.id === id);
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.students = db.students.filter((s) => s.id !== id);

    db.activities.unshift({
      id: generateId(),
      type: "student",
      message: `${student.name} was removed`,
      timestamp: new Date().toISOString(),
      icon: "🗑️"
    });

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
