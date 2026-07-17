# Build Plan — HabitTrack API

Goal: ship a working NestJS + MongoDB habit-tracking API, end to end, in a single ~6-hour AI-assisted session. This plan is the reference an AI agent (or you) should re-read at the start of every session, alongside `task.md` and `progress.md`.

## Guiding Principles for This Session

- Work in **small, reviewable increments** — one module at a time, reviewed before moving on.
- After each phase: run the app, run tests, **commit**.
- Update `task.md` (check off items) and `progress.md` (log what happened) at the end of every phase, not just at the end of the day.
- If AI suggests scope beyond what's in `project-overview.md`, defer it — note it in `progress.md` under "Ideas / Later" instead of building it now.

## Phases

### Phase 0 — Setup (target: 15–30 min)
- Confirm scope against `project-overview.md`.
- Scaffold NestJS project (`nest new`), add Mongoose, Swagger, class-validator, JWT deps.
- Add `docker-compose.yml` for local MongoDB.
- Add `.env.example`, `.gitignore` (must ignore `.env`, `node_modules`, `dist`).
- Commit: `chore: scaffold NestJS project with Mongo + Swagger`.

### Phase 1 — Auth & Users (target: ~60 min)
- `User` schema (see `schemas.md`).
- `AuthModule`: register (hash password with bcrypt), login (issue JWT).
- `JwtStrategy` + `JwtAuthGuard` for protecting routes.
- Unit tests: password hashing, JWT payload shape.
- Commit: `feat: add auth module with JWT`.

### Phase 2 — Habits Module (target: ~60 min)
- `Habit` schema + indexes.
- CRUD endpoints, all scoped to `req.user.id` (never trust a `userId` from the request body).
- DTO validation (title required, length limits, enum for frequency).
- e2e test: create → list → update → archive habit.
- Commit: `feat: add habits CRUD scoped to authenticated user`.

### Phase 3 — CheckIns Module (target: ~60 min)
- `CheckIn` schema + unique `(habitId, date)` index.
- Create/list/delete check-in endpoints, verifying the habit belongs to the requesting user.
- Update `Habit.stats` (currentStreak/longestStreak/lastCheckInDate) on check-in create/delete.
- Handle duplicate-day check-in with a clean 409, not a raw Mongo error.
- Commit: `feat: add check-ins with duplicate-day protection`.

### Phase 4 — Stats Aggregation (target: ~60 min)
- `GET /habits/:id/stats`: aggregation pipeline for completion rate (last 30 days) + streak numbers cross-checked against the cached `Habit.stats`.
- Unit tests for streak calculation with edge cases: no check-ins, single check-in, broken streak, streak spanning "today".
- Commit: `feat: add stats endpoint with aggregation pipeline`.

### Phase 5 — Final Polish & Project Completion (target: ~60 min)

- Ensure all tests pass cleanly:
  - `npm run test`
  - `npm run test:e2e`
- Configure global `ValidationPipe` and global exception filter if needed.
- Create a database seed script with sample users, habits, and check-ins for local development.
- Update `README.md` with:
  - Project overview
  - Tech stack
  - Prerequisites
  - Environment variables
  - Docker setup
  - Installation
  - Running the project
  - Running tests
  - API documentation (Swagger)
  - Seeding the database
- Update `progress.md` and `task.md`.
- Commit: `docs: finalize project documentation and setup`

## Definition of Done

- All endpoints in `project-overview.md` §5 implemented and manually verified via Swagger.
- `npm run test` and `npm run test:e2e` pass.
- No secrets committed; `.env` is git-ignored.
- Context files (`README.md`, `architecture.md`, `task.md`, `progress.md`) reflect the final state.