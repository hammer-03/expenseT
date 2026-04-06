import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  getBudgetBundle,
  upsertMonthlyBudget,
  deleteMonthlyBudget,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
} from '../controllers/budgetController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  upsertMonthlyRules,
  createCategoryRules,
  updateCategoryRules,
  validateRequest,
} from '../middleware/validateBudget.js'

const router = Router()

router.use(authenticate)

router.get('/', asyncHandler(getBudgetBundle))
router.put(
  '/monthly',
  upsertMonthlyRules,
  validateRequest,
  asyncHandler(upsertMonthlyBudget)
)
router.delete('/monthly', asyncHandler(deleteMonthlyBudget))
router.post(
  '/categories',
  createCategoryRules,
  validateRequest,
  asyncHandler(createCategoryBudget)
)
router.patch(
  '/categories/:id',
  updateCategoryRules,
  validateRequest,
  asyncHandler(updateCategoryBudget)
)
router.delete('/categories/:id', asyncHandler(deleteCategoryBudget))

export default router
