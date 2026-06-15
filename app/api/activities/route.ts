import { NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "../../lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.activities);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    
    const newActivity = {
      id: generateId(),
      type: body.type,
      message: body.message,
      timestamp: new Date().toISOString(),
      icon: body.icon || "🔔"
    };

    db.activities.unshift(newActivity);
    saveDb(db);

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
