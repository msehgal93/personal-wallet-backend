const { validate } = require('../../src/middleware/validation');
const { AppError } = require('../../src/utils/errors');
const Joi = require('joi');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() when validation passes', () => {
    const schema = Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    });

    req.body = { name: 'Test' };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next() with AppError when validation fails', () => {
    const schema = Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    });

    req.body = {};
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should sanitize and update req.body when validation passes', () => {
    const schema = Joi.object({
      body: Joi.object({
        name: Joi.string().trim().required(),
        age: Joi.number().optional(),
      }),
    });

    req.body = { name: '  Test  ', age: 25, extra: 'field' };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(req.body.name).toBe('Test');
    expect(req.body.age).toBe(25);
    expect(req.body.extra).toBeUndefined();
  });

  it('should validate query parameters', () => {
    const schema = Joi.object({
      query: Joi.object({
        skip: Joi.number().integer().min(0).optional(),
        limit: Joi.number().integer().min(1).optional(),
      }),
    });

    req.query = { skip: '5', limit: '10' };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.query.skip).toBe(5);
    expect(req.query.limit).toBe(10);
  });

  it('should validate params', () => {
    const schema = Joi.object({
      params: Joi.object({
        id: Joi.string().required(),
      }),
    });

    req.params = { id: 'test-id' };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle multiple validation errors', () => {
    const schema = Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
        balance: Joi.number().min(0).required(),
      }),
    });

    req.body = {};
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toContain('name');
    expect(error.message).toContain('balance');
  });
});
