import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createExpenseRules,
  validateRequest,
} from '../middleware/validateExpense.js'

const router = Router()

router.use(authenticate)

router.get('/', asyncHandler(getExpenses))
router.post(
  '/',
  createExpenseRules,
  validateRequest,
  asyncHandler(createExpense)
)
router.delete('/:id', asyncHandler(deleteExpense))

export default router
