import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/api/client'
import { getHealth, type Health } from '@/api/health'
import { APPS } from './data'
import { Icon } from './Icon'

type Account = { pid: string; name: string; role: string; status: string }
type AccountPage = {
  results: Account[]
  pagination: { total_items: number; page: number; page_size: number; total_pages: number }
}

function ComingSoon({ title, icon }: { title: string; icon: string }) {
  return (
    <section className="pp-card pp-dash-panel pp-coming-card">
      <div className="pp-dash-section-title">
        <span>
          <Icon name={icon} size={16} />
          {title}
        </span>
        <small>Coming soon</small>
      </div>
      <div className="pp-coming-state">
        <span>
          <Icon name="clock" size={20} />
        </span>
        <strong>Coming soon</strong>
        <p>This area will appear when its live data service is available.</p>
      </div>
    </section>
  )
}

function AccountSummary() {
  const { can } = useAuth()
  const query = useQuery<AccountPage>({
    queryKey: ['admin-users', 'summary'],
    queryFn: () => api<AccountPage>('/admin/users?page=1&page_size=1'),
    enabled: can('users:manage'),
    staleTime: 30_000,
    retry: 1,
  })
  const count = query.data?.pagination?.total_items
  return (
    <div className="pp-dash-metric">
      <span className="pp-dash-metric-icon" style={{ color: '#12A58E', background: '#12A58E16' }}>
        <Icon name="users" />
      </span>
      <div>
        <small>Portal accounts</small>
        {query.isLoading ? (
          <strong>Loading…</strong>
        ) : query.isError ? (
          <strong>Unavailable</strong>
        ) : count === undefined ? (
          <strong>Coming soon</strong>
        ) : (
          <strong>{count}</strong>
        )}
        <span>
          {!can('users:manage')
            ? 'HR account access required'
            : query.isError
              ? 'Could not load from API'
              : 'Connected admin account directory'}
        </span>
      </div>
    </div>
  )
}

export function SuiteDashboard() {
  const { user, can } = useAuth()
  const navigate = useNavigate()
  const health = useQuery<Health>({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 30_000,
    retry: 1,
  })
  const [today] = useState(() => new Date())
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(today)
  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''
  return (
    <div className="pp-suite-dashboard">
      <section className="pp-suite-welcome">
        <div>
          <div className="pp-suite-date">{date}</div>
          <h1>
            Good{' '}
            {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {firstName} <span className="pp-wave">✦</span>
          </h1>
          <p>Your people operations, connected in one place.</p>
        </div>
        <div className="pp-suite-welcome-actions">
          <span
            className={`pp-api-indicator ${health.data?.status === 'ok' ? 'online' : health.isPending ? 'checking' : 'offline'}`}
          >
            <i />
            {health.data?.status === 'ok'
              ? 'All systems operational'
              : health.isPending
                ? 'Checking connection'
                : 'API unavailable'}
          </span>
          {can('users:manage') && (
            <Link to="/employees" className="pp-button primary">
              <Icon name="users" size={15} />
              View accounts
            </Link>
          )}
        </div>
      </section>
      <section className="pp-dash-metrics">
        <AccountSummary />
        <div className="pp-dash-metric">
          <span
            className="pp-dash-metric-icon"
            style={{ color: '#0B6FDB', background: '#0B6FDB16' }}
          >
            <Icon name="check" />
          </span>
          <div>
            <small>Pending approvals</small>
            <strong>Coming soon</strong>
            <span>Live approvals summary unavailable</span>
          </div>
        </div>
        <div className="pp-dash-metric">
          <span
            className="pp-dash-metric-icon"
            style={{ color: '#7C5CFF', background: '#7C5CFF16' }}
          >
            <Icon name="chart" />
          </span>
          <div>
            <small>Payroll status</small>
            <strong>Coming soon</strong>
            <span>Payroll data is not connected</span>
          </div>
        </div>
        <div className="pp-dash-metric">
          <span
            className="pp-dash-metric-icon"
            style={{ color: '#E07A1D', background: '#E07A1D16' }}
          >
            <Icon name="learn" />
          </span>
          <div>
            <small>Learning progress</small>
            <strong>Coming soon</strong>
            <span>Learning data is not connected</span>
          </div>
        </div>
      </section>
      <section className="pp-suite-apps">
        <div className="pp-suite-section-head">
          <div>
            <h2>Apps</h2>
            <p>Open an app to view its available workspace.</p>
          </div>
          <span>{APPS.length} apps</span>
        </div>
        <div className="pp-suite-app-grid">
          {APPS.map((app) => (
            <button
              type="button"
              key={app.key}
              className="pp-suite-app-card"
              style={{ '--app-accent': app.color } as React.CSSProperties}
              onClick={() => navigate(app.path)}
            >
              <span className="pp-suite-app-icon">
                <Icon name={app.icon} size={19} />
              </span>
              <span className="pp-suite-app-copy">
                <strong>{app.name}</strong>
                <small>{app.description}</small>
              </span>
              <span className="pp-suite-app-status">
                {app.key === 'plus' ? 'Overview' : 'Coming soon'}
              </span>
              <Icon name="arrow" size={15} />
            </button>
          ))}
        </div>
      </section>
      <section className="pp-suite-lower">
        <ComingSoon title="Payroll overview" icon="pay" />
        <ComingSoon title="Approvals" icon="check" />
        <ComingSoon title="Coming up" icon="calendar" />
        <ComingSoon title="Celebrations" icon="heart" />
      </section>
    </div>
  )
}
