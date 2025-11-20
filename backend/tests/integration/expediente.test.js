const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/expedientes', () => {
  test('debe requerir autenticación', async () => {
    const response = await request(app)
      .get('/api/expedientes');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
