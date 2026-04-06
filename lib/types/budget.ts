/** Total monthly cap (spent = this calendar month). */
export interface MonthlyBudget {
  id: string
  totalLimit: number
  spent: number
  alertThreshold: number
}

export interface CategoryBudget {
  id: string
  category: string
  limit: number
  spent: number
  alertThreshold: number
}

export interface BudgetBundle {
  monthlyTotal: MonthlyBudget | null
  categories: CategoryBudget[]
}
