import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data to avoid conflicts on re-seed
  await prisma.activity.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // Create an Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@eduflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create a Tutor user
  const tutorPassword = await bcrypt.hash('tutor123', 10)
  const tutor = await prisma.user.create({
    data: {
      name: 'Tutor User',
      email: 'tutor@eduflow.com',
      password: tutorPassword,
      role: 'TUTOR',
    },
  })

  // Create a Student user
  const studentPassword = await bcrypt.hash('student123', 10)
  const student1 = await prisma.user.create({
    data: {
      name: 'Siddhi',
      email: 'siddhi@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })
  
  const student2 = await prisma.user.create({
    data: {
      name: 'Harsha',
      email: 'harsha@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  // Create courses with images
  const reactCourse = await prisma.course.create({
    data: {
      name: 'React JS',
      duration: '8 Weeks',
      fee: '5000',
      category: 'Frontend',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    },
  })

  const nodeCourse = await prisma.course.create({
    data: {
      name: 'Next.js',
      duration: '6 Weeks',
      fee: '7000',
      category: 'Fullstack',
      imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop',
    },
  })

  const uiuxCourse = await prisma.course.create({
    data: {
      name: 'UI/UX Design',
      duration: '4 Weeks',
      fee: '4500',
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
    },
  })

  const devopsCourse = await prisma.course.create({
    data: {
      name: 'DevOps Basics',
      duration: '10 Weeks',
      fee: '8000',
      category: 'Backend',
      imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop',
    },
  })

  // Create enrollments
  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: reactCourse.id,
      enrolledDate: new Date('2026-06-01').toISOString(),
      status: 'Active',
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: nodeCourse.id,
      enrolledDate: new Date('2026-06-12').toISOString(),
      status: 'Completed',
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: reactCourse.id,
      enrolledDate: new Date('2026-06-05').toISOString(),
      status: 'Active',
    },
  })

  // Create Activities
  await prisma.activity.create({
    data: {
      type: 'course',
      message: 'React JS course updated with new materials.',
      icon: '📚',
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
