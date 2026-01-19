const request = require('supertest');
const app = require('../../src/app');
const Wallet = require('../../src/models/Wallet');

describe('Transaction API Integration Tests', () => {
  describe('POST /api/v1/transaction/:walletId', () => {
    it('should create a credit transaction with 4-decimal rounding', async () => {
      const wallet = await Wallet.create({ name: 'Txn Wallet', balance: 0 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 1.23456, description: 'Credit integration' });

      expect(res.status).toBe(201);
      expect(res.body.walletId).toBe(walletId);
      expect(res.body.amount).toBeCloseTo(1.2346, 4);
      expect(res.body.balance).toBeCloseTo(1.2346, 4);
      expect(res.body.type).toBe('CREDIT');
    });

    it('should create a debit transaction and update balance', async () => {
      const walletRes = await request(app)
        .post('/api/v1/wallet/setup')
        .send({ name: 'Txn Wallet Debit', balance: 10 });

      const walletId = walletRes.body.id;

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: -4.5, description: 'Debit integration' });

      expect(res.status).toBe(201);
      expect(res.body.walletId).toBe(walletId);
      expect(res.body.type).toBe('DEBIT');
      expect(res.body.balance).toBeCloseTo(5.5, 4);
    });

    it('should return 400 for invalid wallet id format without cast error details', async () => {
      const res = await request(app)
        .post('/api/v1/transaction/invalid-id')
        .send({ amount: 10, description: 'Invalid wallet id' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Resource not found');
    });

    it('should return 404 for non-existent wallet id', async () => {
      const mongoose = require('mongoose');
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/transaction/${nonExistentId}`)
        .send({ amount: 10, description: 'Non-existent wallet' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Wallet not found');
    });

    it('should reject transaction with zero amount', async () => {
      const wallet = await Wallet.create({ name: 'Zero Amount Test', balance: 10 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 0, description: 'Zero amount' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Amount must be non-zero');
    });

    it('should reject debit transaction with insufficient balance', async () => {
      const wallet = await Wallet.create({ name: 'Insufficient Balance', balance: 5 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: -10, description: 'Insufficient balance' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Insufficient balance for debit');
    });

    it('should validate missing amount in request', async () => {
      const wallet = await Wallet.create({ name: 'Missing Amount', balance: 10 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ description: 'Missing amount' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate missing description in request', async () => {
      const wallet = await Wallet.create({ name: 'Missing Description', balance: 10 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 10 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle very large transaction amounts with rounding', async () => {
      const wallet = await Wallet.create({ name: 'Large Amount', balance: 1000 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 999.999999, description: 'Large amount' });

      expect(res.status).toBe(201);
      expect(res.body.amount).toBeCloseTo(1000.0, 4);
    });

    it('should handle very small transaction amounts with rounding', async () => {
      const wallet = await Wallet.create({ name: 'Small Amount', balance: 10 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 0.00001, description: 'Small amount' });

      expect(res.status).toBe(201);
      expect(res.body.amount).toBeCloseTo(0.0, 4);
    });
  });

  describe('GET /api/v1/transaction', () => {
    it('should get transactions with pagination and sorting by amount ascending', async () => {
      const wallet = await Wallet.create({ name: 'Txn Wallet List', balance: 0 });
      const walletId = wallet._id.toString();

      const amounts = [5, 1, 3];
      for (const amount of amounts) {
        // eslint-disable-next-line no-await-in-loop
        await request(app)
          .post(`/api/v1/transaction/${walletId}`)
          .send({ amount, description: `Amount ${amount}` });
      }

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, skip: 0, limit: 10, sortBy: 'amount', sortOrder: 'asc' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const returnedAmounts = res.body.data.map((t) => t.amount);
      expect(returnedAmounts).toEqual([...returnedAmounts].sort((a, b) => a - b));

      expect(res.body.pagination.skip).toBe(0);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('should get transactions sorted by date descending (default)', async () => {
      const wallet = await Wallet.create({ name: 'Date Sort Test', balance: 0 });
      const walletId = wallet._id.toString();

      // Create transactions with delays to ensure different timestamps
      await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 10, description: 'First' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 20, description: 'Second' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await request(app)
        .post(`/api/v1/transaction/${walletId}`)
        .send({ amount: 30, description: 'Third' });

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, skip: 0, limit: 10, sortBy: 'date', sortOrder: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      // Should be in descending order (newest first)
      const dates = res.body.data.map((t) => new Date(t.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should get transactions sorted by amount descending', async () => {
      const wallet = await Wallet.create({ name: 'Amount Desc Sort', balance: 0 });
      const walletId = wallet._id.toString();

      const amounts = [1, 5, 3];
      for (const amount of amounts) {
        // eslint-disable-next-line no-await-in-loop
        await request(app)
          .post(`/api/v1/transaction/${walletId}`)
          .send({ amount, description: `Amount ${amount}` });
      }

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, skip: 0, limit: 10, sortBy: 'amount', sortOrder: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      const returnedAmounts = res.body.data.map((t) => t.amount);
      expect(returnedAmounts).toEqual([...returnedAmounts].sort((a, b) => b - a));
    });

    it('should handle pagination with skip and limit', async () => {
      const wallet = await Wallet.create({ name: 'Pagination Test', balance: 0 });
      const walletId = wallet._id.toString();

      // Create 5 transactions
      for (let i = 1; i <= 5; i++) {
        // eslint-disable-next-line no-await-in-loop
        await request(app)
          .post(`/api/v1/transaction/${walletId}`)
          .send({ amount: i, description: `Transaction ${i}` });
      }

      // Get first 2 transactions
      const res1 = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, skip: 0, limit: 2 });

      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(2);
      expect(res1.body.pagination.skip).toBe(0);
      expect(res1.body.pagination.limit).toBe(2);

      // Get next 2 transactions
      const res2 = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, skip: 2, limit: 2 });

      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(2);
      expect(res2.body.pagination.skip).toBe(2);
      expect(res2.body.pagination.limit).toBe(2);
    });

    it('should filter transactions by walletId', async () => {
      const wallet1 = await Wallet.create({ name: 'Wallet 1', balance: 0 });
      const wallet2 = await Wallet.create({ name: 'Wallet 2', balance: 0 });
      const walletId1 = wallet1._id.toString();
      const walletId2 = wallet2._id.toString();

      // Create transactions for both wallets
      await request(app)
        .post(`/api/v1/transaction/${walletId1}`)
        .send({ amount: 10, description: 'Wallet 1 transaction' });
      await request(app)
        .post(`/api/v1/transaction/${walletId2}`)
        .send({ amount: 20, description: 'Wallet 2 transaction' });

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId: walletId1 });

      expect(res.status).toBe(200);
      expect(res.body.data.every((t) => t.walletId === walletId1)).toBe(true);
    });

    it('should return empty array when no transactions exist', async () => {
      const wallet = await Wallet.create({ name: 'Empty Wallet', balance: 0 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.skip).toBe(0);
      expect(res.body.pagination.limit).toBe(50);
    });

    it('should validate invalid sortBy parameter', async () => {
      const wallet = await Wallet.create({ name: 'Invalid Sort', balance: 0 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, sortBy: 'invalid', sortOrder: 'asc' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate invalid sortOrder parameter', async () => {
      const wallet = await Wallet.create({ name: 'Invalid Sort Order', balance: 0 });
      const walletId = wallet._id.toString();

      const res = await request(app)
        .get('/api/v1/transaction')
        .query({ walletId, sortBy: 'amount', sortOrder: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
