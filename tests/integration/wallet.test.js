const request = require('supertest');
const app = require('../../src/app');

describe('Wallet API Integration Tests', () => {
  describe('POST /api/v1/wallet/setup', () => {
    it('should initialize a wallet with 4-decimal rounded balance', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Integration Wallet', balance: 10.123456 });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.transactionId).toBeDefined();
      expect(res.body.name).toBe('Integration Wallet');
      expect(res.body.balance).toBeCloseTo(10.1235, 4);
    });
  });

  describe('GET /api/v1/wallet/:id', () => {
    it('should get wallet by id and return 4-decimal rounded balance', async () => {
      const createRes = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Wallet Get', balance: 5.678912 });

      const walletId = createRes.body.id;

      const res = await request(app).get(`/api/v1/wallet/${walletId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(walletId);
      expect(res.body.balance).toBeCloseTo(5.6789, 4);
    });

    it('should return 400 for invalid wallet id format without cast error details', async () => {
      const res = await request(app).get('/api/v1/wallet/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Resource not found');
    });

    it('should return 404 for non-existent wallet id', async () => {
      const mongoose = require('mongoose');
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/wallet/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Wallet not found');
    });

    it('should validate wallet setup with negative balance', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Negative Balance', balance: -10 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate wallet setup with missing name', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ balance: 10 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate wallet setup with missing balance', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'No Balance' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle very large balance values with rounding', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Large Balance', balance: 999999.999999 });

      expect(res.status).toBe(201);
      expect(res.body.balance).toBeCloseTo(1000000.0, 4);
    });

    it('should handle very small balance values with rounding', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Small Balance', balance: 0.00001 });

      expect(res.status).toBe(201);
      expect(res.body.balance).toBeCloseTo(0.0, 4);
    });
  });
});
