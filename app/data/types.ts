// =============================================================================
// data/types.ts  — EduFlow LMS  |  Shared TypeScript Interfaces
//
// Every entity type used across the app lives here.
// Centralising types avoids duplicate interface declarations in each page
// and ensures type-safety when data flows through React Context.
// =============================================================================

/** Enrollment status — a union type restricting values to exactly 3 strings */
export type Status = "Active" | "Completed" | "Pending";

/** A registered student in the LMS */
export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
}

/** A course offered by the LMS */
export interface Course {
  id: string;
  name: string;
  duration: string;
  fee: string;
  category: string;
  imageUrl?: string | null;
}

/** A student ↔ course registration record */
export interface Enrollment {
  id: string;
  userId?: string;
  courseId?: string;
  studentName: string;
  courseName: string;
  enrolledDate: string; // "YYYY-MM-DD"
  status: Status;
}

/** An event in the activity feed */
export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

/** User-configurable settings (Phase 6) */
export interface Settings {
  lmsName: string;
  theme: "dark" | "light";
  profileName: string;
  profileEmail: string;
  profileRole: string;
}
