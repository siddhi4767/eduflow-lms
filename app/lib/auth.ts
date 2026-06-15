import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const secretKey = "super-secret-key-for-eduflow-lms-mock";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const c = await cookies();
  const session = c.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function setSession(payload: JWTPayload) {
  const session = await encrypt(payload);
  const c = await cookies();
  c.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete("session");
}
