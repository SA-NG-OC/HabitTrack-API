# Progress Log — HabitTrack API

Read this file **first** at the start of every session (human or AI). It's the single source of truth for "what actually happened," which may drift from `plan.md` (the intent) over time — this file records reality.

Log format per session:

```
## Session N — YYYY-MM-DD (duration)

**Goal for this session:**
-

**Done:**
-

**Not done / blocked:**
-

**Decisions made (and why):**
-

**Next session should start with:**
-
```

---

## Session 1 — 2026-07-17
 
 **Goal for this session:**
- Complete Phase 0 (setup) and Phase 1 (auth with Swagger docs) from `plan.md`.
 
 **Done:**
- Setup the implementation plan and aligned on incorporating Swagger decorators into the API endpoints as we build them.
- Completed Phase 0 (Setup): Scaffolded NestJS application in the workspace root, installed all project dependencies, configured MongoDB Docker Compose and local connections, created `.env` / `.env.example`, and verified workspace `.gitignore`.
- Configured dedicated Test Database: Added `mongodb-test` service to `docker-compose.yml` (on port `27018`), created `.env.test` & `.env.test.example`, and configured NestJS `AppModule` to dynamically load `.env.test` during e2e testing.
- Completed Phase 1 (Auth & Users): Implemented Mongoose `User` schema, `UsersModule`, and `UsersService`. Created `RegisterDto` and `LoginDto` with `class-validator` rules. Developed `AuthService` and `AuthController` with `/auth/register` and `/auth/login` endpoints. Created `JwtStrategy`, `JwtAuthGuard`, and `CurrentUser` custom decorator.
- Implemented Custom Swagger Decorators Pattern: Extracted Swagger metadata from `AuthController` into module-specific decorators under `src/auth/decorators/auth-swagger.decorator.ts` to keep controllers clean.
- Integration Testing: Created end-to-end integration tests in `test/auth.e2e-spec.ts` for all registration and login success/failure paths, utilizing validation pipes and database isolation.
- Tested: Added comprehensive unit tests in `auth.service.spec.ts` for password hashing, credentials comparison, and JWT payload properties. Verified that both unit tests and e2e tests pass (8 tests total).
- Implemented Global Response Interceptor: Added `ResponseInterceptor` at `src/common/interceptors/response.interceptor.ts` and registered it globally in `src/main.ts` to wrap successful responses in a standard JSON envelope: `{ statusCode, message, data }`.
- Login payload enhancement: Updated the login function to return `{ user, accessToken }` (filtering out the `passwordHash` field).
- Aligned tests & Swagger docs: Updated the custom Swagger decorators, unit tests, and e2e integration tests to support the response envelop and the new login return structure.
- Commits: Completed and logged Git commits for Phase 0 and Phase 1.
 
 **Not done / blocked:**
- None.
 
 **Decisions made (and why):**
- Incorporate Swagger docs (`@ApiProperty`, `@ApiResponse`) directly as endpoints are developed in Phase 1 (and subsequent phases) to ensure documentation is always in sync with code.
- Clean controllers via custom Swagger decorators: Grouped API documentation decorators into custom decorator functions (e.g. `@ApiRegisterDocs()`) under a `decorators/` folder in each module to keep controllers clean and focused on routing.
- Re-used an existing local running MongoDB instance on port 27017 which simplified local configuration.
- Isolated test database: Configured e2e tests to write to `habittrack-test` database using `process.env.NODE_ENV = 'test'` and clean up automatically with `connection.dropDatabase()`.
 
 **Next session should start with:**
- Completed Phase 2 in Session 2.

---

## Session 2 — 2026-07-17

**Goal for this session:**
- Complete Phase 2 (Habits Module CRUD, Exception Filter, and Split Swagger Decorators) from `plan.md`.

**Done:**
- Created `HttpExceptionFilter` at `src/common/filters/http-exception.filter.ts` to cleanly format NestJS & MongoDB exceptions, and registered it globally.
- Created `Habit` Mongoose schema and `HabitStats` subdocument at `src/habits/schemas/habit.schema.ts` with required indexes.
- Created DTOs (`CreateHabitDto` and `UpdateHabitDto`) with proper validations and Swagger property annotations.
- Implemented individual custom Swagger decorators for each habits endpoint under `src/habits/decorators/`.
- Implemented `HabitsService` and `HabitsController` handling CRUD operations with strict user ownership checks (returning 404 for unauthorized accesses).
- Wired `HabitsModule` to the main `AppModule`.
- Created comprehensive integration tests inside `test/habits.e2e-spec.ts`.
- Configured sequentially-run test scripts (`--runInBand`) in `package.json` to prevent database drop collisions.
- Verified that all unit and e2e integration tests pass (20 tests total).
- Commits: Staged and committed changes (`feat: implement habits CRUD module and global HttpExceptionFilter`).

**Not done / blocked:**
- None.

**Decisions made (and why):**
- Split Swagger decorators: Kept decorators separated into file-per-api structure to avoid bloating a single module-wide decorator file.
- Redundant index removal: Handled type reflection issues with `string | null` in Mongoose and avoided duplicate indexing warnings.
- Sequential tests (`--runInBand`): Modified the `test:e2e` script to execute test suites sequentially to prevent parallel database dropping collisions on the shared local test DB.

 **Next session should start with:**
- Completed Phase 3 in Session 3.

---

## Session 3 — 2026-07-17

**Goal for this session:**
- Complete Phase 3 (CheckIns Module & Streak Recalculation logic) from `plan.md`.

**Done:**
- Created Git branch `feat/checkins` to begin Phase 3.
- Created `CheckIn` model schema inside `src/checkins/schemas/checkin.schema.ts` with compound unique index `{ habitId: 1, date: 1 }` to prevent double check-in per day, and `{ habitId: 1, date: -1 }` for query sorting. Used definite assignment operator `!` for properties.
- Developed `CreateCheckInDto` validating `YYYY-MM-DD` date strings.
- Implemented split Swagger decorator files for each endpoint inside `src/checkins/decorators/`.
- Coded streak calculation algorithm at `src/checkins/utils/streak-calculator.ts` with UTC date diff helpers to handle gaps, consecutive increments, and historical streak caching.
- Coded `CheckInsService` validating habit ownership (throwing 404 for wrong habits) and catching double check-in exceptions to throw `409 Conflict`.
- Coded `CheckInsController` mapping nested `/habits/:id/checkins` endpoints protected by JWT strategy.
- Created `CheckInsModule` and registered it in `AppModule`.
- Created comprehensive integration e2e tests inside `test/checkins.e2e-spec.ts`.
- Verified all 29 tests across 4 test suites pass successfully.
- Commits: Staged and committed changes (`feat: implement check-ins module and streak calculations with consecutive-day and gap handlers`).

**Not done / blocked:**
- None.

**Decisions made (and why):**
- Strict Type definite assignment (`!`): Added `!` definite assignment assertions to properties in check-in schemas/DTOs to strictly satisfy TypeScript strict properties validation rules.
- UTC Streak Date comparison: Utilized `Date.UTC` calculations inside `streak-calculator.ts` on `YYYY-MM-DD` strings to eliminate timezone offset ambiguities when counting consecutive days.

**Next session should start with:**
- Start Phase 4: Create the `StatsService` or stats calculation logic to aggregate completion rates, count check-ins by category, and generate history reports.

---

## Ideas / Later (parked, not forgotten)

_(anything that came up mid-session but was deliberately deferred — see `task.md` "Ideas / Later" too)_