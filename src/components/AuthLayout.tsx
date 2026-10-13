import { useState, type ReactNode } from 'react'
import { currentTheme, toggleTheme } from '@/theme'
import { Button, Card } from './ui'

/** The two-panel frame shared by sign-in, forgot-password and reset-password. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const [theme, setTheme] = useState(currentTheme())
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <strong>Brightcone People</strong>
        <h2>Everything about work at Brightcone, in one place.</h2>
        <p>
          Apply for leave, download payslips and raise requests. HR runs payroll, approvals and
          hiring from one inbox.
        </p>
      </section>
      <section className="auth-form">
        <div className="corner">
          <Button
            variant="ghost"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(toggleTheme())}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
        <Card>
          <h1>{title}</h1>
          {subtitle && <p style={{ color: 'var(--muted)', marginTop: 0 }}>{subtitle}</p>}
          {children}
        </Card>
      </section>
    </div>
  )
}
