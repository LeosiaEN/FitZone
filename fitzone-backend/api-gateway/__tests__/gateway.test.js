const request = require('supertest');
const app = require('../index');

describe('API Gateway Health & Observability Tests', () => {
  it('GET /health should return status UP and status 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'UP',
      message: 'FitZone API Gateway is operational'
    });
  });

  it('GET /health/services should return detailed aggregated services health report', async () => {
    const response = await request(app).get('/health/services');
    expect(response.status).toBe(200);
    expect(response.body.gateway).toBe('UP');
    expect(Array.isArray(response.body.services)).toBe(true);
    expect(response.body.services.length).toBe(5);
  });
});
