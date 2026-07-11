import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const hasDb = !!process.env.DATABASE_URL;
const itIf = (condition: boolean) => condition ? it : it.skip;

describe('Portfolio API (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/health/liveness should return 200', () => {
      return request(httpServer).get('/api/health/liveness').expect(200)
        .expect((res) => { expect(res.body.status).toBeDefined(); });
    });

    it('GET /api/health/readiness should return 200', () => {
      return request(httpServer).get('/api/health/readiness').expect(200)
        .expect((res) => { expect(res.body.status).toBeDefined(); });
    });
  });

  describe('API Versioning', () => {
    it('should handle versioned accept header', () => {
      return request(httpServer).get('/api/portfolio/sections')
        .set('Accept', 'application/vnd.portfolio.v1+json')
        .expect(200);
    });
  });

  describe('Auth (requires DB)', () => {
    let accessToken = '';
    let refreshToken = '';

    itIf(hasDb)('POST /api/admin/auth/login should return 400 for empty body', () => {
      return request(httpServer).post('/api/admin/auth/login').send({}).expect(400);
    });

    itIf(hasDb)('POST /api/admin/auth/login should return 401 for invalid credentials', () => {
      return request(httpServer).post('/api/admin/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
        .expect(401);
    });

    itIf(hasDb)('POST /api/admin/auth/register should return 201 for valid registration', async () => {
      const uniqueEmail = `e2e-test-${Date.now()}@test.com`;
      return request(httpServer).post('/api/admin/auth/register')
        .send({ email: uniqueEmail, password: 'TestPass123!', display_name: 'E2E Test' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe(uniqueEmail);
        });
    });

    itIf(hasDb)('POST /api/admin/auth/login should succeed with valid credentials', async () => {
      const uniqueEmail = `e2e-login-${Date.now()}@test.com`;
      await request(httpServer).post('/api/admin/auth/register')
        .send({ email: uniqueEmail, password: 'TestPass123!', display_name: 'Login Test' });

      return request(httpServer).post('/api/admin/auth/login')
        .send({ email: uniqueEmail, password: 'TestPass123!' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');
          expect(res.body.data).toHaveProperty('user');
          accessToken = res.body.data.access_token;
          refreshToken = res.body.data.refresh_token;
        });
    });

    itIf(hasDb)('POST /api/admin/auth/refresh should rotate tokens', () => {
      return request(httpServer).post('/api/admin/auth/refresh')
        .send({ refresh_token: refreshToken || 'invalid' })
        .expect((res) => {
          if (refreshToken) {
            expect(res.body.data).toHaveProperty('access_token');
          }
        });
    });

    itIf(hasDb)('GET /api/admin/auth/profile should return authenticated user', () => {
      if (!accessToken) return;
      return request(httpServer).get('/api/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('email');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limit headers', async () => {
      const res = await request(httpServer).get('/api/portfolio/sections');
      expect(res.headers['x-ratelimit-limit'] || res.headers['ratelimit-limit']).toBeDefined();
    });
  });

  describe('Portfolio - Sections', () => {
    it('GET /api/portfolio/sections should return array', () => {
      return request(httpServer).get('/api/portfolio/sections').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });

    it('GET /api/portfolio/sections?is_live=true should filter', () => {
      return request(httpServer).get('/api/portfolio/sections').query({ is_live: 'true' }).expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });

    it('GET /api/portfolio/sections?type=hero should filter by type', () => {
      return request(httpServer).get('/api/portfolio/sections').query({ type: 'hero' }).expect(200);
    });
  });

  describe('Portfolio - Skills', () => {
    it('GET /api/portfolio/skills should return array', () => {
      return request(httpServer).get('/api/portfolio/skills').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });

    it('GET /api/portfolio/skills?category= should filter by category', () => {
      return request(httpServer).get('/api/portfolio/skills').query({ category: 'Frontend' }).expect(200);
    });
  });

  describe('Portfolio - Projects', () => {
    it('GET /api/portfolio/projects should have pagination meta', () => {
      return request(httpServer).get('/api/portfolio/projects').expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('total');
        });
    });

    it('GET /api/portfolio/projects?category= should filter', () => {
      return request(httpServer).get('/api/portfolio/projects').query({ category: 'web' }).expect(200);
    });

    it('GET /api/portfolio/projects?featured=true should filter featured', () => {
      return request(httpServer).get('/api/portfolio/projects').query({ featured: 'true' }).expect(200);
    });

    it('GET /api/portfolio/projects?page=1&per_page=5 should respect pagination', () => {
      return request(httpServer).get('/api/portfolio/projects').query({ page: 1, per_page: 5 }).expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('Portfolio - Blog', () => {
    it('GET /api/portfolio/blog should return array with meta', () => {
      return request(httpServer).get('/api/portfolio/blog').expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('GET /api/portfolio/blog?category= should filter', () => {
      return request(httpServer).get('/api/portfolio/blog').query({ category: 'tech' }).expect(200);
    });

    it('GET /api/portfolio/blog?published=true should filter published', () => {
      return request(httpServer).get('/api/portfolio/blog').query({ published: 'true' }).expect(200);
    });
  });

  describe('Portfolio - Experiences', () => {
    it('GET /api/portfolio/experiences should return array', () => {
      return request(httpServer).get('/api/portfolio/experiences').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Testimonials', () => {
    it('GET /api/portfolio/testimonials should return array', () => {
      return request(httpServer).get('/api/portfolio/testimonials').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });

    it('GET /api/portfolio/testimonials?featured=true should filter', () => {
      return request(httpServer).get('/api/portfolio/testimonials').query({ featured: 'true' }).expect(200);
    });
  });

  describe('Portfolio - Services', () => {
    it('GET /api/portfolio/services should return array', () => {
      return request(httpServer).get('/api/portfolio/services').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - FAQs', () => {
    it('GET /api/portfolio/faqs should return array', () => {
      return request(httpServer).get('/api/portfolio/faqs').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Case Studies', () => {
    it('GET /api/portfolio/case-studies should return array', () => {
      return request(httpServer).get('/api/portfolio/case-studies').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Achievements', () => {
    it('GET /api/portfolio/achievements should return array', () => {
      return request(httpServer).get('/api/portfolio/achievements').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Press Features', () => {
    it('GET /api/portfolio/press-features should return array', () => {
      return request(httpServer).get('/api/portfolio/press-features').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Guest Appearances', () => {
    it('GET /api/portfolio/guest-appearances should return array', () => {
      return request(httpServer).get('/api/portfolio/guest-appearances').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Reading List', () => {
    it('GET /api/portfolio/reading-list-items should return array', () => {
      return request(httpServer).get('/api/portfolio/reading-list-items').expect(200)
        .expect((res) => { expect(Array.isArray(res.body.data)).toBe(true); });
    });
  });

  describe('Portfolio - Availability', () => {
    it('GET /api/portfolio/availability-status should return status', () => {
      return request(httpServer).get('/api/portfolio/availability-status').expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('Leads - Public', () => {
    it('POST /api/portfolio/leads should accept valid lead', () => {
      return request(httpServer).post('/api/portfolio/leads')
        .send({ name: 'E2E Test', email: 'e2e@test.com', message: 'Test message from e2e' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.status).toBe('new');
        });
    });

    it('POST /api/portfolio/leads should reject empty body', () => {
      return request(httpServer).post('/api/portfolio/leads').send({}).expect(400);
    });
  });

  describe('Admin Endpoints (requires auth)', () => {
    itIf(hasDb)('GET /api/admin/sections should return 401 without token', () => {
      return request(httpServer).get('/api/admin/sections').expect(401);
    });

    itIf(hasDb)('GET /api/admin/projects should return 401 without token', () => {
      return request(httpServer).get('/api/admin/projects').expect(401);
    });

    itIf(hasDb)('GET /api/admin/blog should return 401 without token', () => {
      return request(httpServer).get('/api/admin/blog').expect(401);
    });
  });

  describe('404 Handling', () => {
    it('should return structured 404 for unknown portfolio route', () => {
      return request(httpServer).get('/api/portfolio/nonexistent').expect(404)
        .expect((res) => {
          expect(res.body.error).toHaveProperty('correlation_id');
          expect(res.body.error).toHaveProperty('status_code', 404);
        });
    });

    it('should return structured 404 for unknown admin route', () => {
      return request(httpServer).get('/api/admin/nonexistent').expect(404);
    });
  });
});
