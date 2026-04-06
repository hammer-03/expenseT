import mongoose from 'mongoose'

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

export function notFoundHandler(req, res, next) {
  next(new AppError(`Not found: ${req.method} ${req.originalUrl}`, 404))
}

/**
 * Global Express error handler. Must have 4 args.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    const first = Object.values(err.errors)[0]
    message = first?.message || 'Validation failed'
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = 'Invalid ID format'
  }

  if (err.code === 11000) {
    statusCode = 400
    message = 'Duplicate entry'
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err)
  } else if (statusCode === 500) {
    console.error(err.message)
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  })
}
