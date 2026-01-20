jest.mock('../../src/persistence', () => {
  const walletPersistence = {
    findById: jest.fn(),
    updateBalance: jest.fn(),
  };
  const transactionPersistence = {
    create: jest.fn(),
    findByFilters: jest.fn(),
    countByFilters: jest.fn(),
    findById: jest.fn(),
  };
  return { walletPersistence, transactionPersistence };
});

jest.mock('../../src/persistence/mongo/util/transactionManager', () => ({
  runInTransaction: async (fn) => fn('session'),
}));

const { walletPersistence, transactionPersistence } = require('../../src/persistence');
const transactionService = require('../../src/services/transactionService');
const { AppError } = require('../../src/utils/errors');

describe('TransactionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should throw error when amount is zero', async () => {
      await expect(
        transactionService.createTransaction('wallet-id', { amount: 0, description: 'Test' })
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should create a credit transaction and round amounts to 4 decimals', async () => {
      walletPersistence.findById.mockResolvedValue({
        _id: 'wallet-id',
        balance: 1.2345,
      });

      walletPersistence.updateBalance.mockResolvedValue({
        _id: 'wallet-id',
        balance: 2.4691,
      });

      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
        amount: 1.2346,
        balance: 2.4691,
      });

      const result = await transactionService.createTransaction('wallet-id', {
        amount: 1.23456,
        description: 'Credit',
      });

      expect(walletPersistence.findById).toHaveBeenCalledWith('wallet-id', { session: 'session' });
      expect(walletPersistence.updateBalance).toHaveBeenCalledWith(
        'wallet-id',
        expect.closeTo(2.4691, 4),
        { session: 'session' }
      );
      expect(transactionPersistence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          walletId: 'wallet-id',
          amount: 1.2346,
          balance: 2.4691,
          type: 'CREDIT',
        }),
        { session: 'session' }
      );

      expect(result.transaction._id).toBe('txn-id');
    });

    it('should throw error when wallet not found', async () => {
      walletPersistence.findById.mockResolvedValue(null);

      await expect(
        transactionService.createTransaction('missing-wallet', {
          amount: 10,
          description: 'Test',
        })
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should throw error when debit leads to negative balance', async () => {
      walletPersistence.findById.mockResolvedValue({
        _id: 'wallet-id',
        balance: 5,
      });

      await expect(
        transactionService.createTransaction('wallet-id', {
          amount: -10,
          description: 'Debit',
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getTransactions', () => {
    it('should pass filters and sort options to persistence', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions(
        { walletId: 'wallet-id' },
        { skip: 5, limit: 10, sortBy: 'amount', sortOrder: 'asc' }
      );

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        { walletId: 'wallet-id' },
        expect.objectContaining({
          skip: 5,
          limit: 10,
          sort: { amount: 1 },
        })
      );
    });

    it('should default to createdAt descending when no sortBy provided', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions({ walletId: 'wallet-id' }, { skip: 0, limit: 50 });

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        { walletId: 'wallet-id' },
        expect.objectContaining({
          skip: 0,
          limit: 50,
          sort: { createdAt: -1 },
        })
      );
    });

    it('should handle sortBy date with ascending order', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions(
        { walletId: 'wallet-id' },
        { sortBy: 'date', sortOrder: 'asc' }
      );

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        { walletId: 'wallet-id' },
        expect.objectContaining({
          sort: { createdAt: 1 },
        })
      );
    });

    it('should handle sortBy amount with descending order', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions(
        { walletId: 'wallet-id' },
        { sortBy: 'amount', sortOrder: 'desc' }
      );

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        { walletId: 'wallet-id' },
        expect.objectContaining({
          sort: { amount: -1 },
        })
      );
    });

    it('should handle numeric sortOrder values', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions(
        { walletId: 'wallet-id' },
        { sortBy: 'amount', sortOrder: 1 }
      );

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        { walletId: 'wallet-id' },
        expect.objectContaining({
          sort: { amount: 1 },
        })
      );
    });

    it('should handle empty filters', async () => {
      transactionPersistence.findByFilters.mockResolvedValue([]);

      await transactionService.getTransactions({}, { skip: 0, limit: 50 });

      expect(transactionPersistence.findByFilters).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          skip: 0,
          limit: 50,
        })
      );
    });
  });

  describe('countTransactions', () => {
    it('should return count for a walletId filter', async () => {
      transactionPersistence.countByFilters.mockResolvedValue(12);

      const count = await transactionService.countTransactions({ walletId: 'wallet-id' });

      expect(transactionPersistence.countByFilters).toHaveBeenCalledWith({ walletId: 'wallet-id' });
      expect(count).toBe(12);
    });

    it('should return count for empty filters', async () => {
      transactionPersistence.countByFilters.mockResolvedValue(5);

      const count = await transactionService.countTransactions({});

      expect(transactionPersistence.countByFilters).toHaveBeenCalledWith({});
      expect(count).toBe(5);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction when found', async () => {
      const mockTransaction = {
        _id: 'txn-id',
        walletId: 'wallet-id',
        amount: 10,
        balance: 10,
        description: 'Test',
        type: 'CREDIT',
      };

      transactionPersistence.findById.mockResolvedValue(mockTransaction);

      const result = await transactionService.getTransactionById('txn-id');

      expect(transactionPersistence.findById).toHaveBeenCalledWith('txn-id');
      expect(result).toEqual(mockTransaction);
    });

    it('should throw AppError when transaction not found', async () => {
      transactionPersistence.findById.mockResolvedValue(null);

      await expect(transactionService.getTransactionById('missing-id')).rejects.toBeInstanceOf(
        AppError
      );
    });
  });

  describe('rounding edge cases', () => {
    it('should round debit transaction amounts correctly', async () => {
      walletPersistence.findById.mockResolvedValue({
        _id: 'wallet-id',
        balance: 10.1235,
      });

      walletPersistence.updateBalance.mockResolvedValue({
        _id: 'wallet-id',
        balance: 5.1235,
      });

      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
        amount: 5.0,
        balance: 5.1235,
      });

      const result = await transactionService.createTransaction('wallet-id', {
        amount: -5.00001,
        description: 'Debit rounding',
      });

      expect(transactionPersistence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5.0,
          type: 'DEBIT',
        }),
        { session: 'session' }
      );
      expect(result.transaction._id).toBe('txn-id');
    });

    it('should handle rounding that results in exact zero balance', async () => {
      walletPersistence.findById.mockResolvedValue({
        _id: 'wallet-id',
        balance: 5.1235,
      });

      walletPersistence.updateBalance.mockResolvedValue({
        _id: 'wallet-id',
        balance: 0,
      });

      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
        amount: 5.1235,
        balance: 0,
      });

      const result = await transactionService.createTransaction('wallet-id', {
        amount: -5.1235,
        description: 'Exact balance debit',
      });

      expect(result.wallet.balance).toBe(0);
    });
  });
});
