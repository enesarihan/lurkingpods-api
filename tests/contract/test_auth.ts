import request from 'supertest';
import app from '../../src/app';

describe('Auth Contracts', () => {
  it('POST /auth/register should create user and return session + trial info', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'spec-user@example.com', password: 'password123', language_preference: 'en' });

    expect(res.status).toBeLessThan(500); // placeholder until implemented
    // Expected schema (placeholder assertions to fail later when real impl differs)
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('session');
    expect(res.body).toHaveProperty('trial_info');
  });

  it('POST /auth/login should authenticate user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'spec-user@example.com', password: 'password123' });

    expect(res.status).toBeLessThan(500);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('session');
  });
});


