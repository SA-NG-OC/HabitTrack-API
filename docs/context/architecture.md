# Architecture — HabitTrack API

## 1. High-Level Overview

A single NestJS application, four feature modules on top of MongoDB via Mongoose. No microservices, no message queue — deliberately simple to fit the 6-hour scope.

```
Client
  │
  ▼
NestJS App (single process)
  ├─ AuthModule      (JWT issuing/verification, register/login)
  ├─ UsersModule     (user CRUD, used internally by AuthModule)
  ├─ HabitsModule     (habit CRUD, owned by user)
  └─ CheckInsModule   (check-ins per habit, streak/stats update)
        │
        ▼
    MongoDB (users, habits, checkins collections)
```

## 2. Folder Structure

```
src/
├── main.ts                     # bootstrap, global pipes/filters, Swagger setup
├── app.module.ts                # root module, ConfigModule + MongooseModule.forRoot
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── guards/jwt-auth.guard.ts
│   └── decorators/current-user.decorator.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/jwt.strategy.ts
│   ├── decorators/auth-swagger.decorator.ts
│   └── dto/{register.dto.ts,login.dto.ts}
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── schemas/user.schema.ts
├── habits/
│   ├── habits.module.ts
│   ├── habits.controller.ts
│   ├── habits.service.ts
│   ├── schemas/habit.schema.ts
│   ├── decorators/habits-swagger.decorator.ts
│   └── dto/{create-habit.dto.ts,update-habit.dto.ts}
└── checkins/
    ├── checkins.module.ts
    ├── checkins.controller.ts
    ├── checkins.service.ts
    ├── stats.service.ts
    ├── schemas/checkin.schema.ts
    ├── decorators/checkins-swagger.decorator.ts
    └── dto/create-checkin.dto.ts
```

## 3. Request Flow Examples

### Create a check-in
```
POST /habits/:id/checkins
  → JwtAuthGuard verifies token, attaches req.user
  → CheckInsController.create(habitId, dto, user)
  → CheckInsService.create():
      1. Verify habit exists AND habit.userId === user.id (else 404)
      2. Insert CheckIn (unique index catches same-day duplicate → map to 409)
      3. Recalculate streak (read recent check-ins, sorted by date desc)
      4. Update Habit.stats (currentStreak, longestStreak, lastCheckInDate)
      5. Return created CheckIn
```

### Get stats
```
GET /habits/:id/stats
  → JwtAuthGuard + ownership check (same pattern as above)
  → StatsService.getStats(habitId):
      1. Aggregation: check-ins in last 30 days → completion rate
      2. Read Habit.stats for currentStreak/longestStreak (cached, kept in sync on write)
      3. Return HabitStatsResponse
```

## 4. Key Design Decisions

| Decision | Rationale |
|---|---|
| `CheckIn` is its own collection, not embedded in `Habit` | Check-in history is unbounded and queried independently (by date range) — embedding an ever-growing array in `Habit` would hurt document size and query performance over time. |
| `Habit.stats` is a denormalized cache | Avoids recomputing streaks on every read of the habit list; kept in sync on every check-in write. Can always be rebuilt from `checkins` if it ever drifts. |
| `date` stored as `'YYYY-MM-DD'` string | Avoids timezone ambiguity when comparing "is this the next consecutive day" — string comparison/sorting is exact and simple. |
| Ownership enforced by `userId` from JWT, never from request body | Prevents IDOR (a user passing another user's `habitId`/`userId` to access data they don't own). |
| 404 instead of 403 on unauthorized access to another user's habit | Avoids leaking existence of a resource the requester doesn't own. |
| Streak calculation done in application code, not entirely in the aggregation pipeline | Sequential "is this consecutive" logic is awkward to express purely in Mongo's pipeline; pulling sorted dates and looping in TS is clearer and easier to unit test. |
| Clean controllers via custom Swagger decorators | To prevent NestJS controllers from becoming bloated with metadata, Swagger API documentation decorators are grouped into module-specific custom decorators (e.g. `@ApiRegisterDocs()`) under a `decorators/` folder in each module. |

## 5. Error Handling

- Global `ValidationPipe` rejects unknown/invalid fields at the DTO boundary.
- Global exception filter maps thrown `HttpException`s (and known Mongo errors, e.g. duplicate key `E11000`) to a consistent JSON error shape: `{ statusCode, message, error }`.
- Service layer throws Nest's built-in exceptions (`NotFoundException`, `ConflictException`, `UnauthorizedException`) rather than returning ad-hoc error objects.

## 6. Security Notes

- Passwords hashed with bcrypt (never stored/logged in plaintext).
- JWT secret loaded from `.env` via `@nestjs/config`, never hardcoded.
- All habit/check-in routes require a valid JWT and are scoped to `req.user.id`.
- CORS, rate limiting, and helmet-style hardening are noted as **future work**, not implemented in this 6-hour scope.

## 7. Testing Strategy

- **Unit tests:** pure logic that's easy to isolate — streak calculation, password hashing, JWT payload shape.
- **e2e tests:** full HTTP flow through Supertest against a test MongoDB (or `mongodb-memory-server`) — register → login → create habit → check in → get stats.