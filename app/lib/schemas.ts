import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  course: z.string().min(1, "Course is required"),
});

export const courseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  duration: z.string().min(1, "Duration is required"),
  fee: z.string().min(1, "Fee is required"),
  category: z.string().min(1, "Category is required"),
});

export const enrollmentSchema = z.object({
  studentName: z.string().min(1, "Student is required"),
  courseName: z.string().min(1, "Course is required"),
  enrolledDate: z.string().min(1, "Date is required"),
  status: z.enum(["Active", "Pending", "Completed"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
