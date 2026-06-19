# EduFlow LMS — API Architecture

## Overview

The API follows the **Backend-For-Frontend (BFF)** pattern using Next.js App Router Route Handlers. All endpoints are server-side only, accessible at `/api/*`, and communicate with PostgreSQL through the Prisma ORM.

The client-side service layer (`app/lib/api.ts`) remains unchanged — it sends the same HTTP requests as before. Only the server-side implementation behind those endpoints has been swapped from JSON-file I/O to Prisma database queries.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER (Client Components)                                │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ Dashboard    │   │ Students Page│   │ Courses/Enroll  │  │
│  └──────┬──────┘   └──────┬───────┘   └──────┬──────────┘  │
│         │                 │                   │             │
│         └─────────┬───────┘───────────────────┘             │
│                   ▼                                         │
│          ┌────────────────┐                                 │
│          │  AppContext.tsx │  (React Context — single source)│
│          └───────┬────────┘                                 │
│                  ▼                                          │
│          ┌────────────────┐                                 │
│          │  lib/api.ts    │  (fetch wrappers — unchanged)   │
│          └───────┬────────┘                                 │
└──────────────────┼──────────────────────────────────────────┘
                   │  HTTP (GET/POST/PATCH/DELETE)
┌──────────────────┼──────────────────────────────────────────┐
│  SERVER (Next.js Route Handlers)                            │
│                  ▼                                          │
│          ┌────────────────┐                                 │
│          │ app/api/*      │  (route.ts files)               │
│          │  └─ Zod valid. │                                 │
│          └───────┬────────┘                                 │
│                  ▼                                          │
│          ┌────────────────┐                                 │
│          │ lib/prisma.ts  │  (Prisma Client singleton)      │
│          └───────┬────────┘                                 │
└──────────────────┼──────────────────────────────────────────┘
                   │  SQL
                   ▼
          ┌────────────────┐
          │  PostgreSQL    │
          │  eduflow_lms   │
          └────────────────┘
```

---

## Endpoint Reference

### Students (`/api/students`)

| Method | Path | Description | Request Body | Response |
|:---|:---|:---|:---|:---|
| `GET` | `/api/students` | List all students | — | `Student[]` |
| `POST` | `/api/students` | Create a student | `{ name, email, course }` | `Student` (201) |
| `PATCH` | `/api/students/:id` | Update a student | `Partial<Student>` | `Student` |
| `DELETE` | `/api/students/:id` | Delete a student | — | `{ success: true }` |

### Courses (`/api/courses`)

| Method | Path | Description | Request Body | Response |
|:---|:---|:---|:---|:---|
| `GET` | `/api/courses` | List all courses | — | `Course[]` |
| `POST` | `/api/courses` | Create a course | `{ name, duration, fee, category }` | `Course` (201) |
| `PATCH` | `/api/courses/:id` | Update a course | `Partial<Course>` | `Course` |
| `DELETE` | `/api/courses/:id` | Delete a course | — | `{ success: true }` |

### Enrollments (`/api/enrollments`)

| Method | Path | Description | Request Body | Response |
|:---|:---|:---|:---|:---|
| `GET` | `/api/enrollments` | List all enrollments | — | `Enrollment[]` |
| `POST` | `/api/enrollments` | Create an enrollment | `{ studentName, courseName, enrolledDate, status }` | `Enrollment` (201) |
| `PATCH` | `/api/enrollments/:id` | Update an enrollment | `Partial<Enrollment>` | `Enrollment` |
| `DELETE` | `/api/enrollments/:id` | Delete an enrollment | — | `{ success: true }` |

### Activities (`/api/activities`)

| Method | Path | Description | Request Body | Response |
|:---|:---|:---|:---|:---|
| `GET` | `/api/activities` | List all activities (newest first) | — | `Activity[]` |
| `POST` | `/api/activities` | Create an activity | `{ type, message, icon? }` | `Activity` (201) |

---

## Error Handling

All endpoints return errors in a consistent shape:

```json
{
  "error": "Human-readable error message"
}
```

- **400** — Validation error (Zod) or bad request
- **404** — Resource not found (Prisma `RecordNotFound`)
- **500** — Internal server error (database connection issue)

---

## Validation

Request bodies are validated using **Zod schemas** defined in `app/lib/schemas.ts`:

- `studentSchema` — validates `name` (min 2), `email` (valid format), `course` (required)
- `courseSchema` — validates `name` (min 2), `duration`, `fee`, `category`
- `enrollmentSchema` — validates `studentName`, `courseName`, `enrolledDate`, `status` (enum)

PATCH endpoints use `.partial()` to allow updating individual fields.

---

## Data Layer

| Component | File | Purpose |
|:---|:---|:---|
| Prisma Client | `app/lib/prisma.ts` | Singleton connection to PostgreSQL |
| Prisma Schema | `prisma/schema.prisma` | Database model definitions |
| Seed Script | `prisma/seed.ts` | Demo data population |
| Zod Schemas | `app/lib/schemas.ts` | Request validation (shared with frontend) |
