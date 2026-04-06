import { body, validationResult } from 'express-validator'
import { AppError } from './errorHandler.js'

export const upsertMonthlyRules = [
  body('totalLimit')
    .notEmpty()
    .withMessage('Total monthly budget is required')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a non-negative number'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Alert threshold must be between 1 and 100'),
]

export const createCategoryRules = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  body('limit')
    .notEmpty()
    .withMessage('Limit is required')
    .isFloat({ min: 0 })
    .withMessage('Limit must be a non-negative number'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Alert threshold must be between 1 and 100'),
]

export const updateCategoryRules = [
  body('limit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Limit must be a non-negative number'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Alert threshold must be between 1 and 100'),
]

export function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join('; ')
    return next(new AppError(message, 400))
  }
  next()
}
