// =============================================================================
// app/lib/prisma.ts — EduFlow LMS | Prisma Client Singleton
//
// Following the official Next.js + Prisma best practice:
// In development, Next.js hot-reloads modules which would create a new
// PrismaClient on every reload, eventually exhausting the database connection
// pool. We prevent this by attaching the client to `globalThis` which persists
// across hot reloads.
//
// In production, a simple module-level singleton is sufficient.
// =============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
