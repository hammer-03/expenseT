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
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  CalendarDays,
  DollarSign,
  Tag,
  FileText,
  Repeat,
  Building2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const categories = [
  { name: "Shopping", icon: ShoppingCart },
  { name: "Coffee", icon: Coffee },
  { name: "Transport", icon: Car },
  { name: "Rent", icon: Home },
  { name: "Food", icon: Utensils },
  { name: "Internet", icon: Wifi },
  { name: "Utilities", icon: Zap },
  { name: "Entertainment", icon: Film },
]

const paymentMethods = [
  { name: "Credit Card", icon: CreditCard },
  { name: "Debit Card", icon: CreditCard },
  { name: "Cash", icon: Banknote },
  { name: "Bank Transfer", icon: Building2 },
  { name: "Digital Wallet", icon: Smartphone },
]

export type NewExpenseInput = {
  description: string
  category: string
  amount: number
  date: string
  merchant?: string
  paymentMethod?: string
  notes?: string
  recurring?: boolean
}

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (expense: NewExpenseInput) => void | Promise<void>
}

export function AddExpenseModal({
  open,
  onOpenChange,
  onAdd,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [merchant, setMerchant] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [recurring, setRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedCategory = categories.find((c) => c.name === category)
  const CategoryIcon = selectedCategory?.icon || Tag

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !category || !amount || submitting) return

    const payload = {
      description,
      category,
      amount: parseFloat(amount),
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      merchant: merchant || undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
      recurring,
    }

    setSubmitting(true)
    try {
      await onAdd(payload)
      setDescription("")
      setCategory("")
      setAmount("")
      setDate(new Date().toISOString().split("T")[0])
      setMerchant("")
      setPaymentMethod("")
      setNotes("")
      setRecurring(false)
      onOpenChange(false)
    } catch {
      // Parent shows toast; keep modal open
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Receipt className="size-5 text-accent" />
            </div>
            <div>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Fill in the details of your expense
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2">
          <FieldGroup className="gap-4">
            {/* Amount - Prominent */}
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <DollarSign className="size-3.5 text-muted-foreground" />
                Amount
              </FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 text-lg font-semibold h-12 bg-input border-border"
                />
              </div>
            </Field>

            {/* Description & Merchant Row */}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  Description
                </FieldLabel>
                <Input
                  placeholder="What did you buy?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  Merchant
                </FieldLabel>
                <Input
                  placeholder="Store name (optional)"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="bg-input border-border"
                />
              </Field>
            </div>

            {/* Category Selection */}
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Tag className="size-3.5 text-muted-foreground" />
                Category
              </FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                        category === cat.name
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-input text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="text-[10px] font-medium">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Date & Payment Method Row */}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  Date
                </FieldLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  Payment Method
                </FieldLabel>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.name} value={method.name}>
                        <div className="flex items-center gap-2">
                          <method.icon className="size-3.5" />
                          {method.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Notes */}
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground" />
                Notes (optional)
              </FieldLabel>
              <Textarea
                placeholder="Add any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-input border-border resize-none h-20"
              />
            </Field>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Repeat className="size-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Recurring Expense
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mark if this repeats monthly
                  </p>
                </div>
              </div>
              <Switch checked={recurring} onCheckedChange={setRecurring} />
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description || !category || !amount || submitting}
              className="gap-2"
            >
              <Receipt className="size-4" />
              {submitting ? "Saving…" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
