# EduFlow LMS — Deployment Preparation Guide

## Current Status

The application is fully configured for a **PostgreSQL + Prisma** backend. Before deploying to a cloud provider, you need to provision a production database and configure environment variables.

---

## Step 1: Choose a Database Provider

| Provider | Free Tier | Best For |
|:---|:---|:---|
| **Neon** | 0.5 GB, always-on | Hobby/portfolio projects |
| **Supabase** | 500 MB, 2 projects | Full Postgres with dashboard |
| **Vercel Postgres** | 256 MB | Tight Vercel integration |
| **Railway** | $5 credit/month | Quick prototyping |
| **AWS RDS** | 12 months free tier | Enterprise/production |

### Recommended for Portfolio: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → name it `eduflow-lms`
3. Copy the connection string (it looks like):
   ```
   postgresql://user:pass@ep-something.us-east-2.aws.neon.tech/eduflow_lms?sslmode=require
   ```

---

## Step 2: Deploy to Vercel

### 2a. Push to GitHub

```bash
git add .
git commit -m "feat: add Prisma + PostgreSQL backend"
git push origin main
```

### 2b. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add the environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your production database connection string

### 2c. Build Settings

Vercel automatically detects Next.js. The `postinstall` script in `package.json` ensures `prisma generate` runs during every build:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

No additional build configuration is needed.

---

## Step 3: Initialize Production Database

After deployment, run the schema push against your production database:

```bash
# Set the production DATABASE_URL temporarily
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx prisma db push
```

Then seed the production database:

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx prisma db seed
```

Or use the Vercel CLI:

```bash
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

---

## Environment Variables Checklist

| Variable | Required | Description |
|:---|:---|:---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NODE_ENV` | Auto | Set by Vercel to `production` |

---

## Pre-Deployment Checklist

- [ ] PostgreSQL database created and accessible
- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] `npx prisma db push` run against production database
- [ ] `npx prisma db seed` run to populate demo data
- [ ] `npm run build` passes locally with zero errors
- [ ] `.env` is in `.gitignore` (already configured)
- [ ] All CRUD operations tested locally against PostgreSQL

---

## Post-Deployment Verification

After deploying, verify these endpoints respond correctly:

```
GET  https://your-app.vercel.app/api/students
GET  https://your-app.vercel.app/api/courses
GET  https://your-app.vercel.app/api/enrollments
GET  https://your-app.vercel.app/api/activities
```

Then navigate to:
- `/dashboard` — Statistics should show real data
- `/students` — CRUD operations should persist
- `/courses` — CRUD operations should persist
- `/enrollment` — CRUD operations should persist

---

## Future Enhancements (Not Yet Implemented)

- **Authentication**: Replace mock `jose` JWT with NextAuth.js / Auth.js
- **Migrations**: Switch from `prisma db push` to `prisma migrate` for version-controlled schema changes
- **Connection Pooling**: Use PgBouncer or Prisma Accelerate for high-traffic deployments
- **Monitoring**: Add Sentry for error tracking
