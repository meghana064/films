import nock from 'nock';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import app from '../server.js';

const prisma = new PrismaClient();
const TMDB_BASE = 'https://api.themoviedb.org/3';

const getValidToken = async () => {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: `movietest_${Date.now()}`,
        email: `movietest_${Date.now()}@example.com`,
        phone: '1234567890',
        password: await import('bcrypt').then((b) => b.default.hash('TestPass123', 10)),
      },
    });
  }
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

describe('TMDB API Proxy', () => {
  let token;

  beforeAll(async () => {
    token = await getValidToken();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch trending movies from TMDB', async () => {
    const mockResults = [
      { id: 1, title: 'Inception', poster_path: '/poster1.jpg', overview: 'A dream heist' },
      { id: 2, title: 'Interstellar', poster_path: '/poster2.jpg', overview: 'Space adventure' },
    ];

    nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(200, { results: mockResults });

    const res = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`)
      .expect(200);

    expect(res.body.results).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0]).toHaveProperty('id');
    expect(res.body.results[0]).toHaveProperty('title');
    expect(res.body.results[0]).toHaveProperty('poster_path');
    expect(res.body.results[0].title).toBe('Inception');
  });

  it('should return 200 status', async () => {
    nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(200, { results: [{ id: 1, title: 'Test', poster_path: null }] });

    const res = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`);

    expect(res.status).toBe(200);
  });

  it('response must contain id, title, poster_path', async () => {
    nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(200, {
        results: [{ id: 42, title: 'The Matrix', poster_path: '/matrix.jpg' }],
      });

    const res = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`);

    const movie = res.body.results[0];
    expect(movie.id).toBe(42);
    expect(movie.title).toBe('The Matrix');
    expect(movie.poster_path).toContain('matrix.jpg');
  });

  it('must verify data is NOT hardcoded', async () => {
    const uniqueTitle = `UniqueMovie_${Date.now()}`;
    nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(200, {
        results: [{ id: 999, title: uniqueTitle, poster_path: '/unique.jpg' }],
      });

    const res = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`);

    expect(res.body.results[0].title).toBe(uniqueTitle);
  });

  it('must verify axios/fetch is calling TMDB base URL', async () => {
    const scope = nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(200, { results: [] });

    await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`);

    expect(scope.isDone()).toBe(true);
  });

  it('should return proper error when TMDB fails', async () => {
    nock(TMDB_BASE)
      .get('/trending/movie/week')
      .query(true)
      .reply(500, { status_message: 'Internal Server Error' });

    const res = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', `accessToken=${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
