// =============================================================================
// data/store.ts  — EduFlow LMS  |  Seed / Default Data
//
// Contains ONLY the initial demo data used when no localStorage data exists.
// All TypeScript interfaces have moved to types.ts.
// All runtime state management has moved to context/AppContext.tsx.
// =============================================================================

import type { Student, Course, Enrollment, Activity } from "./types";

// ── Default Students ─────────────────────────────────────────────────────────

export const DEFAULT_STUDENTS: Student[] = [
  { id: "1", name: "Siddhi",  email: "siddhi@example.com",  course: "React JS"   },
  { id: "2", name: "Harsha",  email: "harsha@example.com",  course: "Next.js"    },
  { id: "3", name: "Kalyani", email: "kalyani@example.com", course: "TypeScript" },
];

// ── Default Courses ──────────────────────────────────────────────────────────

export const DEFAULT_COURSES: Course[] = [
  { id: "1", name: "React JS",     duration: "8 Weeks",  fee: "5000",  category: "Frontend"  },
  { id: "2", name: "Next.js",      duration: "6 Weeks",  fee: "7000",  category: "Fullstack" },
  { id: "3", name: "TypeScript",   duration: "4 Weeks",  fee: "4500",  category: "Language"  },
  { id: "4", name: "Node.js",      duration: "10 Weeks", fee: "8000",  category: "Backend"   },
  { id: "5", name: "Tailwind CSS", duration: "3 Weeks",  fee: "3000",  category: "Frontend"  },
];

// ── Default Enrollments ──────────────────────────────────────────────────────

export const DEFAULT_ENROLLMENTS: Enrollment[] = [
  { id: "1", studentName: "Siddhi",  courseName: "React JS",   enrolledDate: "2026-06-01", status: "Active"    },
  { id: "2", studentName: "Harsha",  courseName: "Next.js",    enrolledDate: "2026-06-05", status: "Active"    },
  { id: "3", studentName: "Kalyani", courseName: "TypeScript", enrolledDate: "2026-06-10", status: "Pending"   },
  { id: "4", studentName: "Siddhi",  courseName: "Node.js",    enrolledDate: "2026-06-12", status: "Completed" },
];

// ── Default Activities ───────────────────────────────────────────────────────

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "1", type: "enrollment",  message: "Siddhi enrolled in React JS",          timestamp: "2026-06-01T10:30:00", icon: "📋" },
  { id: "2", type: "student",     message: "Harsha registered as a new student",    timestamp: "2026-06-03T09:15:00", icon: "🎓" },
  { id: "3", type: "enrollment",  message: "Harsha enrolled in Next.js",            timestamp: "2026-06-05T14:20:00", icon: "📋" },
  { id: "4", type: "course",      message: "Node.js course added to catalog",       timestamp: "2026-06-08T11:00:00", icon: "📚" },
  { id: "5", type: "enrollment",  message: "Kalyani enrolled in TypeScript",        timestamp: "2026-06-10T16:45:00", icon: "📋" },
  { id: "6", type: "completion",  message: "Siddhi completed Node.js course",       timestamp: "2026-06-12T08:30:00", icon: "🏆" },
  { id: "7", type: "student",     message: "Kalyani updated profile information",   timestamp: "2026-06-13T13:10:00", icon: "✏️" },
  { id: "8", type: "course",      message: "Tailwind CSS course fee updated",       timestamp: "2026-06-14T10:00:00", icon: "💰" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a collision-safe unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
