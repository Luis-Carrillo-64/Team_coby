const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

describe('Security Tests', () => {
  let validToken;
  let adminToken;

  beforeAll(() => {
    // Crear tokens de prueba
    validToken = jwt.sign(
      { id: '123', username: 'testuser', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: '456', username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('Rate Limiting', () => {
    it('should limit requests after threshold', async () => {
      const requests = Array(101).fill().map(() => 
        request(app).get('/api/pokemon')
      );
      
      const responses = await Promise.all(requests);
      const limitedRequests = responses.filter(res => res.status === 429);
      
      expect(limitedRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .expect(401);
      
      expect(response.body.message).toBe('Token no proporcionado');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.message).toBe('Token inválido');
    });

    it('should accept requests with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should reject non-admin access to admin routes', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(403);
      
      expect(response.body.message).toContain('Acceso denegado');
    });

    it('should allow admin access to admin routes', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/pokemon')
        .expect(200);
      
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });
  });
}); 