import mongoose from 'mongoose'

const monthlyBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalLimit: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [1, 'Alert threshold must be at least 1'],
      max: [100, 'Alert threshold cannot exceed 100'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.createdAt
        delete ret.updatedAt
        delete ret.userId
        return ret
      },
    },
  }
)

export const MonthlyBudget = mongoose.model('MonthlyBudget', monthlyBudgetSchema)
