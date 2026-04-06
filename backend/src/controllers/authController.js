import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'

const SALT_ROUNDS = 10

function signToken(user) {
  const secret = process.env.JWT_SECRET
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function signup(req, res) {
  const { email, password, name } = req.body
  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) {
    throw new AppError('Email already registered', 400)
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await User.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    name: name?.trim() || undefined,
  })
  const token = signToken(user)
  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
      },
    },
  })
}

export async function login(req, res) {
  const email = req.body.email?.toLowerCase().trim()
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }
  const ok = await bcrypt.compare(req.body.password, user.passwordHash)
  if (!ok) {
    throw new AppError('Invalid email or password', 401)
  }
  const token = signToken(user)
  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
      },
    },
  })
}

export async function me(req, res) {
  const user = await User.findById(req.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }
  res.status(200).json({ success: true, data: user.toJSON() })
}
