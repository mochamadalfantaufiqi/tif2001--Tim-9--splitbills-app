'use strict';

const AppError = require('../utils/AppError');

/**
 * Middleware factory: validasi req.body / req.query / req.params dengan skema Zod.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [target='body']
 */
module.exports =
  (schema, target = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validasi gagal', 400, errors));
    }
    req[target] = result.data;
    return next();
  };
