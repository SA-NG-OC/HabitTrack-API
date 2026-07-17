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
- Commits: Completed and logged Git commits for Phase 0 and Phase 1.
 
 **Not done / blocked:**
- None.
 
 **Decisions made (and why):**
- Incorporate Swagger docs (`@ApiProperty`, `@ApiResponse`) directly as endpoints are developed in Phase 1 (and subsequent phases) to ensure documentation is always in sync with code.
- Clean controllers via custom Swagger decorators: Grouped API documentation decorators into custom decorator functions (e.g. `@ApiRegisterDocs()`) under a `decorators/` folder in each module to keep controllers clean and focused on routing.
- Re-used an existing local running MongoDB instance on port 27017 which simplified local configuration.
- Isolated test database: Configured e2e tests to write to `habittrack-test` database using `process.env.NODE_ENV = 'test'` and clean up automatically with `connection.dropDatabase()`.
 
 **Next session should start with:**
- Start Phase 2: Create the `Habit` schema, `HabitStats` subdocument, and CRUD endpoints in `HabitsModule` (all scoped to `req.user.id`).

---

## Ideas / Later (parked, not forgotten)

_(anything that came up mid-session but was deliberately deferred — see `task.md` "Ideas / Later" too)_