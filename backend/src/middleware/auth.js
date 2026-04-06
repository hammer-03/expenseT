import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler.js'

export function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401))
  }
  const token = auth.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return next(new AppError('Server misconfiguration', 500))
  }
  try {
    const decoded = jwt.verify(token, secret)
    req.userId = decoded.sub
    req.userEmail = decoded.email
    next()
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401))
    }
    next(e)
  }
}
