import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../lib/db";
import { enrollmentSchema } from "../../lib/schemas";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.enrollments);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = enrollmentSchema.parse(body);

    const db = getDb();
    const newEnrollment = { id: generateId(), ...validated };
    db.enrollments.push(newEnrollment);

    db.activities.unshift({
      id: generateId(),
      type: "enrollment",
      message: `${newEnrollment.studentName} enrolled in ${newEnrollment.courseName}`,
      timestamp: new Date().toISOString(),
      icon: "📋"
    });

    saveDb(db);
    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
