# Task List — HabitTrack API

Granular, checkable tasks mapped to the phases in `plan.md`.

Status legend:
- `[ ]` Todo
- `[~]` In Progress
- `[x]` Done
- `[!]` Blocked

# Requirements
- Create a new branch before starting a phase.
- Run npm run test, npm run start:dev, and npm run test:e2e before committing code.
---

# Phase 0 — Setup

- [x] Run `nest new habittrack-api`
- [x] Install production dependencies
  - `@nestjs/mongoose`
  - `mongoose`
  - `@nestjs/config`
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `bcrypt`
  - `class-validator`
  - `class-transformer`
  - `@nestjs/swagger`
- [x] Install development dependencies
  - `@types/passport-jwt`
  - `@types/bcrypt`
- [x] Create `docker-compose.yml` (MongoDB)
- [x] Create `.env.example`
- [x] Create local `.env` (git ignored)
- [x] Verify `.gitignore`
- [x] Configure dedicated Test Database
- [x] Add Mongo Test DB service to Docker Compose
- [x] Configure testing environment variables (`.env.test`)
- [x] Configure Jest/e2e tests to use Test DB instead of development DB
- [x] Verify `npm run start:dev`

---

# Phase 1 — Auth & Users

## User

- [x] Create `User` schema
- [x] Create `UsersModule`
- [x] Create `UsersService`

---

## POST /auth/register

- [x] Create `RegisterDto`
- [x] Implement register service
- [x] Implement register controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## POST /auth/login

- [x] Create `LoginDto`
- [x] Implement login service
- [x] Implement login controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## Authentication

- [x] Configure JWT module
- [x] Implement JwtStrategy
- [x] Implement JwtAuthGuard

---

## Unit Tests

- [x] Password hashing
- [x] JWT payload

---

- [x] Commit Phase 1

---

# Phase 2 — Habits

## Exception filter
- [ ] Create exception filter file

## Model

- [ ] Create Habit schema
- [ ] Create HabitStats subdocument
- [ ] Create indexes

---

## DTO

- [ ] CreateHabitDto
- [ ] UpdateHabitDto
- [ ] Validation decorators

---

## POST /habits

- [ ] Implement service
- [ ] Implement controller
- [ ] Always take userId from `req.user`
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## GET /habits

- [ ] Implement service
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## GET /habits/:id

- [ ] Implement service
- [ ] Ownership check (404 instead of 403)
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## PATCH /habits/:id

- [ ] Implement service
- [ ] Ownership check
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## DELETE /habits/:id

- [ ] Implement service
- [ ] Ownership check
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

- [ ] Commit Phase 2

---

# Phase 3 — CheckIns

## Model

- [ ] Create CheckIn schema
- [ ] Add unique compound index `(habitId, date)`

---

## DTO

- [ ] CreateCheckInDto
- [ ] Validate `YYYY-MM-DD`

---

## POST /habits/:id/checkins

- [ ] Implement service
- [ ] Duplicate-day returns 409
- [ ] Update HabitStats
- [ ] Implement controller
- [ ] Verify ownership
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)
- [ ] Test duplicate check-in returns 409

---

## GET /habits/:id/checkins

- [ ] Implement service
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## DELETE /habits/:id/checkins/:checkInId

- [ ] Implement service
- [ ] Update HabitStats
- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## Streak Tests

- [ ] Consecutive-day streak increments correctly
- [ ] Removing check-in recalculates streak correctly

---

- [ ] Commit Phase 3

---

# Phase 4 — Statistics

## Service

- [ ] Create StatsService
- [ ] Implement aggregation pipeline

---

## GET /habits/:id/stats

- [ ] Implement controller
- [ ] Add Swagger decorators
- [ ] Write integration test (Test DB)

---

## Unit Tests

- [ ] No check-ins → streak = 0
- [ ] Longest streak preserved after gaps
- [ ] Current streak resets correctly
- [ ] 30-day completion rate boundary cases

---

- [ ] Commit Phase 4

---

# Phase 5 — Tests, Documentation & Polish

- [ ] Configure global ValidationPipe
- [ ] Configure global exception filter
- [ ] Verify all DTOs include validation decorators
- [ ] Verify every endpoint has Swagger documentation
- [ ] Verify every endpoint has an integration test
- [ ] `npm run test`
- [ ] `npm run test:e2e`

---

- [ ] Commit Phase 5

---

# Phase 6 — Review & PR

- [ ] Remove `console.log`
- [ ] Remove unused imports
- [ ] Consistent naming
- [ ] Confirm no secrets committed
- [ ] Review AI-generated PR description
- [ ] Update README
- [ ] Update progress.md
- [ ] Open Pull Request

---

# Future Ideas (Out of Scope)

- [ ] Reminder notifications
- [ ] Habit sharing
- [ ] Rate limiting
- [ ] Admin dashboard