import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Card, Pill } from '@/components/ui'

/** Placeholder landing page. The real Home (clock card, leave balances, to-dos) is ticket P3-07. */
export function HomePage() {
  const { user } = useAuth()
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  if (!user) return null

  return (
    <>
      {notice && <Alert kind="info">{notice}</Alert>}
      <h1>Welcome, {user.name.split(' ')[0]}</h1>
      <Card>
        <h3>You are signed in</h3>
        <p style={{ color: 'var(--muted)' }}>
          More pages appear here as they are built. These are the things your role is allowed to do:
        </p>
        <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user.permissions.map((p) => (
            <Pill key={p} tone="info">
              {p}
            </Pill>
          ))}
        </p>
      </Card>
    </>
  )
}
