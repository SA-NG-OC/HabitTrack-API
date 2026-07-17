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

describe('HabitsController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let tokenA: string;
  let tokenB: string;

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
  });

  afterEach(async () => {
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  describe('POST /habits', () => {
    it('should create a habit successfully and return it inside envelope', async () => {
      const payload = {
        title: 'Drink Water',
        description: 'Drink at least 2 liters of water today',
        category: 'health',
        frequency: 'daily',
        color: '#4F46E5',
      };

      const response = await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('title', payload.title);
      expect(response.body.data).toHaveProperty('description', payload.description);
      expect(response.body.data).toHaveProperty('archived', false);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data.stats).toHaveProperty('currentStreak', 0);
    });

    it('should return 400 for validation errors (missing title)', async () => {
      const payload = {
        description: 'No title provided',
      };

      await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(400);
    });

    it('should return 400 for validation errors (invalid frequency)', async () => {
      const payload = {
        title: 'Exercise',
        frequency: 'monthly', // Only daily/weekly allowed
      };

      await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('GET /habits', () => {
    it('should retrieve all active habits for the authenticated user only', async () => {
      // Create habit for User A
      await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'User A Habit' })
        .expect(201);

      // Create habit for User B
      await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'User B Habit' })
        .expect(201);

      // Fetch User A habits
      const response = await request(app.getHttpServer())
        .get('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('title', 'User A Habit');
    });
  });

  describe('GET /habits/:id', () => {
    let habitId: string;

    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Find Me' })
        .expect(201);
      habitId = createRes.body.data._id;
    });

    it('should retrieve own habit successfully by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('title', 'Find Me');
    });

    it('should return 404 if accessing another user habit', async () => {
      await request(app.getHttpServer())
        .get(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });

    it('should return 404 for non-existent habit ID format', async () => {
      await request(app.getHttpServer())
        .get('/habits/non-existent-id-format')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });

    it('should return 404 for valid format but non-existent habit ID', async () => {
      const validNonExistentId = '60d0fe4f5311236168a109cf';
      await request(app.getHttpServer())
        .get(`/habits/${validNonExistentId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });
  });

  describe('PATCH /habits/:id', () => {
    let habitId: string;

    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Update Me', description: 'Old description' })
        .expect(201);
      habitId = createRes.body.data._id;
    });

    it('should update own habit successfully', async () => {
      const payload = {
        title: 'New Title',
        description: 'New description',
        archived: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload)
        .expect(200);

      expect(response.body.data).toHaveProperty('title', 'New Title');
      expect(response.body.data).toHaveProperty('description', 'New description');
      expect(response.body.data).toHaveProperty('archived', true);
    });

    it('should return 404 when updating another user habit', async () => {
      const payload = { title: 'Malicious Update' };

      await request(app.getHttpServer())
        .patch(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send(payload)
        .expect(404);
    });
  });

  describe('DELETE /habits/:id', () => {
    let habitId: string;

    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Delete Me' })
        .expect(201);
      habitId = createRes.body.data._id;
    });

    it('should delete own habit successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Verify it is gone
      await request(app.getHttpServer())
        .get(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });

    it('should return 404 when deleting another user habit', async () => {
      await request(app.getHttpServer())
        .delete(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  describe('GET /habits/:id/stats', () => {
    let habitId: string;

    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/habits')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Stats Habit' })
        .expect(201);
      habitId = createRes.body.data._id;
    });

    it('should retrieve habit stats successfully with zero check-ins', async () => {
      const response = await request(app.getHttpServer())
        .get(`/habits/${habitId}/stats`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body.data).toEqual({
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        completionRateLast30Days: 0,
        totalCheckIns: 0,
      });
    });

    it('should retrieve habit stats reflecting log check-ins', async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');

      // Log a check-in
      await request(app.getHttpServer())
        .post(`/habits/${habitId}/checkins`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: todayStr })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/habits/${habitId}/stats`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.data.currentStreak).toBe(1);
      expect(response.body.data.longestStreak).toBe(1);
      expect(response.body.data.totalCheckIns).toBe(1);
      expect(response.body.data.completionRateLast30Days).toBe(0.03); // 1/30 = 0.03
    });

    it('should return 404 when user B requests stats for user A habit', async () => {
      await request(app.getHttpServer())
        .get(`/habits/${habitId}/stats`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });
});
