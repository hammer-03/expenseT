"use client"

import {
  DollarSign,
  CreditCard,
  Target,
  Wallet,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Expense } from "@/components/expense-list"
import {
  filterExpensesInMonth,
  sumAmount,
} from "@/lib/analytics/fromExpenses"

interface StatCardProps {
  title: string
  value: string
  icon: typeof DollarSign
  description?: string
  accentColor?: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accentColor = "accent",
}: StatCardProps) {
  return (
    <Card className="border-border bg-card group hover:bg-muted/30 transition-colors duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "size-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              accentColor === "accent" && "bg-accent/15 text-accent",
              accentColor === "chart-1" && "bg-chart-1/15 text-chart-1",
              accentColor === "chart-2" && "bg-chart-2/15 text-chart-2",
              accentColor === "chart-4" && "bg-chart-4/15 text-chart-4"
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1 tracking-tight">
            {value}
          </p>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="size-3" />
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatMoney(n: number) {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

interface ExpenseStatsProps {
  expenses: Expense[]
  /** Sum of category budget limits (monthly cap). */
  monthlyBudgetTotal: number
}

export function ExpenseStats({
  expenses,
  monthlyBudgetTotal,
}: ExpenseStatsProps) {
  const totalAll = sumAmount(expenses)
  const now = new Date()
  const thisMonth = filterExpensesInMonth(expenses, now)
  const totalThisMonth = sumAmount(thisMonth)

  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15)
  const lastMonth = filterExpensesInMonth(expenses, prev)
  const totalLastMonth = sumAmount(lastMonth)

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const dayOfMonth = now.getDate()
  const dailyAvg =
    dayOfMonth > 0 ? totalThisMonth / dayOfMonth : 0

  const budgetLeft = Math.max(0, monthlyBudgetTotal - totalThisMonth)

  const stats: StatCardProps[] = [
    {
      title: "Total spent",
      value: formatMoney(totalAll),
      icon: DollarSign,
      description: "All recorded expenses",
      accentColor: "accent",
    },
    {
      title: "This month",
      value: formatMoney(totalThisMonth),
      icon: CreditCard,
      description:
        totalLastMonth > 0
          ? `${totalThisMonth <= totalLastMonth ? "Down" : "Up"} from ${formatMoney(totalLastMonth)} last month`
          : "No expenses last month to compare",
      accentColor: "chart-1",
    },
    {
      title: "Daily average",
      value: formatMoney(Math.round(dailyAvg * 100) / 100),
      icon: Wallet,
      description: `Based on ${dayOfMonth} day${dayOfMonth === 1 ? "" : "s"} so far this month`,
      accentColor: "chart-2",
    },
    {
      title: "Budget left",
      value:
        monthlyBudgetTotal > 0
          ? formatMoney(budgetLeft)
          : "—",
      icon: Target,
      description:
        monthlyBudgetTotal > 0
          ? `${daysInMonth - dayOfMonth} day${daysInMonth - dayOfMonth === 1 ? "" : "s"} left in month`
          : "Add budgets to track remaining allowance",
      accentColor: "chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
