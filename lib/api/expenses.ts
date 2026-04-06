import type { Expense } from "@/components/expense-list"
import { apiFetch } from "./client"

type ApiSuccess<T> = { success: boolean; data: T; error?: string }

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  let json = {} as ApiSuccess<T> & { error?: string }
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
  if (json.data === undefined) {
    throw new Error("Invalid response: missing data")
  }
  return json.data
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await apiFetch("/expenses", { cache: "no-store" })
  return parseResponse<Expense[]>(res)
}

export async function createExpense(
  body: Omit<Expense, "id">
): Promise<Expense> {
  const res = await apiFetch("/expenses", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return parseResponse<Expense>(res)
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await apiFetch(`/expenses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  await parseResponse<{ id: string }>(res)
}
