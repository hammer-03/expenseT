"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Wallet, Bell, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import type { NavView } from "./expense-sidebar"

interface NavItem {
  icon: typeof LayoutDashboard
  label: string
  view: NavView
  badge?: string | number
}

const mainNavItems = (expenseCount: number): NavItem[] => [
  { icon: LayoutDashboard, label: "Overview", view: "overview" },
  { icon: Receipt, label: "Expenses", view: "expenses", badge: expenseCount },
  { icon: PieChart, label: "Analytics", view: "analytics" },
  { icon: Target, label: "Budget", view: "budget" },
  { icon: Settings, label: "Settings", view: "settings" },
]

interface MobileHeaderProps {
  activeView?: NavView
  onViewChange?: (view: NavView) => void
  expenseCount?: number
  monthlyBudgetTotal?: number
  monthSpent?: number
}

export function MobileHeader({
  activeView = "overview",
  onViewChange,
  expenseCount = 0,
  monthlyBudgetTotal = 0,
  monthSpent = 0,
}: MobileHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const mainNav = mainNavItems(expenseCount)
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account"
  const displayEmail = user?.email ?? ""
  const initial =
    (user?.name?.charAt(0) || user?.email?.charAt(0) || "?").toUpperCase()
  const budgetUsed =
    monthlyBudgetTotal > 0
      ? Math.min(100, Math.round((monthSpent / monthlyBudgetTotal) * 100))
      : 0
  const remaining = Math.max(0, monthlyBudgetTotal - monthSpent)

  const handleNavClick = (view: NavView) => {
    onViewChange?.(view)
    setOpen(false)
  }

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
          <Wallet className="size-5 text-accent-foreground" />
        </div>
        <div>
          <span className="font-semibold text-lg text-foreground">Expenzo</span>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Finance Tracker</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sidebar border-sidebar-border p-0">
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-left text-sidebar-foreground flex items-center gap-3">
                <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
                  <Wallet className="size-5 text-accent-foreground" />
                </div>
                <div>
                  <span className="font-semibold">Expenzo</span>
                  <p className="text-[10px] text-muted-foreground font-normal">Finance Tracker</p>
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigation menu and quick actions
              </SheetDescription>
            </SheetHeader>

            {/* Budget Overview */}
            <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Monthly Budget</span>
                <span className="text-xs font-medium text-accent">
                  {monthlyBudgetTotal > 0 ? `${budgetUsed}% used` : "—"}
                </span>
              </div>
              <Progress
                value={monthlyBudgetTotal > 0 ? budgetUsed : 0}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingUp className="size-3 text-accent" />
                {monthlyBudgetTotal > 0
                  ? `$${Math.round(remaining * 100) / 100} remaining`
                  : "Set a monthly budget"}
              </p>
            </div>

            <nav className="px-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Menu
              </p>
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavClick(item.view)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                        activeView === item.view
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        {item.label}
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] px-1.5 h-5",
                            activeView === item.view 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              </nav>

            {/* User & Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="size-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                  router.push("/login")
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
