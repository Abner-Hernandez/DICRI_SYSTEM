const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/auth/login', () => {
  test('debe retornar error con credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalido@test.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('debe validar formato de email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'email-invalido',
        password: '123456'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
