# EduFlow LMS — Authentication Setup Guide

## Overview

EduFlow LMS uses **NextAuth (Auth.js) v5** with Credentials provider and Prisma adapter to manage user authentication and authorization securely. Passwords are encrypted using `bcryptjs`. 

Sessions use the JWT strategy to support Next.js Edge Middleware for highly performant route protection.

---

## Technical Stack

- **Next.js 14+ App Router** 
- **NextAuth.js (Auth.js beta)**
- **Prisma Adapter** (`@auth/prisma-adapter`)
- **Bcrypt.js** for password hashing

---

## Environment Variables

Ensure `.env` contains a strong, randomly generated secret for encrypting session tokens:

```env
AUTH_SECRET="<base64-random-string>"
```

*(This was automatically generated and appended during setup).*

---

## Configuration Files

1. `auth.config.ts` — Contains Edge-compatible NextAuth configurations (callbacks, pages, session strategy). Used by Next.js Middleware.
2. `auth.ts` — The main Auth.js configuration. Imports `auth.config.ts` and adds the Prisma Adapter and Credentials provider (Node.js APIs like bcrypt/Prisma go here).
3. `middleware.ts` — Protects all application routes except static assets and the `/login` page.
4. `app/api/auth/[...nextauth]/route.ts` — Exposes Auth.js handlers.
5. `app/components/SessionProviderWrapper.tsx` — Wraps the layout in a React Context so Client Components can access session data.

---

## Authentication Flow

1. User visits a protected route (e.g. `/dashboard`).
2. Next.js Middleware (`proxy.ts` / `middleware.ts`) intercepts the request.
3. The Middleware evaluates `authorized()` callback in `auth.config.ts`.
4. If no session is found, the user is redirected to `/login`.
5. User enters credentials. The Credentials provider fetches the user via Prisma, compares the password hash with bcrypt, and issues a JWT token.
6. The `jwt()` callback injects the user's ID and Role into the token.
7. The `session()` callback exposes the ID and Role to the frontend session object.

---

## API Route Protection

API routes are automatically protected by Middleware, which intercepts requests before they hit the route handlers. Unauthenticated requests to API routes are rejected with an appropriate status code or redirection depending on the request headers.
