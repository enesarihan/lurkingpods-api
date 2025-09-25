import request from 'supertest';
import app from '../../src/app';

describe('Subscription Contracts', () => {
  it('GET /subscription/status should return subscription status', async () => {
    const res = await request(app).get('/subscription/status');
    expect(res.status).toBeLessThan(500);
    expect(res.body).toHaveProperty('status');
  });

  it('POST /subscription/verify should validate receipt', async () => {
    const res = await request(app)
      .post('/subscription/verify')
      .send({ platform: 'ios', receipt_data: 'dummy' });
    expect(res.status).toBeLessThan(500);
  });
});


