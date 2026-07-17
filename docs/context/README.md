# HabitTrack API

A NestJS + MongoDB backend for tracking habits and daily check-ins, with streak/completion stats computed via MongoDB aggregation.

Built as a practice project for the AI-assisted development workflow (planning, context management, prompt engineering, and PR hygiene) using **Antigravity**.

## Tech Stack

- NestJS (TypeScript)
- MongoDB + Mongoose
- JWT auth (`@nestjs/passport`, `@nestjs/jwt`, `bcrypt`)
- `class-validator` / `class-transformer` for DTOs
- Swagger (`@nestjs/swagger`) at `/api`
- Jest + Supertest for unit/e2e tests
- Docker Compose for local MongoDB

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local MongoDB)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values
cp .env.example .env

# 3. Start MongoDB locally
docker compose up -d

# 4. Run the app in watch mode
npm run start:dev

# 5. Run tests
npm run test        # unit tests
npm run test:e2e     # end-to-end tests
```

App runs at `http://localhost:3000`. Swagger docs at `http://localhost:3000/api/docs`.

## Environment Variables (`.env.example`)

```
MONGODB_URI=mongodb://localhost:27017/habittrack
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1d
PORT=3000
```

> Never commit a real `.env` file. `.env` is git-ignored; only `.env.example` (with placeholder values) is tracked.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user |
| POST | `/auth/login` | Log in, receive JWT |
| GET | `/habits` | List current user's habits |
| POST | `/habits` | Create a habit |
| PATCH | `/habits/:id` | Update a habit |
| DELETE | `/habits/:id` | Delete a habit |
| POST | `/habits/:id/checkins` | Log a check-in for a habit |
| GET | `/habits/:id/checkins` | List check-ins for a habit |
| DELETE | `/habits/:id/checkins/:checkinId` | Remove a check-in |
| GET | `/habits/:id/stats` | Current streak, longest streak, completion rate |

Full request/response schemas are documented in Swagger once the app is running.

## Project Context Files

This project maintains the following files so an AI coding agent (or a new contributor) can pick up work across sessions without re-explaining context:

- [`architecture.md`](./architecture.md) — module structure, data flow, key design decisions
- [`plan.md`](./plan.md) — phased build plan and milestones
- [`task.md`](./task.md) — granular, checkable task list
- [`progress.md`](./progress.md) — session-by-session log of what was done and what's next

Start any new AI session by pointing it at `progress.md` and `task.md` first.

## License

For learning/practice purposes only.