"use client"

import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  Wallet,
  Target,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export type NavView = "overview" | "expenses" | "analytics" | "budget" | "settings"

interface NavItem {
  icon: typeof LayoutDashboard
  label: string
  view: NavView
  badge?: string | number
}

const mainNavItems = (
  expenseCount: number
): NavItem[] => [
  { icon: LayoutDashboard, label: "Overview", view: "overview" },
  { icon: Receipt, label: "Expenses", view: "expenses", badge: expenseCount },
  { icon: PieChart, label: "Analytics", view: "analytics" },
  { icon: Target, label: "Budget", view: "budget" },
  { icon: Settings, label: "Settings", view: "settings" },
]

interface ExpenseSidebarProps {
  activeView: NavView
  onViewChange: (view: NavView) => void
  expenseCount?: number
  /** Sum of category budget limits (monthly cap). */
  monthlyBudgetTotal?: number
  /** Total spent this calendar month from expenses. */
  monthSpent?: number
}

export function ExpenseSidebar({
  activeView,
  onViewChange,
  expenseCount = 0,
  monthlyBudgetTotal = 0,
  monthSpent = 0,
}: ExpenseSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
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

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
            <Wallet className="size-5 text-accent-foreground" />
          </div>
          <div>
            <span className="font-semibold text-lg text-sidebar-foreground">
              Expenzo
            </span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Budget Overview Card */}
      <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Monthly Budget</span>
          <span className="text-xs font-medium text-accent">
            {monthlyBudgetTotal > 0 ? `${budgetUsed}% used` : "—"}
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-sidebar-foreground">
            ${Math.round(monthSpent * 100) / 100}
          </span>
          <span className="text-sm text-muted-foreground">
            {monthlyBudgetTotal > 0
              ? `/ ${monthlyBudgetTotal.toLocaleString()}`
              : " / set budgets"}
          </span>
        </div>
        <Progress
          value={monthlyBudgetTotal > 0 ? budgetUsed : 0}
          className="h-1.5"
        />
        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
          <TrendingUp className="size-3 text-accent" />
          {monthlyBudgetTotal > 0
            ? `$${Math.round(remaining * 100) / 100} remaining this month`
            : "Set a monthly budget in Budget"}
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        <ul className="space-y-1">
          {mainNav.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => onViewChange(item.view)}
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
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
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
            router.push("/login")
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}
