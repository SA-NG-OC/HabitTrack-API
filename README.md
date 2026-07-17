# HabitTrack API

HabitTrack API is a progressive, production-ready RESTful backend built with [NestJS](https://nestjs.com/) and [MongoDB](https://www.mongodb.com/) (using Mongoose). It allows users to track their daily habits, log daily check-ins, calculate timezone-independent consecutive completion streaks, and view aggregated progress statistics.

---

## 1. Tech Stack
- **Framework**: NestJS (v11.x)
- **Database**: MongoDB & Mongoose
- **Language**: TypeScript
- **Documentation**: Swagger API docs
- **Testing**: Jest & Supertest (E2E Integration Testing)
- **Containerization**: Docker & Docker Compose

---

## 2. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **Docker & Docker Compose** (optional, but recommended for local database setup)

---

## 3. Environment Variables
Copy `.env.example` to `.env` for local development:
```bash
cp .env.example .env
```
And copy `.env.test.example` to `.env.test` for testing:
```bash
cp .env.test.example .env.test
```

### Configuration Details
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://localhost:27017/habittrack` |
| `JWT_SECRET` | Secret key used to sign JWT access tokens | `super-secret-habit-track-key-2026` |
| `JWT_EXPIRES_IN` | Token expiration duration | `1d` |
| `PORT` | Application server port | `3000` |

*Note: For testing, `.env.test` defaults `MONGODB_URI` to `mongodb://localhost:27018/habittrack-test` to keep development and test databases isolated.*

---

## 4. Docker Database Setup
You can spin up local isolated dev and test MongoDB database containers using Docker:
```bash
docker-compose up -d
```
This launches two MongoDB services:
- **Development DB**: `localhost:27017`
- **Testing DB**: `localhost:27018`

---

## 5. Installation
Install the project dependencies:
```bash
npm install
```

---

## 6. Database Seeding
To populate your local development database with sample users, habits, and check-ins:
```bash
npm run seed
```
This runs the script at `scripts/seed.ts` which wipes the local database and inserts sample records:
- **John Doe** (`john@example.com` / `password123`)
- **Jane Doe** (`jane@example.com` / `password123`)
- Sample habits and check-in history.

---

## 7. Running the Application

### Development (Watch Mode)
```bash
npm run start:dev
```

### Production Build
```bash
# Build the project
npm run build

# Start the built application
npm run start:prod
```

---

## 8. Running Tests

### Unit Tests
Runs service-level unit tests (including credentials hashing and statistical calculations):
```bash
npm run test
```

### E2E Integration Tests
Runs API integration tests sequentially (`--runInBand`) against the isolated test database:
```bash
npm run test:e2e
```

---

## 9. API Documentation (Swagger)
When the application is running, you can access the interactive Swagger API documentation UI at:
```text
http://localhost:3000/api
```
This documents all endpoints (Auth, Users, Habits, Check-ins, and Stats), schemas, and response types.

---

## 10. Global Architectures
- **Consistent Response Envelope**: All successful HTTP responses are wrapped in a `{ statusCode, message, data }` structure by a global `ResponseInterceptor`.
- **Global Error Handling**: Uncaught application and MongoDB exceptions (such as validation errors and duplicate index code 11000 conflicts) are intercepted and unified into a `{ statusCode, message, error }` shape via a global `HttpExceptionFilter`.
- **Ownership Verification**: Habits and Check-in resources enforce strict ownership boundaries. Accessing or modifying someone else's resource throws a clean `404 Not Found` response instead of a 403 Forbidden to prevent leaking data existence.
