import { getToken, removeToken } from "@/lib/auth/token"

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000"
  )
}

/** Authenticated fetch — redirects to /login on 401. */
export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  if (res.status === 401) {
    removeToken()
    throw new Error("Session expired")
  }

  return res
}
