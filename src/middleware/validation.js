const { HTTP_STATUS } = require('../utils/constants');
const { AppError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      const message = error.details?.map((d) => d.message).join(', ') || 'Validation error';
      return next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
    }

    if (value) {
      if (value.body) req.body = value.body;
      if (value.query) req.query = value.query;
      if (value.params) req.params = value.params;
    }
    next();
  };
};

module.exports = { validate };
