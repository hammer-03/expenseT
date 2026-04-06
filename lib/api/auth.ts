import { getApiBaseUrl } from "./client"
import { setToken, removeToken, getToken } from "@/lib/auth/token"

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthPayload {
  token: string
  user: AuthUser
}

async function parseJson(res: Response) {
  const text = await res.text()
  let json: { success?: boolean; data?: unknown; error?: string } = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(text || "Invalid response")
  }
  if (!res.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : `Request failed (${res.status})`
    )
  }
  return json
}

export async function signup(body: {
  email: string
  password: string
  name?: string
}): Promise<AuthPayload> {
  const res = await fetch(`${getApiBaseUrl()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await parseJson(res)
  const data = json.data as AuthPayload
  if (!data?.token) throw new Error("Invalid signup response")
  setToken(data.token)
  return data
}

export async function login(body: {
  email: string
  password: string
}): Promise<AuthPayload> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await parseJson(res)
  const data = json.data as AuthPayload
  if (!data?.token) throw new Error("Invalid login response")
  setToken(data.token)
  return data
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken()
  if (!token) throw new Error("Not logged in")
  const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await parseJson(res)
  return json.data as AuthUser
}

export function logout() {
  removeToken()
}
