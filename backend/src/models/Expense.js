import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: [200, 'Merchant cannot exceed 200 characters'],
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment method cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    recurring: {
      type: Boolean,
      default: false,
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
        delete ret.userId
        if (ret.createdAt) {
          ret.createdAt = new Date(ret.createdAt).toISOString()
        }
        delete ret.updatedAt
        return ret
      },
    },
    toObject: { virtuals: true },
  }
)

expenseSchema.index({ userId: 1, createdAt: -1 })

export const Expense = mongoose.model('Expense', expenseSchema)
