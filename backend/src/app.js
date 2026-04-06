import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'expense-tracker-api' })
})

app.use('/auth', authRoutes)
app.use('/expenses', expenseRoutes)
app.use('/budgets', budgetRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
