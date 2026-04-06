import { body, validationResult } from 'express-validator'
import { AppError } from './errorHandler.js'

export const signupRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name').optional().trim().isLength({ max: 100 }),
]

export const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

export function validateAuthRequest(req, res, next) {
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
