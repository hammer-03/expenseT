"use client"

import { useState } from "react"
import {
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Utensils,
  Wifi,
  Zap,
  Film,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, typeof ShoppingCart> = {
  Shopping: ShoppingCart,
  Coffee: Coffee,
  Transport: Car,
  Rent: Home,
  Food: Utensils,
  Internet: Wifi,
  Utilities: Zap,
  Entertainment: Film,
}

const categoryColors: Record<string, string> = {
  Shopping: "bg-chart-1/20 text-chart-1",
  Coffee: "bg-chart-3/20 text-chart-3",
  Transport: "bg-chart-2/20 text-chart-2",
  Rent: "bg-chart-4/20 text-chart-4",
  Food: "bg-chart-5/20 text-chart-5",
  Internet: "bg-accent/20 text-accent",
  Utilities: "bg-chart-4/20 text-chart-4",
  Entertainment: "bg-chart-5/20 text-chart-5",
}

export interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  merchant?: string
  paymentMethod?: string
  notes?: string
  recurring?: boolean
  /** ISO string from API — used for analytics when present */
  createdAt?: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
  onEdit?: (expense: Expense) => void
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const categories = ["all", ...new Set(expenses.map((e) => e.category))]

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        filterCategory === "all" || expense.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              Recent Expenses
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.length} transactions totaling ${totalFiltered.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 w-full sm:w-[200px] bg-input border-border h-9"
              />
            </div>
            <Select
              value={filterCategory}
              onValueChange={(v) => {
                setFilterCategory(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[130px] bg-input border-border h-9">
                <Filter className="size-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
            >
              <ArrowUpDown className="size-3.5" />
              <span className="hidden sm:inline">
                {sortBy === "date" ? "Date" : "Amount"}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {paginatedExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No expenses found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedExpenses.map((expense) => {
              const Icon = categoryIcons[expense.category] || ShoppingCart
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        categoryColors[expense.category] || "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {expense.description}
                        </p>
                        {expense.recurring && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-muted"
                        >
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {expense.date}
                        </span>
                        {expense.merchant && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            at {expense.merchant}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-semibold text-card-foreground">
                        -${expense.amount.toFixed(2)}
                      </span>
                      {expense.paymentMethod && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {expense.paymentMethod}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(expense)}>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete?.(expense.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i
                if (page > totalPages) return null
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
