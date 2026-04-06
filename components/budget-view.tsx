"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  ShoppingCart,
  Coffee,
  Car,
  Film,
  Utensils,
  Zap,
  Wifi,
  Home,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  PiggyBank,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { CategoryBudget, MonthlyBudget } from "@/lib/types/budget"
import {
  upsertMonthlyBudget,
  deleteMonthlyBudget,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
} from "@/lib/api/budgets"

const BUDGET_CATEGORIES = [
  "Shopping",
  "Coffee",
  "Transport",
  "Rent",
  "Food",
  "Internet",
  "Utilities",
  "Entertainment",
] as const

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

interface BudgetViewProps {
  monthlyBudget: MonthlyBudget | null
  categoryBudgets: CategoryBudget[]
  monthSpent: number
  loading?: boolean
  onBudgetsChange: () => Promise<void>
}

export function BudgetView({
  monthlyBudget,
  categoryBudgets,
  monthSpent,
  loading = false,
  onBudgetsChange,
}: BudgetViewProps) {
  const [totalLimitInput, setTotalLimitInput] = useState("")
  const [alertThreshold, setAlertThreshold] = useState("80")
  const [saving, setSaving] = useState(false)

  const [isAddCatOpen, setIsAddCatOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryBudget | null>(null)
  const [newCat, setNewCat] = useState({
    category: "",
    limit: "",
    alertThreshold: "80",
  })

  useEffect(() => {
    if (monthlyBudget) {
      setTotalLimitInput(String(monthlyBudget.totalLimit))
      setAlertThreshold(String(monthlyBudget.alertThreshold))
    } else {
      setTotalLimitInput("")
      setAlertThreshold("80")
    }
  }, [monthlyBudget])

  const totalLimit = monthlyBudget?.totalLimit ?? 0
  const threshold =
    monthlyBudget?.alertThreshold ??
    (parseInt(alertThreshold, 10) || 80)

  const pct =
    totalLimit > 0
      ? Math.min(100, Math.round((monthSpent / totalLimit) * 100))
      : 0
  const remaining = Math.max(0, totalLimit - monthSpent)
  const isOver = totalLimit > 0 && monthSpent > totalLimit
  const isNear =
    totalLimit > 0 &&
    !isOver &&
    (monthSpent / totalLimit) * 100 >= threshold

  const handleSaveTotal = async () => {
    const lim = parseFloat(totalLimitInput)
    if (Number.isNaN(lim) || lim < 0) {
      toast.error("Enter a valid total monthly budget")
      return
    }
    setSaving(true)
    try {
      await upsertMonthlyBudget({
        totalLimit: lim,
        alertThreshold: parseInt(alertThreshold, 10) || 80,
      })
      toast.success("Total monthly budget saved")
      await onBudgetsChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const handleClearTotal = async () => {
    setSaving(true)
    try {
      await deleteMonthlyBudget()
      toast.success("Total monthly budget cleared")
      await onBudgetsChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not clear")
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCat.category || !newCat.limit) return
    setSaving(true)
    try {
      await createCategoryBudget({
        category: newCat.category,
        limit: parseFloat(newCat.limit),
        alertThreshold: parseInt(newCat.alertThreshold, 10),
      })
      setNewCat({ category: "", limit: "", alertThreshold: "80" })
      setIsAddCatOpen(false)
      toast.success("Category budget added")
      await onBudgetsChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCat) return
    setSaving(true)
    try {
      await updateCategoryBudget(editingCat.id, {
        limit: editingCat.limit,
        alertThreshold: editingCat.alertThreshold,
      })
      setEditingCat(null)
      toast.success("Updated")
      await onBudgetsChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    setSaving(true)
    try {
      await deleteCategoryBudget(id)
      toast.success("Removed")
      await onBudgetsChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    } finally {
      setSaving(false)
    }
  }

  const availableCategories = BUDGET_CATEGORIES.filter(
    (c) => !categoryBudgets.find((b) => b.category === c)
  )

  const getStatusColor = (spent: number, limit: number, th: number) => {
    const p = (spent / limit) * 100
    if (p > 100) return "text-destructive"
    if (p >= th) return "text-chart-3"
    return "text-accent"
  }

  const getProgressColor = (spent: number, limit: number, th: number) => {
    const p = (spent / limit) * 100
    if (p > 100) return "[&>div]:bg-destructive"
    if (p >= th) return "[&>div]:bg-chart-3"
    return "[&>div]:bg-accent"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground text-sm">
        Loading budgets…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="total" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="total" className="gap-2">
            <PiggyBank className="size-4" />
            Total monthly
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="size-4" />
            By category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="total" className="space-y-6 mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <PiggyBank className="size-5 text-accent" />
                Total monthly expense budget
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                One cap for all spending this month (every category combined).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="total-budget">Total monthly budget ($)</Label>
                <Input
                  id="total-budget"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 2000"
                  value={totalLimitInput}
                  onChange={(e) => setTotalLimitInput(e.target.value)}
                  className="bg-input border-border text-lg font-semibold"
                />
              </div>
              <div className="grid gap-2">
                <Label>Alert when usage reaches (%)</Label>
                <Select value={alertThreshold} onValueChange={setAlertThreshold}>
                  <SelectTrigger className="bg-input border-border w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleSaveTotal} disabled={saving} className="gap-2">
                  <Wallet className="size-4" />
                  {saving ? "Saving…" : "Save total budget"}
                </Button>
                {monthlyBudget && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearTotal}
                    disabled={saving}
                  >
                    Clear total
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Target className="size-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly cap</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalLimit > 0 ? `$${totalLimit.toLocaleString()}` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
                    <TrendingDown className="size-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent this month</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${monthSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-chart-1/20 flex items-center justify-center">
                    <TrendingUp className="size-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalLimit > 0 ? `$${remaining.toLocaleString()}` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {totalLimit <= 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Save a total monthly budget to see progress.
                </p>
              ) : (
                <>
                  <Progress
                    value={Math.min(pct, 100)}
                    className={cn(
                      "h-3",
                      isOver
                        ? "[&>div]:bg-destructive"
                        : isNear
                        ? "[&>div]:bg-chart-3"
                        : "[&>div]:bg-accent"
                    )}
                  />
                  <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                    <span>{pct}% used</span>
                    <span>Alert at {threshold}%</span>
                  </div>
                  {isNear && !isOver && (
                    <p className="text-xs text-chart-3 mt-2 flex items-center gap-1">
                      <AlertTriangle className="size-3.5" />
                      Approaching your total monthly limit.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  Category budgets
                </CardTitle>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Optional limits per category (this month&apos;s spending).
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddCatOpen(true)}
                disabled={availableCategories.length === 0}
                className="gap-1"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBudgets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No category budgets yet. Add one to track limits per category.
                </p>
              ) : (
                categoryBudgets.map((budget) => {
                  const Icon = categoryIcons[budget.category] || ShoppingCart
                  const percentage = Math.round(
                    (budget.spent / budget.limit) * 100
                  )
                  const over = percentage > 100
                  const near =
                    percentage >= budget.alertThreshold &&
                    !over

                  return (
                    <div
                      key={budget.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center shrink-0",
                              categoryColors[budget.category] ||
                                "bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-foreground">
                                {budget.category}
                              </h3>
                              {over && (
                                <Badge
                                  variant="secondary"
                                  className="bg-destructive/20 text-destructive text-[10px]"
                                >
                                  Over
                                </Badge>
                              )}
                              {near && (
                                <Badge
                                  variant="secondary"
                                  className="bg-chart-3/20 text-chart-3 text-[10px]"
                                >
                                  Near limit
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  "text-lg font-semibold",
                                  getStatusColor(
                                    budget.spent,
                                    budget.limit,
                                    budget.alertThreshold
                                  )
                                )}
                              >
                                ${budget.spent.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                / ${budget.limit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setEditingCat(budget)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteCategory(budget.id)}
                            disabled={saving}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={cn(
                            "h-2",
                            getProgressColor(
                              budget.spent,
                              budget.limit,
                              budget.alertThreshold
                            )
                          )}
                        />
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>{percentage}% used</span>
                          <span>Alert at {budget.alertThreshold}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add category budget</DialogTitle>
            <DialogDescription>
              Set a monthly limit for one category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newCat.category}
                onValueChange={(v) => setNewCat({ ...newCat, category: v })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly limit ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newCat.limit}
                onChange={(e) => setNewCat({ ...newCat, limit: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Alert threshold (%)</Label>
              <Select
                value={newCat.alertThreshold}
                onValueChange={(v) =>
                  setNewCat({ ...newCat, alertThreshold: v })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCatOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={saving}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit {editingCat?.category}</DialogTitle>
            <DialogDescription>Update limit and alert threshold.</DialogDescription>
          </DialogHeader>
          {editingCat && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Monthly limit ($)</Label>
                <Input
                  type="number"
                  value={editingCat.limit}
                  onChange={(e) =>
                    setEditingCat({
                      ...editingCat,
                      limit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Alert threshold (%)</Label>
                <Select
                  value={editingCat.alertThreshold.toString()}
                  onValueChange={(v) =>
                    setEditingCat({
                      ...editingCat,
                      alertThreshold: parseInt(v, 10),
                    })
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCat(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
