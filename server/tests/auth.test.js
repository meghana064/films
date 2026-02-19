import request from 'supertest';
import nock from 'nock';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import app from '../server.js';

const prisma = new PrismaClient();

describe('Auth API', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    phone: '1234567890',
    password: 'TestPass123',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.message).toBe('Registration successful');
      expect(res.body.redirect).toBe('/login');

      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.password).not.toBe(testUser.password);
    });

    it('should not allow duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.error).toMatch(/email|already/);
    });

    it('should hash password before storing', async () => {
      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      const isHashed = await bcrypt.compare(testUser.password, user.password);
      expect(isHashed).toBe(true);
    });
  });

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.message).toBe('Login successful');
      expect(res.body.redirect).toBe('/home');
      expect(res.body.user).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: 'WrongPass123' })
        .expect(401);
    });

    it('should allow login via username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.username, password: testUser.password })
        .expect(200);
      expect(res.body.user.username).toBe(testUser.username);
    });
  });

  describe('Protected routes', () => {
    let accessToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: testUser.password });
      const cookies = res.headers['set-cookie'];
      const accessCookie = cookies?.find((c) => c.startsWith('accessToken='));
      accessToken = accessCookie?.split(';')[0]?.split('=')[1];
    });

    it('should block access without JWT', async () => {
      await request(app)
        .get('/api/movies/trending')
        .expect(401);
    });

    it('should allow access with valid JWT', async () => {
      nock('https://api.themoviedb.org')
        .get('/3/trending/movie/week')
        .query(true)
        .reply(200, { results: [] });

      const res = await request(app)
        .get('/api/movies/trending')
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      expect(res.body.results).toBeDefined();
    });
  });
});
