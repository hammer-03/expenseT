import mongoose from 'mongoose'

const categoryBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    limit: {
      type: Number,
      required: true,
      min: [0, 'Limit cannot be negative'],
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

categoryBudgetSchema.index({ userId: 1, category: 1 }, { unique: true })

export const CategoryBudget = mongoose.model('CategoryBudget', categoryBudgetSchema)
