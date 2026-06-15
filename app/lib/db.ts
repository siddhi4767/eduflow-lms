import fs from "fs";
import path from "path";
import type { Student, Course, Enrollment, Activity } from "../data/types";
import { DEFAULT_STUDENTS, DEFAULT_COURSES, DEFAULT_ENROLLMENTS, DEFAULT_ACTIVITIES } from "../data/store";

const dbPath = path.join(process.cwd(), "data", "db.json");

export interface DatabaseSchema {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  activities: Activity[];
}

// Ensure the db file exists with default data
export function initDb() {
  if (!fs.existsSync(dbPath)) {
    const defaultData: DatabaseSchema = {
      students: DEFAULT_STUDENTS,
      courses: DEFAULT_COURSES,
      enrollments: DEFAULT_ENROLLMENTS,
      activities: DEFAULT_ACTIVITIES,
    };
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  }
}

// Read database
export function getDb(): DatabaseSchema {
  initDb();
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error("Failed to read DB:", error);
    return {
      students: [],
      courses: [],
      enrollments: [],
      activities: [],
    };
  }
}

// Write database
export function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save DB:", error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
