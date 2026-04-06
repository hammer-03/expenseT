import type {
  BudgetBundle,
  CategoryBudget,
  MonthlyBudget,
} from "@/lib/types/budget"
import { apiFetch } from "./client"

async function parseJson(res: Response) {
  const text = await res.text()
  let json: { success?: boolean; data?: unknown; error?: string } = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(text || "Invalid response from server")
  }
  if (!res.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : `Request failed (${res.status})`
    )
  }
  return json
}

export async function fetchBudgetBundle(): Promise<BudgetBundle> {
  const res = await apiFetch("/budgets", { cache: "no-store" })
  const json = await parseJson(res)
  if (!json.data || typeof json.data !== "object") {
    throw new Error("Invalid response: missing data")
  }
  return json.data as BudgetBundle
}

export async function upsertMonthlyBudget(body: {
  totalLimit: number
  alertThreshold?: number
}): Promise<MonthlyBudget> {
  const res = await apiFetch("/budgets/monthly", {
    method: "PUT",
    body: JSON.stringify(body),
  })
  const json = await parseJson(res)
  if (json.data === undefined || json.data === null) {
    throw new Error("Invalid response: missing data")
  }
  return json.data as MonthlyBudget
}

export async function deleteMonthlyBudget(): Promise<void> {
  await apiFetch("/budgets/monthly", { method: "DELETE" })
}

export async function createCategoryBudget(body: {
  category: string
  limit: number
  alertThreshold?: number
}): Promise<CategoryBudget> {
  const res = await apiFetch("/budgets/categories", {
    method: "POST",
    body: JSON.stringify(body),
  })
  const json = await parseJson(res)
  if (json.data === undefined) {
    throw new Error("Invalid response: missing data")
  }
  return json.data as CategoryBudget
}

export async function updateCategoryBudget(
  id: string,
  body: { limit?: number; alertThreshold?: number }
): Promise<CategoryBudget> {
  const res = await apiFetch(`/budgets/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  const json = await parseJson(res)
  if (json.data === undefined) {
    throw new Error("Invalid response: missing data")
  }
  return json.data as CategoryBudget
}

export async function deleteCategoryBudget(id: string): Promise<void> {
  const res = await apiFetch(`/budgets/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  await parseJson(res)
}
