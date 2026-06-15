import { NextResponse } from "next/server";
import { loginSchema } from "../../lib/schemas";
import { setSession, clearSession } from "../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Mock Authentication Logic
    // In a real app, verify against database and hash passwords
    let role = "Student";
    if (email === "admin@eduflow.com" && password === "password") {
      role = "Administrator";
    } else if (email === "instructor@eduflow.com" && password === "password") {
      role = "Instructor";
    } else if (email === "student@eduflow.com" && password === "password") {
      role = "Student";
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const payload = {
      user: {
        name: email.split("@")[0],
        email,
        role,
      }
    };

    await setSession(payload);

    return NextResponse.json({ success: true, user: payload.user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
