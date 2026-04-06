import mongoose from 'mongoose'
import { Expense } from '../models/Expense.js'
import { AppError } from '../middleware/errorHandler.js'

function userObjectId(req) {
  return new mongoose.Types.ObjectId(req.userId)
}

export async function getExpenses(req, res) {
  const uid = userObjectId(req)
  const expenses = await Expense.find({ userId: uid }).sort({ createdAt: -1 }).lean()
  const data = expenses.map((doc) => {
    const o = { ...doc }
    o.id = o._id.toString()
    delete o._id
    delete o.__v
    delete o.userId
    if (o.createdAt) {
      o.createdAt = new Date(o.createdAt).toISOString()
    }
    delete o.updatedAt
    return o
  })
  res.status(200).json({ success: true, data: data })
}

function parseRecurring(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return Boolean(value)
}

export async function createExpense(req, res) {
  const uid = userObjectId(req)
  const payload = {
    userId: uid,
    description: req.body.description,
    category: req.body.category,
    amount: Number(req.body.amount),
    date: req.body.date,
    merchant: req.body.merchant || undefined,
    paymentMethod: req.body.paymentMethod || undefined,
    notes: req.body.notes || undefined,
    recurring: parseRecurring(req.body.recurring),
  }

  const expense = await Expense.create(payload)
  res.status(201).json({ success: true, data: expense.toJSON() })
}

export async function deleteExpense(req, res) {
  const { id } = req.params
  const uid = userObjectId(req)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid expense ID', 400)
  }

  const deleted = await Expense.findOneAndDelete({ _id: id, userId: uid })

  if (!deleted) {
    throw new AppError('Expense not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Expense deleted',
    data: { id: deleted._id.toString() },
  })
}
