"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { Student, Course, Enrollment, Activity } from "../data/types";
import { StudentService, CourseService, EnrollmentService, ActivityService } from "../lib/api";
import { useToast } from "./ToastContext";

interface AppContextType {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  activities: Activity[];
  hydrated: boolean;

  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, s: Omit<Student, "id">) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addCourse: (c: Omit<Course, "id">) => Promise<void>;
  updateCourse: (id: string, c: Omit<Course, "id">) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  addEnrollment: (e: Omit<Enrollment, "id">) => Promise<void>;
  updateEnrollment: (id: string, e: Omit<Enrollment, "id">) => Promise<void>;
  deleteEnrollment: (id: string) => Promise<void>;

  addActivity: (type: Activity["type"], message: string, icon: string) => Promise<void>;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, cData, eData, aData] = await Promise.all([
          StudentService.getStudents(),
          CourseService.getCourses(),
          EnrollmentService.getEnrollments(),
          ActivityService.getActivities()
        ]);
        setStudents(sData);
        setCourses(cData);
        setEnrollments(eData);
        setActivities(aData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          addToast(err.message, "error");
        } else {
          addToast("Failed to load data", "error");
        }
      } finally {
        setHydrated(true);
      }
    }

    loadData();
  }, [addToast]);

  async function reloadActivities() {
    const aData = await ActivityService.getActivities();
    setActivities(aData);
  }

  async function addStudent(data: Omit<Student, "id">) {
    const newStudent = await StudentService.addStudent(data);
    setStudents((prev) => [...prev, newStudent]);
    await reloadActivities();
  }

  async function updateStudent(id: string, data: Omit<Student, "id">) {
    const updated = await StudentService.updateStudent(id, data);
    setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
    await reloadActivities();
  }

  async function deleteStudent(id: string) {
    await StudentService.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    await reloadActivities();
  }

  async function addCourse(data: Omit<Course, "id">) {
    const newCourse = await CourseService.addCourse(data);
    setCourses((prev) => [...prev, newCourse]);
    await reloadActivities();
  }

  async function updateCourse(id: string, data: Omit<Course, "id">) {
    const updated = await CourseService.updateCourse(id, data);
    setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    await reloadActivities();
  }

  async function deleteCourse(id: string) {
    await CourseService.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    await reloadActivities();
  }

  async function addEnrollment(data: Omit<Enrollment, "id">) {
    const newE = await EnrollmentService.addEnrollment(data);
    setEnrollments((prev) => [...prev, newE]);
    await reloadActivities();
  }

  async function updateEnrollment(id: string, data: Omit<Enrollment, "id">) {
    const updated = await EnrollmentService.updateEnrollment(id, data);
    setEnrollments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    await reloadActivities();
  }

  async function deleteEnrollment(id: string) {
    await EnrollmentService.deleteEnrollment(id);
    setEnrollments((prev) => prev.filter((e) => e.id !== id));
    await reloadActivities();
  }

  async function addActivity(type: Activity["type"], message: string, icon: string) {
    await ActivityService.addActivity({ type, message, timestamp: new Date().toISOString(), icon });
    await reloadActivities();
  }

  function resetAll() {
    // Only for mock purposes; practically you would do this on the backend
  }

  const value: AppContextType = {
    students,
    courses,
    enrollments,
    activities,
    hydrated,
    addStudent,
    updateStudent,
    deleteStudent,
    addCourse,
    updateCourse,
    deleteCourse,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    addActivity,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() must be used inside <AppProvider>");
  return ctx;
}
