"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type { Expense } from "@/components/expense-list"
import {
  buildMonthlySpending,
  buildLast7DaysSpending,
  buildCategoryBreakdown,
  filterExpensesInMonth,
  sumAmount,
} from "@/lib/analytics/fromExpenses"

interface ExpenseChartsProps {
  expenses: Expense[]
  /** Sum of all category budget limits (this month’s cap). */
  monthlyBudgetTotal?: number
}

const areaChartConfig: ChartConfig = {
  amount: {
    label: "Spent",
    color: "var(--chart-1)",
  },
}

export function ExpenseCharts({
  expenses,
  monthlyBudgetTotal = 0,
}: ExpenseChartsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeBar, setActiveBar] = useState<number | null>(null)

  const monthlyData = useMemo(
    () => buildMonthlySpending(expenses, 6),
    [expenses]
  )

  const categoryData = useMemo(
    () => buildCategoryBreakdown(expenses),
    [expenses]
  )

  const dailyTarget =
    monthlyBudgetTotal > 0 ? monthlyBudgetTotal / 30 : 0

  const weeklyData = useMemo(() => {
    const rows = buildLast7DaysSpending(expenses)
    return rows.map((r) => ({
      ...r,
      target: Math.round(dailyTarget * 100) / 100,
    }))
  }, [expenses, dailyTarget])

  const thisMonthExpenses = useMemo(
    () => filterExpensesInMonth(expenses, new Date()),
    [expenses]
  )
  const totalSpentThisMonth = sumAmount(thisMonthExpenses)

  const budgetTotal = monthlyBudgetTotal
  const percentUsed =
    budgetTotal > 0
      ? Math.min(100, Math.round((totalSpentThisMonth / budgetTotal) * 100))
      : 0

  const budgetData = useMemo(() => {
    const remaining = Math.max(0, budgetTotal - totalSpentThisMonth)
    return [
      { name: "Spent", value: totalSpentThisMonth, fill: "var(--chart-1)" },
      { name: "Remaining", value: remaining, fill: "var(--muted)" },
    ]
  }, [budgetTotal, totalSpentThisMonth])

  const pieChartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {}
    categoryData.forEach((c) => {
      cfg[c.name] = { label: c.name, color: c.color }
    })
    return cfg
  }, [categoryData])

  const barChartConfig: ChartConfig = {
    amount: {
      label: "Spent",
      color: "var(--chart-2)",
    },
    target: {
      label: "Daily target",
      color: "var(--muted)",
    },
  }

  const radialChartConfig: ChartConfig = {
    Spent: { label: "Spent", color: "var(--chart-1)" },
    Remaining: { label: "Remaining", color: "var(--muted)" },
  }

  const empty = expenses.length === 0

  if (empty) {
    return (
      <Card className="border-border bg-card border-dashed">
        <CardContent className="py-16 text-center text-muted-foreground text-sm">
          Add expenses to see spending charts and category breakdown.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="border-border bg-card lg:col-span-2 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-card-foreground">
              Monthly spending
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
                <span className="text-muted-foreground">Spent</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={areaChartConfig}
            className="aspect-[2/1] w-full"
            style={{ minHeight: 220 }}
          >
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                dx={-8}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{
                  stroke: "var(--muted-foreground)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#fillAmount)"
                animationDuration={1200}
                animationEasing="ease-out"
                dot={{ fill: "var(--chart-1)", strokeWidth: 0, r: 0 }}
                activeDot={{
                  fill: "var(--chart-1)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                  r: 6,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium text-card-foreground">
            Budget status
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal pt-1">
            This month vs total category budgets
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pb-4">
          {budgetTotal <= 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-2">
              Set category budgets to track spending against limits.
            </p>
          ) : (
            <>
              <div className="relative">
                <ChartContainer
                  config={radialChartConfig}
                  className="aspect-square"
                  style={{ width: 180, height: 180 }}
                >
                  <RadialBarChart
                    data={budgetData}
                    innerRadius={60}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      background={{ fill: "var(--muted)" }}
                      cornerRadius={10}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </RadialBarChart>
                </ChartContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {percentUsed}%
                  </span>
                  <span className="text-xs text-muted-foreground">of budget</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2 text-sm">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">
                    ${Math.round(totalSpentThisMonth * 100) / 100}
                  </p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">
                    ${Math.round(Math.max(0, budgetTotal - totalSpentThisMonth) * 100) / 100}
                  </p>
                  <p className="text-xs text-muted-foreground">Left</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-card-foreground">
            By category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No category totals yet.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <ChartContainer
                config={pieChartConfig}
                className="aspect-square flex-shrink-0"
                style={{ width: 160, height: 160 }}
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={false}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) =>
                      setActiveCategory(categoryData[index].name)
                    }
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          activeCategory === null || activeCategory === entry.name
                            ? 1
                            : 0.3
                        }
                        style={{
                          cursor: "pointer",
                          transition: "opacity 200ms ease-out",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {categoryData.map((cat) => (
                  <div
                    key={cat.name}
                    className={cn(
                      "flex items-center justify-between text-sm transition-opacity duration-200",
                      activeCategory !== null &&
                        activeCategory !== cat.name &&
                        "opacity-40"
                    )}
                    onMouseEnter={() => setActiveCategory(cat.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-muted-foreground truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{cat.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-card-foreground">
              Last 7 days
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
              <span className="text-muted-foreground">Daily spending</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className="aspect-[3/1] w-full"
            style={{ minHeight: 180 }}
          >
            <BarChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                dx={-8}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              {dailyTarget > 0 && (
                <Bar
                  dataKey="target"
                  fill="var(--muted)"
                  radius={[4, 4, 4, 4]}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              )}
              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                animationDuration={1000}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              >
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      dailyTarget > 0 && entry.amount > entry.target
                        ? "var(--chart-4)"
                        : "var(--chart-2)"
                    }
                    opacity={activeBar === null || activeBar === index ? 1 : 0.5}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 150ms ease-out",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
