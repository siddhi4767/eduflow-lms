import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Eduflow LMS End-to-End API and UI Verification', () => {

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Verify All Modules via API and UI', async ({ page, request }) => {
    // ---------------------------------------------------------
    // 1. Authentication & UI Login
    // ---------------------------------------------------------
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@eduflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // ---------------------------------------------------------
    // 2. Students API & Prisma Persistence
    // ---------------------------------------------------------
    const newStudentEmail = `student_${Date.now()}@example.com`;
    const createStudentRes = await page.request.post('/api/students', {
      data: { name: 'API Test Student', email: newStudentEmail, course: 'React JS' }
    });
    expect(createStudentRes.ok()).toBeTruthy();
    
    // Verify via Prisma
    const dbStudent = await prisma.user.findUnique({ where: { email: newStudentEmail } });
    expect(dbStudent).toBeDefined();

    // ---------------------------------------------------------
    // 3. Courses API & Persistence
    // ---------------------------------------------------------
    const createCourseRes = await page.request.post('/api/courses', {
      data: { name: `Course ${Date.now()}`, duration: '12 Weeks', fee: '1000', category: 'Backend' }
    });
    expect(createCourseRes.ok()).toBeTruthy();
    const newCourse = await createCourseRes.json();

    // ---------------------------------------------------------
    // 4. Enrollments API & Persistence
    // ---------------------------------------------------------
    const createEnrollmentRes = await page.request.post('/api/enrollments', {
      data: { studentName: dbStudent?.name, courseName: newCourse.name, enrolledDate: new Date().toISOString().split('T')[0], status: 'Active' }
    });
    expect(createEnrollmentRes.ok()).toBeTruthy();

    // ---------------------------------------------------------
    // 5. Assignments API & Persistence
    // ---------------------------------------------------------
    const createAssignmentRes = await page.request.post('/api/assignments', {
      data: { title: `Assig ${Date.now()}`, courseId: newCourse.id, dueDate: new Date().toISOString() }
    });
    expect(createAssignmentRes.ok()).toBeTruthy();

    // ---------------------------------------------------------
    // 6. Quizzes API & Persistence
    // ---------------------------------------------------------
    const createQuizRes = await page.request.post('/api/quizzes', {
      data: { title: `Quiz ${Date.now()}`, duration: 30, questionsCount: 5, courseId: newCourse.id }
    });
    expect(createQuizRes.ok()).toBeTruthy();

    // ---------------------------------------------------------
    // 7. Settings API & Persistence
    // ---------------------------------------------------------
    // Update profile
    const updateProfileRes = await page.request.put('/api/profile', {
      data: { name: 'Admin User Updated', type: 'profile' }
    });
    expect(updateProfileRes.ok()).toBeTruthy();
  });
});
