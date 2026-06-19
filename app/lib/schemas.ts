import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  course: z.string().min(1, "Course is required").optional(), // Making optional since it's just frontend meta
});

export const courseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  duration: z.string().min(1, "Duration is required"),
  fee: z.string().min(1, "Fee is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().nullable().optional(),
});

export const enrollmentSchema = z.object({
  studentName: z.string().min(1, "Student is required"),
  courseName: z.string().min(1, "Course is required"),
  enrolledDate: z.string().min(1, "Date is required"),
  status: z.enum(["Active", "Pending", "Completed", "Dropped"]).optional().default("Active"),
});

export const assignmentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  courseId: z.string().min(1, "Course ID is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const quizSchema = z.object({
  title: z.string().min(2, "Title is required"),
  courseId: z.string().min(1, "Course ID is required"),
  duration: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  questionsCount: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, "Question text is required"),
      options: z.array(z.string()).min(2, "At least 2 options are required"),
      correctAnswer: z.number().min(0),
    })
  ).optional(),
});

export const quizAttemptSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  score: z.number().min(0, "Score must be a number").optional(),
  status: z.enum(["In Progress", "Completed"]).optional(),
});

export const assignmentSubmitSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  fileUrl: z.string().optional(),
  textResponse: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
