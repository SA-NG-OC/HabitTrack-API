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
- [x] Create an exception filter file.

## Model

- [x] Create Habit schema
- [x] Create HabitStats subdocument
- [x] Create indexes

---

## DTO

- [x] CreateHabitDto
- [x] UpdateHabitDto
- [x] Validation decorators

---

## POST /habits

- [x] Implement service
- [x] Implement controller
- [x] Always take userId from `req.user`
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## GET /habits

- [x] Implement service
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## GET /habits/:id

- [x] Implement service
- [x] Ownership check (404 instead of 403)
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## PATCH /habits/:id

- [x] Implement service
- [x] Ownership check
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## DELETE /habits/:id

- [x] Implement service
- [x] Ownership check
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

- [x] Commit Phase 2

---

# Phase 3 — CheckIns

## Model

- [x] Create CheckIn schema
- [x] Add unique compound index `(habitId, date)`

---

## DTO

- [x] CreateCheckInDto
- [x] Validate `YYYY-MM-DD`

---

## POST /habits/:id/checkins

- [x] Implement service
- [x] Duplicate-day returns 409
- [x] Update HabitStats
- [x] Implement controller
- [x] Verify ownership
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)
- [x] Test duplicate check-in returns 409

---

## GET /habits/:id/checkins

- [x] Implement service
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## DELETE /habits/:id/checkins/:checkInId

- [x] Implement service
- [x] Update HabitStats
- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## Streak Tests

- [x] Consecutive-day streak increments correctly
- [x] Removing check-in recalculates streak correctly

---

- [x] Commit Phase 3

---

# Phase 4 — Statistics

## Service

- [x] Create StatsService
- [x] Implement aggregation pipeline

---

## GET /habits/:id/stats

- [x] Implement controller
- [x] Add Swagger decorators
- [x] Write integration test (Test DB)

---

## Unit Tests

- [x] No check-ins → streak = 0
- [x] Longest streak preserved after gaps
- [x] Current streak resets correctly
- [x] 30-day completion rate boundary cases

---

- [x] Commit Phase 4

---

# Phase 5 — Final Polish & Documentation

- [x] Configure global `ValidationPipe`
- [x] Configure global exception filter
- [x] Verify all DTOs include validation decorators
- [x] Verify every endpoint has Swagger documentation
- [x] Verify every endpoint has an integration test
- [x] Create database seed script with sample data
- [x] Update `README.md (not docs\context\README.md)`
  - Project overview
  - Setup & installation
  - Environment variables
  - Docker
  - Running the application
  - Running tests
  - Swagger
  - Database seeding
- [x] `npm run test`
- [x] `npm run test:e2e`

---

- [x] Commit Phase 5

---

# Future Ideas (Out of Scope)

- [ ] Reminder notifications
- [ ] Habit sharing
- [ ] Rate limiting
- [ ] Admin dashboard