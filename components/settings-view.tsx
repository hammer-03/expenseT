"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  Download,
  Trash2,
  ChevronRight,
  Mail,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Check,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import { cn } from "@/lib/utils"

interface SettingsSectionProps {
  icon: typeof User
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon className="size-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function SettingsView() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@email.com",
    phone: "+1 (555) 123-4567",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    budgetAlerts: true,
    transactionAlerts: false,
  })

  const [preferences, setPreferences] = useState({
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    startOfWeek: "monday",
    theme: "dark",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Section */}
      <SettingsSection
        icon={User}
        title="Profile"
        description="Manage your personal information"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-semibold text-accent">
              JD
            </div>
            <div>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-input border-border pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-input border-border pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Configure how you receive alerts"
      >
        <div className="space-y-4">
          {[
            {
              key: "emailAlerts",
              label: "Email Alerts",
              description: "Receive important updates via email",
            },
            {
              key: "pushNotifications",
              label: "Push Notifications",
              description: "Get real-time notifications on your device",
            },
            {
              key: "weeklyReport",
              label: "Weekly Report",
              description: "Summary of your weekly spending",
            },
            {
              key: "budgetAlerts",
              label: "Budget Alerts",
              description: "Notify when approaching budget limits",
            },
            {
              key: "transactionAlerts",
              label: "Transaction Alerts",
              description: "Alert for every new transaction",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, [item.key]: checked })
                }
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Security Section */}
      <SettingsSection
        icon={Lock}
        title="Security"
        description="Protect your account"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter current password"
                className="bg-input border-border pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="bg-input border-border pl-10"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="bg-input border-border pl-10"
              />
            </div>
          </div>
          <Button variant="outline" className="mt-2">
            <Shield className="size-4 mr-2" />
            Update Password
          </Button>
        </div>
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection
        icon={Globe}
        title="Preferences"
        description="Customize your experience"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select
              value={preferences.currency}
              onValueChange={(v) => setPreferences({ ...preferences, currency: v })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Date Format</Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Start of Week</Label>
            <Select
              value={preferences.startOfWeek}
              onValueChange={(v) => setPreferences({ ...preferences, startOfWeek: v })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(v) => setPreferences({ ...preferences, theme: v })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      {/* Data Section */}
      <SettingsSection
        icon={Download}
        title="Data & Privacy"
        description="Manage your data"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all your expense data</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and data</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} className="gap-2">
          {isSaved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose the format for your data export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {["CSV", "JSON", "PDF"].map((format) => (
              <button
                key={format}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="size-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{format} Format</p>
                    <p className="text-xs text-muted-foreground">
                      {format === "CSV" && "Spreadsheet compatible"}
                      {format === "JSON" && "For developers"}
                      {format === "PDF" && "Printable report"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </p>
              <Input className="mt-2 bg-input border-border" placeholder="Type DELETE" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
