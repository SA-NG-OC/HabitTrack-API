# Data Schemas — HabitTrack API

Three collections: `users`, `habits`, `checkins`. Mongoose (NestJS `@Schema()` style) definitions below, plus indexes and key DTO shapes.

---

## 1. User

```ts
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
```

**Notes:**
- `passwordHash` — bcrypt hash, never store or log plaintext password.
- `timestamps: true` auto-adds `createdAt` / `updatedAt`.

---

## 2. Habit

```ts
// habit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Schema({ _id: false })
class HabitStats {
  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: null })
  lastCheckInDate: string | null; // 'YYYY-MM-DD'
}

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500, default: '' })
  description: string;

  @Prop({ trim: true, default: 'general' })
  category: string;

  @Prop({ type: String, enum: HabitFrequency, default: HabitFrequency.DAILY })
  frequency: HabitFrequency;

  @Prop({ default: '#4F46E5' })
  color: string;

  @Prop({ default: false })
  archived: boolean;

  @Prop({ type: HabitStats, default: () => ({}) })
  stats: HabitStats;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
HabitSchema.index({ userId: 1, archived: 1 });
HabitSchema.index({ userId: 1, createdAt: -1 });
```

**Notes:**
- `stats` is a **denormalized cache**, recalculated/updated by `HabitsService` whenever a check-in is added or removed. Source of truth for history is still the `checkins` collection — `stats` can always be rebuilt from it.
- Indexes support "list my active habits" and "list my habits, newest first" — the two most common queries.

---

## 3. CheckIn

```ts
// checkin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CheckInDocument = CheckIn & Document;

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // denormalized for direct ownership checks & queries

  @Prop({ required: true }) // 'YYYY-MM-DD', stored as string for simple equality/index
  date: string;

  @Prop({ trim: true, maxlength: 280, default: '' })
  note: string;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
CheckInSchema.index({ habitId: 1, date: 1 }, { unique: true }); // prevents duplicate check-in per day
CheckInSchema.index({ habitId: 1, date: -1 }); // supports stats aggregation (sorted scan)
```

**Notes:**
- `date` stored as a plain `'YYYY-MM-DD'` string (not `Date`) to keep streak-day comparisons simple and timezone-safe — check-ins are day-granularity, not time-granularity.
- The unique compound index `(habitId, date)` is the DB-level guarantee against duplicate check-ins; the service layer should also return a friendly 409 error rather than relying only on the Mongo duplicate-key error.

---

## 4. Key DTO Shapes (for reference, implemented with `class-validator`)

```ts
// auth
RegisterDto { email: string; password: string; name: string }
LoginDto { email: string; password: string }

// habits
CreateHabitDto { title: string; description?: string; category?: string; frequency?: HabitFrequency; color?: string }
UpdateHabitDto { title?: string; description?: string; category?: string; color?: string; archived?: boolean }

// checkins
CreateCheckInDto { date: string; note?: string } // date validated as YYYY-MM-DD

// stats response
HabitStatsResponse {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRateLast30Days: number; // 0..1
  totalCheckIns: number;
}
```

---

## 5. Stats Aggregation Sketch

```ts
// Rough shape of the pipeline used in StatsService for GET /habits/:id/stats
db.checkins.aggregate([
  { $match: { habitId: ObjectId(habitId) } },
  { $sort: { date: 1 } },
  {
    $group: {
      _id: '$habitId',
      dates: { $push: '$date' },
      total: { $sum: 1 },
    },
  },
  // streak logic (current/longest) computed in application code from the
  // sorted `dates` array — deliberately kept out of the pipeline for readability;
  // completion rate for last 30 days computed via a second $match on date range + $count.
]);
```