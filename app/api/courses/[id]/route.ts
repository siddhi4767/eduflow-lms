import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../../lib/db";
import { courseSchema } from "../../../lib/schemas";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = courseSchema.partial().parse(body);

    const db = getDb();
    const index = db.courses.findIndex((c) => c.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.courses[index] = { ...db.courses[index], ...validated };

    db.activities.unshift({
      id: generateId(),
      type: "course",
      message: `${db.courses[index].name} course updated`,
      timestamp: new Date().toISOString(),
      icon: "✏️"
    });

    saveDb(db);
    return NextResponse.json(db.courses[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const course = db.courses.find((c) => c.id === id);
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.courses = db.courses.filter((c) => c.id !== id);

    db.activities.unshift({
      id: generateId(),
      type: "course",
      message: `${course.name} course removed`,
      timestamp: new Date().toISOString(),
      icon: "🗑️"
    });

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
