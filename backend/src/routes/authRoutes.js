import { Router } from 'express'
import { signup, login, me } from '../controllers/authController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/auth.js'
import {
  signupRules,
  loginRules,
  validateAuthRequest,
} from '../middleware/validateAuth.js'

const router = Router()

router.post('/signup', signupRules, validateAuthRequest, asyncHandler(signup))
router.post('/login', loginRules, validateAuthRequest, asyncHandler(login))
router.get('/me', authenticate, asyncHandler(me))

export default router
