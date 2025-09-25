import request from 'supertest';
import app from '../../src/app';

describe('Content Contracts', () => {
  it('GET /content/daily-mix should return podcasts and next_update', async () => {
    const res = await request(app).get('/content/daily-mix').query({ language: 'en' });

    expect(res.status).toBeLessThan(500);
    expect(res.body).toHaveProperty('podcasts');
    expect(res.body).toHaveProperty('next_update');
  });

  it('GET /content/categories should return list of categories', async () => {
    const res = await request(app).get('/content/categories').query({ language: 'en' });

    expect(res.status).toBeLessThan(500);
    expect(Array.isArray(res.body)).toBe(true);
  });
});


