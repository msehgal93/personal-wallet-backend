const { errorHandler } = require('../../src/middleware/errorHandler');
const { AppError } = require('../../src/utils/errors');
const { HTTP_STATUS } = require('../../src/utils/constants');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error',
    });
  });

  it('should handle ValidationError', () => {
    const error = {
      name: 'ValidationError',
      message: 'Validation failed',
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation error',
    });
  });

  it('should handle CastError and return 400', () => {
    const error = {
      name: 'CastError',
      message: 'Cast to ObjectId failed',
      kind: 'ObjectId',
      path: '_id',
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found',
    });
  });

  it('should handle duplicate key error', () => {
    const error = {
      name: 'MongoServerError',
      code: 11000,
      message: 'Duplicate key error',
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate key error',
    });
  });

  it('should handle unknown errors with 500', () => {
    const error = {
      message: 'Unknown error',
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Unknown error',
    });
  });

  it('should handle errors without message', () => {
    const error = {};
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Server Error',
    });
  });
});
