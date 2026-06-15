import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../lib/db";
import { courseSchema } from "../../lib/schemas";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.courses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = courseSchema.parse(body);

    const db = getDb();
    const newCourse = { id: generateId(), ...validated };
    db.courses.push(newCourse);

    db.activities.unshift({
      id: generateId(),
      type: "course",
      message: `${newCourse.name} course added to catalog`,
      timestamp: new Date().toISOString(),
      icon: "📚"
    });

    saveDb(db);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
