import mongoose from 'mongoose'
import { MonthlyBudget } from '../models/MonthlyBudget.js'
import { CategoryBudget } from '../models/CategoryBudget.js'
import { Expense } from '../models/Expense.js'
import { AppError } from '../middleware/errorHandler.js'

function userObjectId(req) {
  return new mongoose.Types.ObjectId(req.userId)
}

function monthRange() {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return { start, end }
}

async function getSpentThisMonth(userId) {
  const { start, end } = monthRange()
  const uid =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
  const rows = await Expense.aggregate([
    {
      $match: {
        userId: uid,
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const raw = rows[0]?.total ?? 0
  return Math.round(raw * 100) / 100
}

async function getCategorySpendThisMonth(userId) {
  const { start, end } = monthRange()
  const uid =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
  const rows = await Expense.aggregate([
    {
      $match: {
        userId: uid,
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ])
  const map = new Map()
  for (const row of rows) {
    map.set(row._id, Math.round(row.total * 100) / 100)
  }
  return map
}

function serializeMonthly(doc, spent) {
  const j = doc.toJSON()
  j.spent = spent
  return j
}

export async function getBudgetBundle(req, res) {
  const uid = userObjectId(req)
  const monthlyDoc = await MonthlyBudget.findOne({ userId: uid })
  const spentMonth = await getSpentThisMonth(uid)
  const monthlyTotal = monthlyDoc
    ? serializeMonthly(monthlyDoc, spentMonth)
    : null

  const catDocs = await CategoryBudget.find({ userId: uid }).sort({
    category: 1,
  })
  const spendMap = await getCategorySpendThisMonth(uid)
  const categories = catDocs.map((b) => {
    const j = b.toJSON()
    j.spent = spendMap.get(b.category) || 0
    return j
  })

  res.status(200).json({
    success: true,
    data: { monthlyTotal, categories },
  })
}

export async function upsertMonthlyBudget(req, res) {
  const uid = userObjectId(req)
  const { totalLimit, alertThreshold } = req.body
  const limit = Number(totalLimit)
  if (Number.isNaN(limit) || limit < 0) {
    throw new AppError('totalLimit must be a non-negative number', 400)
  }

  const doc = await MonthlyBudget.findOneAndUpdate(
    { userId: uid },
    {
      $set: {
        totalLimit: limit,
        ...(alertThreshold !== undefined && {
          alertThreshold: Number(alertThreshold),
        }),
      },
      $setOnInsert: { userId: uid },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  )

  const spent = await getSpentThisMonth(uid)
  res.status(200).json({
    success: true,
    data: serializeMonthly(doc, spent),
  })
}

export async function deleteMonthlyBudget(req, res) {
  const uid = userObjectId(req)
  await MonthlyBudget.findOneAndDelete({ userId: uid })
  res.status(200).json({
    success: true,
    message: 'Monthly budget cleared',
    data: null,
  })
}

export async function createCategoryBudget(req, res) {
  const uid = userObjectId(req)
  const { category, limit, alertThreshold } = req.body
  const doc = await CategoryBudget.create({
    userId: uid,
    category: category.trim(),
    limit: Number(limit),
    alertThreshold:
      alertThreshold !== undefined ? Number(alertThreshold) : 80,
  })
  const spendMap = await getCategorySpendThisMonth(uid)
  const j = doc.toJSON()
  j.spent = spendMap.get(doc.category) || 0
  res.status(201).json({ success: true, data: j })
}

export async function updateCategoryBudget(req, res) {
  const uid = userObjectId(req)
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid budget ID', 400)
  }

  const { limit, alertThreshold } = req.body
  const updates = {}
  if (limit !== undefined) updates.limit = Number(limit)
  if (alertThreshold !== undefined) updates.alertThreshold = Number(alertThreshold)

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide limit and/or alertThreshold to update', 400)
  }

  const doc = await CategoryBudget.findOneAndUpdate(
    { _id: id, userId: uid },
    { $set: updates },
    { new: true, runValidators: true }
  )
  if (!doc) throw new AppError('Category budget not found', 404)

  const spendMap = await getCategorySpendThisMonth(uid)
  const j = doc.toJSON()
  j.spent = spendMap.get(doc.category) || 0
  res.status(200).json({ success: true, data: j })
}

export async function deleteCategoryBudget(req, res) {
  const uid = userObjectId(req)
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid budget ID', 400)
  }
  const deleted = await CategoryBudget.findOneAndDelete({ _id: id, userId: uid })
  if (!deleted) throw new AppError('Category budget not found', 404)
  res.status(200).json({
    success: true,
    message: 'Category budget deleted',
    data: { id: deleted._id.toString() },
  })
}
