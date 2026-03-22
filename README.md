# LearnHub LMS

Full-stack learning management system: **Next.js 14 (App Router) + TailwindCSS** frontend, **Express + TypeScript** API with **MVC-style modules** (routes → controllers → services → repositories), and **MySQL** storage. Lessons are embedded YouTube videos with **sequential unlocks**, **auto-enrollment** on first subject access, and **progress** (resume + ≥90% completion).

## Prerequisites

- Node.js 18+
- MySQL 8 (local or Docker)

## 1. Database

From the `lms` folder, start MySQL (example):

```bash
docker compose up -d
```

Configure the backend environment and apply schema + seed data:

```bash
cd backend
cp .env.example .env
# Default for the compose file above:
# DATABASE_URL=mysql://root:password@localhost:3306/lms
# Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to long random strings.
npm install
npm run db:init
```

Schema tables: `users`, `subjects`, `sections`, `videos`, `enrollments`, `video_progress`, `refresh_tokens` (see `backend/src/schema.sql`).

## 2. API

```bash
cd backend
npm run dev
```

- Health: `GET http://localhost:4000/api/health`
- Auth: register, login, refresh (httpOnly cookie), logout
- Access JWT (15m) in JSON; refresh JWT (30d) stored **hashed** in DB and sent as **httpOnly** cookie (`path=/api/auth`)

## 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Use **Subjects** → open a subject → **Sign in to learn** or **Start learning** → watch with autosave (~8s), pause/end saves, **Previous / Next** navigation, locked lessons in the sidebar until the prior video is completed.

## API summary

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Body: `email`, `password`, `name` → `{ accessToken, user }` + refresh cookie |
| POST | `/api/auth/login` | Same |
| POST | `/api/auth/refresh` | Uses refresh cookie → `{ accessToken }` |
| POST | `/api/auth/logout` | Revokes refresh row, clears cookie |
| GET | `/api/auth/me` | Bearer access token → user profile |
| GET | `/api/subjects` | Published subjects |
| GET | `/api/subjects/:subjectId` | Optional Bearer → auto-enroll |
| GET | `/api/subjects/:subjectId/tree` | Nested sections/videos + `locked` / `completed` |
| GET | `/api/subjects/:subjectId/first-video` | `{ videoId }` |
| GET | `/api/videos/:videoId` | Bearer required; 403 if locked |
| GET/POST | `/api/progress/videos/:videoId` | Bearer; POST body: `last_position_seconds`, optional `duration_seconds` |
| GET | `/api/progress/subjects/:subjectId` | Bearer |
| GET | `/api/health` | Liveness |

## Project layout

```
backend/src
  app.ts, server.ts
  config/          # env, mysql pool
  middleware/      # auth JWT, centralized errors
  modules/
    auth/          # JWT + refresh persistence
    users/
    subjects/      # subjects + enrollments + tree
    sections/      # placeholder barrel (queries live with subjects)
    videos/
    progress/
    health/
  utils/           # passwords, youtube id parsing, token hash
  schema.sql, seed.sql

frontend/
  app/             # App Router pages (login, register, subjects, video, profile)
  components/      # Sidebar, VideoPlayer, auth forms, RequireAuth
  lib/api-client.ts # Axios + withCredentials + refresh interceptor
  contexts/        # Auth state
```

## Production notes

- Use strong `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, real MySQL credentials, and HTTPS.
- Set `COOKIE_SECURE=true` and align `CORS_ORIGIN` with the deployed site URL.
- Run `npm run build` then `npm start` for both apps.
