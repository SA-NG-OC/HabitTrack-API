process.env.NODE_ENV = 'test';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('CheckInsController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let tokenA: string;
  let tokenB: string;
  let habitAId: string;
  let habitBId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Register User A
    const registerARes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'usera@example.com',
        password: 'password123',
        name: 'User A',
      })
      .expect(201);
    tokenA = registerARes.body.data.accessToken;

    // Register User B
    const registerBRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userb@example.com',
        password: 'password123',
        name: 'User B',
      })
      .expect(201);
    tokenB = registerBRes.body.data.accessToken;

    // Create a Habit for User A
    const createHabitARes = await request(app.getHttpServer())
      .post('/habits')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'User A Habit' })
      .expect(201);
    habitAId = createHabitARes.body.data._id;

    // Create a Habit for User B
    const createHabitBRes = await request(app.getHttpServer())
      .post('/habits')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'User B Habit' })
      .expect(201);
    habitBId = createHabitBRes.body.data._id;
  });

  afterEach(async () => {
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  describe('POST /habits/:id/checkins', () => {
    it('should log a check-in successfully and recalculate streaks', async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const payload = {
        date: todayStr,
        note: 'Felt great today',
      };

      const response = await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('date', todayStr);
      expect(response.body.data).toHaveProperty('note', payload.note);

      // Verify Habit stats are updated
      const habitRes = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(habitRes.body.data.stats).toHaveProperty('currentStreak', 1);
      expect(habitRes.body.data.stats).toHaveProperty('longestStreak', 1);
      expect(habitRes.body.data.stats).toHaveProperty('lastCheckInDate', todayStr);
    });

    it('should return 409 Conflict if checking in on the same date twice', async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const payload = { date: todayStr };

      // First check-in
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(201);

      // Second check-in (duplicate)
      const response = await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(409);

      expect(response.body.message).toContain('Already checked in on this date');
    });

    it('should return 404 when logging check-in for another user habit', async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ date: todayStr })
        .expect(404);
    });

    it('should return 400 for invalid date format', async () => {
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: '17-07-2026' }) // Invalid format
        .expect(400);
    });
  });

  describe('GET /habits/:id/checkins', () => {
    it('should retrieve check-in history successfully for own habit', async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: todayStr })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('date', todayStr);
    });

    it('should return 404 when retrieving history for another user habit', async () => {
      await request(app.getHttpServer())
        .get(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  describe('DELETE /habits/:id/checkins/:checkInId', () => {
    let checkInId: string;
    let todayStr: string;

    beforeEach(async () => {
      todayStr = new Date().toLocaleDateString('en-CA');
      const checkinRes = await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: todayStr })
        .expect(201);
      checkInId = checkinRes.body.data._id;
    });

    it('should delete own check-in successfully and recalculate streaks', async () => {
      await request(app.getHttpServer())
        .delete(`/habits/${habitAId}/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Verify check-in is gone
      const historyRes = await request(app.getHttpServer())
        .get(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(historyRes.body.data.length).toBe(0);

      // Verify Habit stats are reset
      const habitRes = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(habitRes.body.data.stats).toHaveProperty('currentStreak', 0);
      expect(habitRes.body.data.stats).toHaveProperty('longestStreak', 0);
      expect(habitRes.body.data.stats).toHaveProperty('lastCheckInDate', null);
    });

    it('should return 404 when user B deletes user A check-in', async () => {
      await request(app.getHttpServer())
        .delete(`/habits/${habitAId}/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  describe('Streak Logic integration tests', () => {
    it('should increment currentStreak correctly on consecutive days and reset on gaps', async () => {
      const todayDate = new Date();
      const todayStr = todayDate.toLocaleDateString('en-CA');

      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setDate(todayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');

      const twoDaysAgoDate = new Date(todayDate);
      twoDaysAgoDate.setDate(todayDate.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgoDate.toLocaleDateString('en-CA');

      const threeDaysAgoDate = new Date(todayDate);
      threeDaysAgoDate.setDate(todayDate.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgoDate.toLocaleDateString('en-CA');

      // 1. Log check-in 3 days ago -> currentStreak = 0, longestStreak = 1
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: threeDaysAgoStr })
        .expect(201);

      let habit = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(habit.body.data.stats.currentStreak).toBe(0);
      expect(habit.body.data.stats.longestStreak).toBe(1);

      // 2. Log check-in 2 days ago -> currentStreak = 0, longestStreak = 2
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: twoDaysAgoStr })
        .expect(201);

      habit = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(habit.body.data.stats.currentStreak).toBe(0);
      expect(habit.body.data.stats.longestStreak).toBe(2);

      // 3. Log check-in today -> currentStreak = 1 (active today, yesterday missing), longestStreak = 2
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: todayStr })
        .expect(201);

      habit = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(habit.body.data.stats.currentStreak).toBe(1);
      expect(habit.body.data.stats.longestStreak).toBe(2);

      // 4. Log check-in yesterday (fills the gap) -> currentStreak = 4, longestStreak = 4
      await request(app.getHttpServer())
        .post(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: yesterdayStr })
        .expect(201);

      habit = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(habit.body.data.stats.currentStreak).toBe(4);
      expect(habit.body.data.stats.longestStreak).toBe(4);

      // 5. Delete yesterday's check-in -> breaks streak.
      // Remaining: [today, twoDaysAgo, threeDaysAgo]
      // currentStreak = 1 (today), longestStreak = 2 (twoDaysAgo + threeDaysAgo)
      const checkinsRes = await request(app.getHttpServer())
        .get(`/habits/${habitAId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const yesterdayCheckIn = checkinsRes.body.data.find((c: any) => c.date === yesterdayStr);
      expect(yesterdayCheckIn).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/habits/${habitAId}/checkins/${yesterdayCheckIn._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      habit = await request(app.getHttpServer())
        .get(`/habits/${habitAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(habit.body.data.stats.currentStreak).toBe(1);
      expect(habit.body.data.stats.longestStreak).toBe(2);
    });
  });
});
