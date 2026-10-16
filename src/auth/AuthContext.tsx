import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import {
  adoptSession,
  clearAccessToken,
  onSessionChange,
  refreshSession,
  type Me,
  type Session,
} from '@/api/client'

type Status = 'loading' | 'anonymous' | 'authenticated'

type AuthState = {
  status: Status
  user: Me | null
  /** Shown on the sign-in page, for example "You've signed out." */
  notice: string | null
  can: (permission: string) => boolean
  signIn: (email: string, password: string, remember: boolean) => Promise<Me>
  signOut: () => Promise<void>
  /** Use after the server returns a fresh session (for example after a password change). */
  adopt: (session: Session) => void
  clearNotice: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const CHANNEL = 'brightcone-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<Me | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const lose = useCallback(
    (message: string | null) => {
      clearAccessToken()
      queryClient.clear() // the next person must never see this person's cached data
      setUser(null)
      setStatus('anonymous')
      setNotice(message)
    },
    [queryClient],
  )

  // Restore the session after a page reload using the refresh cookie.
  useEffect(() => {
    let cancelled = false
    void refreshSession().then((session) => {
      if (cancelled) return
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
      } else {
        setStatus('anonymous')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // The API client tells us when it refreshed silently or when the session ended.
  useEffect(
    () =>
      onSessionChange((session) => {
        if (session) setUser(session.user)
        else lose('Your session expired. Please sign in again.')
      }),
    [lose],
  )

  // Signing out in one tab signs out the others.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = () => lose("You've signed out.")
    return () => channel.close()
  }, [lose])

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      notice,
      can: (permission) => !!user?.permissions.some((p) => p === permission || p.startsWith(`${permission}:`)),
      signIn: async (email, password, remember) => {
        const session = await authApi.login(email, password, remember)
        adoptSession(session)
        setUser(session.user)
        setNotice(null)
        setStatus('authenticated')
        return session.user
      },
      signOut: async () => {
        try {
          await authApi.logout()
        } catch {
          /* the cookie is cleared locally either way */
        }
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(CHANNEL)
          channel.postMessage('logout')
          channel.close()
        }
        lose("You've signed out.")
      },
      adopt: (session) => {
        adoptSession(session)
        setUser(session.user)
      },
      clearNotice: () => setNotice(null),
    }),
    [status, user, notice, lose],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
