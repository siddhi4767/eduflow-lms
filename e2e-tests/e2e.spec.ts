import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Eduflow LMS End-to-End Verification', () => {

  test.beforeAll(async () => {
    // Reset database state before testing or rely on seed data
    // We will rely on seed data for now, but clean up specific test data
    await prisma.user.deleteMany({ where: { email: 'test_student@example.com' } });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Authentication - Login, Session Persistence, Logout', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);

    // Login as admin
    await page.fill('input[type="email"]', 'admin@eduflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Check UI for Admin role
    await expect(page.locator('text=Admin User')).toBeVisible();

    // Verify Session Persistence by refreshing page
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Admin User')).toBeVisible();

    // Verify Logout
    // The logout button is in QuickActions or Sidebar
    // I will try to find a logout button
    const logoutBtn = page.getByRole('button', { name: /logout/i }).or(page.locator('button:has-text("Logout")'));
    await logoutBtn.click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('2. Students - Create, View, Edit, Delete', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@eduflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to students
    await page.click('a[href="/students"]');
    await expect(page).toHaveURL(/.*students/);

    // Create student
    await page.click('button:has-text("Add Student")');
    await page.getByPlaceholder('Full Name').fill('Test Student');
    await page.getByPlaceholder('Email Address').fill('test_student@example.com');
    await page.locator('select').selectOption({ label: 'React JS' });
    await page.click('button:has-text("Create")');

    // Verify UI
    await expect(page.locator('text=Test Student')).toBeVisible();

    // Verify API/Prisma
    const dbStudent = await prisma.user.findUnique({ where: { email: 'test_student@example.com' } });
    expect(dbStudent).toBeDefined();
    expect(dbStudent?.name).toBe('Test Student');

    // ... I will add more steps for Edit and Delete
  });

  // More tests will be added...
});
