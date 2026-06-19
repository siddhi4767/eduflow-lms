# EduFlow LMS — Database Setup Guide

## Prerequisites

1. **PostgreSQL 14+** installed locally  
   - Windows: [Download installer](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql@16`
   - Ubuntu: `sudo apt install postgresql`

2. **Node.js 18+** installed

---

## Step 1: Create the Database

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE eduflow_lms;
\q
```

---

## Step 2: Configure Environment

The `.env` file in the project root contains the connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eduflow_lms"
```

Update this if your PostgreSQL uses different credentials:
- **Username**: Replace the first `postgres` with your username
- **Password**: Replace the second `postgres` with your password
- **Port**: Replace `5432` if PostgreSQL runs on a different port
- **Database**: Replace `eduflow_lms` if you chose a different name

---

## Step 3: Push Schema to Database

This creates all tables in your PostgreSQL database:

```bash
npx prisma db push
```

Expected output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Your database is now in sync with your Prisma schema.
```

---

## Step 4: Seed Demo Data

This populates the database with sample students, courses, enrollments, and activities:

```bash
npx prisma db seed
```

Expected output:
```
🌱 Seeding EduFlow LMS database...
  ✓ User: Admin User (admin)
  ✓ Student: Siddhi
  ✓ Student: Harsha
  ✓ Student: Kalyani
  ✓ Course: React JS
  ✓ Course: Next.js
  ...
✅ Seed completed successfully!
```

---

## Step 5: Verify with Prisma Studio

Open the visual database browser:

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can inspect all tables and records.

---

## Convenience Scripts

| Command | Description |
|:---|:---|
| `npm run db:push` | Sync Prisma schema → PostgreSQL |
| `npm run db:seed` | Populate demo data |
| `npm run db:studio` | Open visual database browser |
| `npm run db:reset` | Wipe database + re-seed (destructive!) |

---

## Schema Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User       │     │   Student    │     │    Course     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id     (cuid)│     │ id     (cuid)│     │ id     (cuid)│
│ name         │     │ name         │     │ name  (unique)│
│ email (uniq) │     │ email (uniq) │     │ duration     │
│ role         │     │ course       │     │ fee          │
│ createdAt    │     │ createdAt    │     │ category     │
│ updatedAt    │     │ updatedAt    │     │ createdAt    │
└──────────────┘     └──────────────┘     │ updatedAt    │
                                          └──────────────┘
┌──────────────────┐     ┌──────────────┐
│   Enrollment     │     │   Activity   │
├──────────────────┤     ├──────────────┤
│ id        (cuid) │     │ id     (cuid)│
│ studentName      │     │ type         │
│ courseName       │     │ message      │
│ enrolledDate     │     │ timestamp    │
│ status           │     │ icon         │
│ createdAt        │     │ createdAt    │
│ updatedAt        │     └──────────────┘
└──────────────────┘
```

---

## Troubleshooting

### "FATAL: password authentication failed"
→ Your PostgreSQL password doesn't match `.env`. Update `DATABASE_URL` in `.env`.

### "FATAL: database 'eduflow_lms' does not exist"
→ Run `CREATE DATABASE eduflow_lms;` in psql first.

### "Can't reach database server"
→ Ensure PostgreSQL service is running: `pg_isready`

### Prisma Client not generated
→ Run `npx prisma generate` before starting the dev server.
