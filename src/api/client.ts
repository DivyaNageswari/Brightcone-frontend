// The one place that talks to the backend (ticket P1-16).
//
// Security rules kept here:
// - The access token lives in memory only: never localStorage, sessionStorage or a URL.
// - The refresh token is an HttpOnly cookie that scripts cannot read; the browser sends it.
// - A 401 triggers exactly one silent refresh (shared by all callers) and one retry.
import { env } from '@/config/env'
import type { components } from './schema'

export type Session = components['schemas']['SessionResponse']
export type Me = components['schemas']['MeResponse']

const BASE = env.apiUrl
const CSRF = { 'X-Requested-With': 'brightcone' }

export class ApiError extends Error {
  status: number
  /** Machine-readable code from the server, for example `account_locked`. */
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

let accessToken: string | null = null
export const getAccessToken = () => accessToken
export const clearAccessToken = () => {
  accessToken = null
}

type SessionListener = (session: Session | null) => void
const listeners = new Set<SessionListener>()
/** Called whenever a session is created or lost outside the login form (silent refresh, expiry). */
export const onSessionChange = (fn: SessionListener) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const notify = (s: Session | null) => listeners.forEach((fn) => fn(s))

export function adoptSession(session: Session) {
  accessToken = session.access_token
}

async function toError(res: Response): Promise<ApiError> {
  let body: { error?: string; description?: string } = {}
  try {
    body = await res.json()
  } catch {
    /* not JSON */
  }
  return new ApiError(res.status, body.description ?? res.statusText, body.error)
}

let refreshing: Promise<Session | null> | null = null

/** Swaps the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<Session | null> {
  refreshing ??= (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: CSRF,
    })
    if (!res.ok) {
      accessToken = null
      return null
    }
    const session = (await res.json()) as Session
    accessToken = session.access_token
    return session
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = () =>
    fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    })

  let res = await send()
  // Auth endpoints answer 401 for "wrong password"; only other calls mean "token expired".
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const session = await refreshSession()
    if (!session) {
      notify(null)
      throw await toError(res)
    }
    notify(session)
    res = await send()
  }
  if (!res.ok) throw await toError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
})
export const csrfHeaders = CSRF
