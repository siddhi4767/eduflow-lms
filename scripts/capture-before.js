const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const outDir = path.join(process.env.APPDATA || process.env.HOME || '.', '.gemini', 'antigravity-ide', 'brain', '438438ec-17f3-494e-a485-458450e022ab', 'artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // 1. Login Page
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_login.png') });

    // Login
    await page.fill('input[type="email"]', 'admin@eduflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // 2. Dashboard
    await page.screenshot({ path: path.join(outDir, 'before_dashboard.png') });

    // 3. Students
    await page.goto('http://localhost:3000/students');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_students.png') });

    // 4. Courses
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_courses.png') });

    // 5. Enrollments
    await page.goto('http://localhost:3000/enrollment');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_enrollments.png') });

    // 6. Assignments
    await page.goto('http://localhost:3000/assignments');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_assignments.png') });

    // 7. Quizzes
    await page.goto('http://localhost:3000/quizzes');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_quizzes.png') });

    // 8. Settings
    await page.goto('http://localhost:3000/settings');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'before_settings.png') });

    console.log("Successfully captured all BEFORE screenshots.");
  } catch (e) {
    console.error("Error capturing screenshots:", e);
  } finally {
    await browser.close();
  }
})();
