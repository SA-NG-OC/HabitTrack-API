process.env.NODE_ENV = 'test';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully and return JWT', async () => {
      const payload = {
        email: 'register@example.com',
        password: 'securePassword123',
        name: 'Register Test',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
    });

    it('should return 409 if email is already registered', async () => {
      const payload = {
        email: 'duplicate@example.com',
        password: 'securePassword123',
        name: 'Register Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(409);

      expect(response.body.message).toContain('Email already registered');
    });

    it('should return 400 for validation errors (missing name)', async () => {
      const payload = {
        email: 'invalid@example.com',
        password: 'securePassword123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(400);
    });

    it('should return 400 for validation errors (short password)', async () => {
      const payload = {
        email: 'invalid@example.com',
        password: '123',
        name: 'Short Password',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'correctPassword123',
          name: 'Login Test',
        })
        .expect(201);
    });

    it('should log in successfully with correct credentials and return JWT', async () => {
      const payload = {
        email: 'login@example.com',
        password: 'correctPassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
      expect(response.body.data.user).toHaveProperty('name', 'Login Test');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 for incorrect password', async () => {
      const payload = {
        email: 'login@example.com',
        password: 'wrongPassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const payload = {
        email: 'nonexistent@example.com',
        password: 'correctPassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});
