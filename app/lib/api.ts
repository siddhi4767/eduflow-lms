import { Student, Course, Enrollment, Activity } from "../data/types";

// Helper for fetch with JSON handling and basic error throwing
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "An API error occurred");
  }
  return data;
}

export const StudentService = {
  getStudents: () => fetchApi<Student[]>("/api/students"),
  addStudent: (data: Omit<Student, "id">) => fetchApi<Student>("/api/students", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id: string, data: Partial<Student>) => fetchApi<Student>(`/api/students/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteStudent: (id: string) => fetchApi<{ success: boolean }>(`/api/students/${id}`, { method: "DELETE" }),
};

export const CourseService = {
  getCourses: () => fetchApi<Course[]>("/api/courses"),
  addCourse: (data: Omit<Course, "id">) => fetchApi<Course>("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (id: string, data: Partial<Course>) => fetchApi<Course>(`/api/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCourse: (id: string) => fetchApi<{ success: boolean }>(`/api/courses/${id}`, { method: "DELETE" }),
};

export const EnrollmentService = {
  getEnrollments: () => fetchApi<Enrollment[]>("/api/enrollments"),
  addEnrollment: (data: Omit<Enrollment, "id">) => fetchApi<Enrollment>("/api/enrollments", { method: "POST", body: JSON.stringify(data) }),
  updateEnrollment: (id: string, data: Partial<Enrollment>) => fetchApi<Enrollment>(`/api/enrollments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEnrollment: (id: string) => fetchApi<{ success: boolean }>(`/api/enrollments/${id}`, { method: "DELETE" }),
};

export const ActivityService = {
  getActivities: () => fetchApi<Activity[]>("/api/activities"),
  addActivity: (data: Omit<Activity, "id">) => fetchApi<Activity>("/api/activities", { method: "POST", body: JSON.stringify(data) }),
};
