import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../lib/db";
import { studentSchema } from "../../lib/schemas";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.students);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = studentSchema.parse(body);

    const db = getDb();
    const newStudent = { id: generateId(), ...validated };
    db.students.push(newStudent);

    // Also add an activity automatically
    db.activities.unshift({
      id: generateId(),
      type: "student",
      message: `${newStudent.name} registered as a new student`,
      timestamp: new Date().toISOString(),
      icon: "🎓"
    });

    saveDb(db);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
