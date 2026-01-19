jest.mock('../../src/persistence', () => {
  const walletPersistence = {
    create: jest.fn(),
    findById: jest.fn(),
    updateBalance: jest.fn(),
  };
  const transactionPersistence = {
    create: jest.fn(),
  };
  return { walletPersistence, transactionPersistence };
});

jest.mock('../../src/persistence/mongo/util/transactionManager', () => ({
  runInTransaction: async (fn) => fn('session'),
}));

const { walletPersistence, transactionPersistence } = require('../../src/persistence');
const walletService = require('../../src/services/walletService');
const { AppError } = require('../../src/utils/errors');

describe('WalletService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a wallet and initial transaction with 4-decimal rounded balance', async () => {
      walletPersistence.create.mockResolvedValue({
        _id: 'wallet-id',
        name: 'Test Wallet',
        balance: 10.1235,
        createdAt: new Date(),
      });
      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
      });

      const result = await walletService.createWallet({
        name: 'Test Wallet',
        balance: 10.123456,
      });

      expect(walletPersistence.create).toHaveBeenCalledWith(
        { name: 'Test Wallet', balance: 10.1235 },
        { session: 'session' }
      );

      expect(transactionPersistence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          walletId: 'wallet-id',
          amount: 10.1235,
          balance: 10.1235,
        }),
        { session: 'session' }
      );

      expect(result.wallet.balance).toBe(10.1235);
      expect(result.transaction._id).toBe('txn-id');
    });
  });

  describe('getWalletById', () => {
    it('should get wallet by id', async () => {
      walletPersistence.findById.mockResolvedValue({
        _id: 'wallet-id',
        name: 'Test Wallet',
        balance: 5,
      });

      const wallet = await walletService.getWalletById('wallet-id');

      expect(walletPersistence.findById).toHaveBeenCalledWith('wallet-id');
      expect(wallet._id).toBe('wallet-id');
    });

    it('should throw AppError when wallet not found', async () => {
      walletPersistence.findById.mockResolvedValue(null);

      await expect(walletService.getWalletById('missing-id')).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('updateWalletBalance', () => {
    it('should update wallet balance', async () => {
      walletPersistence.updateBalance.mockResolvedValue({
        _id: 'wallet-id',
        balance: 20,
      });

      const wallet = await walletService.updateWalletBalance('wallet-id', 20, {});

      expect(walletPersistence.updateBalance).toHaveBeenCalledWith(
        'wallet-id',
        20,
        expect.objectContaining({ session: undefined })
      );
      expect(wallet.balance).toBe(20);
    });

    it('should throw AppError when update fails', async () => {
      walletPersistence.updateBalance.mockResolvedValue(null);

      await expect(
        walletService.updateWalletBalance('wallet-id', 20, {})
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should update wallet balance with session', async () => {
      walletPersistence.updateBalance.mockResolvedValue({
        _id: 'wallet-id',
        balance: 30,
      });

      const wallet = await walletService.updateWalletBalance('wallet-id', 30, {
        session: 'test-session',
      });

      expect(walletPersistence.updateBalance).toHaveBeenCalledWith(
        'wallet-id',
        30,
        expect.objectContaining({ session: 'test-session' })
      );
      expect(wallet.balance).toBe(30);
    });
  });

  describe('rounding edge cases', () => {
    it('should round balance up correctly', async () => {
      walletPersistence.create.mockResolvedValue({
        _id: 'wallet-id',
        name: 'Test Wallet',
        balance: 10.1236, // Mock should return the rounded value
        createdAt: new Date(),
      });
      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
      });

      const result = await walletService.createWallet({
        name: 'Test Wallet',
        balance: 10.12355, // Should round to 10.1236
      });

      expect(walletPersistence.create).toHaveBeenCalledWith(
        { name: 'Test Wallet', balance: 10.1236 },
        { session: 'session' }
      );
      expect(result.wallet.balance).toBe(10.1236);
    });

    it('should round balance down correctly', async () => {
      walletPersistence.create.mockResolvedValue({
        _id: 'wallet-id',
        name: 'Test Wallet',
        balance: 10.1234,
        createdAt: new Date(),
      });
      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
      });

      const result = await walletService.createWallet({
        name: 'Test Wallet',
        balance: 10.12344, // Should round to 10.1234
      });

      expect(walletPersistence.create).toHaveBeenCalledWith(
        { name: 'Test Wallet', balance: 10.1234 },
        { session: 'session' }
      );
      expect(result.wallet.balance).toBe(10.1234);
    });

    it('should handle zero balance', async () => {
      walletPersistence.create.mockResolvedValue({
        _id: 'wallet-id',
        name: 'Test Wallet',
        balance: 0,
        createdAt: new Date(),
      });
      transactionPersistence.create.mockResolvedValue({
        _id: 'txn-id',
      });

      const result = await walletService.createWallet({
        name: 'Test Wallet',
        balance: 0,
      });

      expect(walletPersistence.create).toHaveBeenCalledWith(
        { name: 'Test Wallet', balance: 0 },
        { session: 'session' }
      );
      expect(result.wallet.balance).toBe(0);
    });
  });
});
