# Project Overview — HabitTrack API

## 1. What We're Building

**HabitTrack API** — a backend service for tracking daily/weekly habits and check-ins, with streak calculation via MongoDB aggregation.

Users create habits (e.g. "Drink water", "Read 20 pages"), log check-ins over time, and query stats like current streak, longest streak, and completion rate.

## 2. Why This Project Fits MongoDB

This is a deliberately chosen domain to practice real MongoDB schema-design decisions, not just "CRUD with a different database":

- **Embedding vs. Referencing tradeoff:** `Habit` references `User` (many habits per user, referencing is natural), while `CheckIn` is a separate collection referenced by `habitId` rather than embedded — because check-in history grows unbounded and is queried independently (a classic case against embedding unbounded arrays in MongoDB).
- **Compound indexes:** unique index on `(habitId, date)` to prevent duplicate check-ins for the same day, plus indexes for common query patterns.
- **Aggregation pipeline:** streak and stats calculation is a great, realistic use case for `$match`, `$sort`, `$group`, and `$facet` — something relational SQL would express very differently.
- **Denormalized cache field:** `Habit.stats.currentStreak` is a cached/denormalized value updated on write — a common MongoDB pattern (trade consistency effort for read speed).

## 3. Why This Scope Fits ~6 Hours With AI

- Single bounded domain (3 collections, no complex multi-tenant logic).
- Clear vertical slices: Auth → Users → Habits → CheckIns → Stats — each completable and testable independently, which maps naturally to `task.md` checklist items and small AI-assisted iterations.
- No frontend, no third-party integrations, no payment/file-upload complexity — keeps the AI workflow (plan → implement → test → review → PR) practicable in one sitting.
- Enough depth to practice prompt engineering for debugging (auth/JWT issues), refactoring (extracting streak logic into a service), and review (aggregation pipeline correctness).

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js (LTS) |
| Framework | NestJS (TypeScript) |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (Passport.js `@nestjs/passport`, `@nestjs/jwt`) |
| Validation | `class-validator` / `class-transformer` (DTOs) |
| Docs | Swagger (`@nestjs/swagger`) |
| Testing | Jest (unit) + Supertest (e2e) |
| Local infra | Docker Compose (MongoDB container) |
| AI IDE | Antigravity (agentic build), used per the AI Development Workflow |

## 5. In Scope

- User registration & login (JWT auth), password hashing (bcrypt).
- Habit CRUD (create, list own habits, update, archive/delete) — scoped to the authenticated user.
- CheckIn create/list/delete for a habit, with duplicate-day prevention.
- `GET /habits/:id/stats` — aggregation-based current streak, longest streak, last-30-days completion rate.
- Input validation + centralized error handling (Nest exception filters).
- Swagger docs at `/api`.
- Unit tests for streak calculation logic; e2e tests for the core auth + habit + check-in flow.
- Seed script (optional, if time allows).

## 6. Out of Scope (explicitly, to protect the 6-hour budget)

- Frontend / UI.
- Social features (sharing habits, following users).
- Push notifications / reminders.
- Multi-device sync conflict resolution.
- Role-based admin panel.
- Rate limiting / production-grade observability (mention only, don't implement).

## 7. Suggested Timeboxing (6 hours)

| Phase | Time | Output |
|---|---|---|
| 1. Requirements & Plan | 30 min | Confirm scope, fill `plan.md` / `task.md` with AI |
| 2. Project scaffold + Auth module | 60 min | NestJS app boots, Mongo connects, register/login works |
| 3. Habits module | 60 min | Habit CRUD, scoped to user, validated DTOs |
| 4. CheckIns module | 60 min | Check-in create/list/delete, duplicate-day index |
| 5. Stats aggregation | 60 min | Streak + completion rate via aggregation pipeline |
| 6. Tests + Swagger + docs polish | 45 min | Unit + e2e tests passing, Swagger complete |
| 7. Review + commit history + PR prep | 25 min | Clean commits, PR description generated & reviewed |

## 8. Success Criteria

- `docker compose up` + `npm run start:dev` boots the API against local MongoDB.
- A user can register, log in, create a habit, check in on it across several days, and retrieve accurate streak stats.
- Core flows covered by automated tests, all passing.
- `README.md`, `architecture.md`, `plan.md`, `task.md`, `progress.md` all reflect the final state of the project (used as the running example for AI Context Management practice).