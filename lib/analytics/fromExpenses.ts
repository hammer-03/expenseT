import type { Expense } from "@/components/expense-list"

/** Resolve a comparable timestamp for an expense (prefers server `createdAt`). */
export function getExpenseTimeMs(e: Expense): number {
  if (e.createdAt) {
    const t = new Date(e.createdAt).getTime()
    if (!Number.isNaN(t)) return t
  }
  const y = new Date().getFullYear()
  const parsed = Date.parse(`${e.date}, ${y}`)
  if (!Number.isNaN(parsed)) return parsed
  return Date.now()
}

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export function filterExpensesInMonth(
  expenses: Expense[],
  ref: Date = new Date()
): Expense[] {
  const y = ref.getFullYear()
  const m = ref.getMonth()
  return expenses.filter((e) => {
    const t = new Date(getExpenseTimeMs(e))
    return t.getFullYear() === y && t.getMonth() === m
  })
}

export function filterExpensesBetween(
  expenses: Expense[],
  startMs: number,
  endMs: number
): Expense[] {
  return expenses.filter((e) => {
    const t = getExpenseTimeMs(e)
    return t >= startMs && t <= endMs
  })
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** Last `count` calendar months (oldest first) with total spent per month. */
export function buildMonthlySpending(
  expenses: Expense[],
  count = 6
): { month: string; amount: number; key: string }[] {
  const now = new Date()
  const rows: { month: string; amount: number; key: string }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
    const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
    const amount = sumAmount(filterExpensesBetween(expenses, start, end))
    rows.push({ month: label, amount: Math.round(amount * 100) / 100, key })
  }
  return rows
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Last 7 days including today — daily totals. */
export function buildLast7DaysSpending(
  expenses: Expense[]
): { day: string; amount: number; target: number }[] {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const out: { day: string; amount: number; target: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    const amount = sumAmount(filterExpensesBetween(expenses, start, end.getTime()))
    out.push({
      day: DAY_LABELS[new Date(start).getDay()],
      amount: Math.round(amount * 100) / 100,
      target: 0,
    })
  }
  return out
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function buildCategoryBreakdown(expenses: Expense[]): {
  name: string
  value: number
  color: string
  percent: number
}[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0)
  if (total <= 0) return []
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  return entries.map(([name, value], i) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: CHART_COLORS[i % CHART_COLORS.length],
    percent: Math.round((value / total) * 100),
  }))
}
