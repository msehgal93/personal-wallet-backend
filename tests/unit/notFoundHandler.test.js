const { notFoundHandler } = require('../../src/middleware/notFoundHandler');
const { HTTP_STATUS } = require('../../src/utils/constants');

describe('Not Found Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/api/v1/nonexistent',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 404 with error message', () => {
    notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
    });
  });
});
