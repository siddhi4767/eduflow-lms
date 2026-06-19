# EduFlow LMS — Role Permissions Matrix

## Overview
EduFlow LMS implements Role-Based Access Control (RBAC) via Next.js Middleware and Auth.js. Roles are embedded into the secure session JWT upon login.

| Feature | Admin | Instructor | Student |
| :--- | :---: | :---: | :---: |
| **Login / Logout** | ✅ | ✅ | ✅ |
| **View Dashboard** | ✅ | ✅ | ✅ |
| **Manage Students** | ✅ | ❌ | ❌ |
| **Manage Courses** | ✅ | ✅ | ❌ |
| **Manage Enrollments** | ✅ | ✅ | ❌ |
| **View Own Enrollments** | ✅ | ✅ | ✅ |
| **Access Settings** | ✅ | ❌ | ❌ |

---

## Technical Enforcement

Access control logic is implemented centrally in `auth.config.ts` within the `authorized` callback.

### Admin
- Bypasses all restrictions.
- `if (role === "admin") return true;`

### Instructor
- Can view Dashboard, Courses, and Enrollments.
- Cannot access `/settings` (or `/students` if restricted).
- ```typescript
  if (role === "instructor") {
    if (nextUrl.pathname.startsWith("/settings")) return false;
    return true;
  }
  ```

### Student
- Can view Dashboard.
- Can view their own enrollments.
- Cannot access `/students`, `/courses`, or `/settings`.
- ```typescript
  if (role === "student") {
    if (nextUrl.pathname.startsWith("/students") || nextUrl.pathname.startsWith("/courses")) return false;
    return true;
  }
  ```

---

## Future Extensibility

To restrict UI elements dynamically (e.g. hiding an "Edit" button if the user is a student):
1. Wrap the layout with `<SessionProvider>`.
2. Use the `useSession()` hook in Client Components.
3. Conditionally render the element:
   ```tsx
   const { data: session } = useSession();
   if (session?.user?.role !== 'admin') return null;
   ```
