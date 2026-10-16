import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/api/client'
import { getHealth, type Health } from '@/api/health'
import { Icon } from './Icon'
import { initials } from './data'
import { SuiteDashboard } from './SuiteDashboard'

type UserRecord = {
  pid: string
  email: string
  name: string
  role: string
  status: string
  created_at: string
}
type UserPage = { results?: UserRecord[]; items?: UserRecord[]; data?: UserRecord[] }

function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`pp-card pp-card-pad ${className}`}>
      <div className="pp-card-head">
        <div>
          <h2 className="pp-card-title">{title}</h2>
          {subtitle && <p className="pp-card-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ApiStatus() {
  const { data, isLoading, isError } = useQuery<Health>({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 30_000,
    retry: 1,
  })
  const healthy = !isLoading && !isError && data?.status === 'ok'
  return (
    <span className={`pp-pill ${healthy ? 'ok' : 'warn'}`}>
      <span className="pp-status-dot" />
      {isLoading ? 'Checking API' : healthy ? 'API connected' : 'API unavailable'}
    </span>
  )
}

export const Home = SuiteDashboard
export const SuiteDash = SuiteDashboard

function PageIntro({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <div className="pp-page-stack">
      <section className="pp-module-intro">
        <div className="pp-module-icon">
          <Icon name="grid" size={20} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </section>
      {children ?? (
        <Card title="Module connection" subtitle="Data availability">
          <div className="pp-integration-panel">
            <div>
              <strong>This module is not connected to the current backend.</strong>
              <p>
                The available API currently supports account authentication, identity, health
                checks, password management, admin account management, and audit history. This
                module needs matching backend endpoints before live records or submissions can be
                shown.
              </p>
            </div>
            <ApiStatus />
          </div>
          <Link className="pp-button" to="/">
            Back to home
          </Link>
        </Card>
      )}
    </div>
  )
}

export function SimpleView({ title, sub }: { title: string; sub: string }) {
  return (
    <PageIntro title={title} subtitle={sub}>
      <Card title="Coming soon" subtitle="Live data is not available for this module">
        <div className="pp-integration-panel">
          <div>
            <strong>{title} is not connected to a backend data service yet.</strong>
            <p>
              {sub}. This page will become available when its live API and persistence are
              implemented.
            </p>
          </div>
          <span className="pp-pill">Coming soon</span>
        </div>
      </Card>
    </PageIntro>
  )
}

export function Employees() {
  const { can } = useAuth()
  const enabled = can('users:manage')
  const query = useQuery<UserPage>({
    queryKey: ['admin-users'],
    queryFn: () => api<UserPage>('/admin/users'),
    enabled,
    retry: 1,
  })
  if (!enabled)
    return (
      <PageIntro title="People directory" subtitle="Your Brightcone People Plus directory">
        <Card
          title="Directory access"
          subtitle="Employee directory is restricted to HR administrators"
        >
          <div className="pp-empty">
            Your current role does not include access to the connected admin account directory.
          </div>
        </Card>
      </PageIntro>
    )
  const people = query.data?.results ?? query.data?.items ?? query.data?.data ?? []
  return (
    <PageIntro title="Portal accounts" subtitle="Accounts returned by the connected backend">
      <Card
        title="Portal accounts"
        subtitle="Live login accounts from the admin users endpoint"
        action={<ApiStatus />}
      >
        {query.isError ? (
          <div className="pp-error">Could not load accounts: {(query.error as Error).message}</div>
        ) : query.isLoading ? (
          <div className="pp-empty">Loading accounts…</div>
        ) : people.length === 0 ? (
          <div className="pp-empty">No accounts returned by the backend.</div>
        ) : (
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.pid}>
                    <td>
                      <div className="pp-person-cell">
                        <span className="pp-row-avatar">{initials(person.name)}</span>
                        <span>
                          <strong>{person.name}</strong>
                          <small>{person.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{person.role.replace('_', ' ')}</td>
                    <td>
                      <span className={`pp-pill ${person.status === 'active' ? 'ok' : 'warn'}`}>
                        {person.status}
                      </span>
                    </td>
                    <td>{new Date(person.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageIntro>
  )
}

export const Directory = Employees
export const People = Employees
export const Recruitment = () => (
  <SimpleView title="Recruit" sub="Candidate pipelines, interviews and hiring activity" />
)
export const Approvals = () => (
  <SimpleView title="Approvals" sub="Approval records and review actions" />
)
export const Reports = () => (
  <SimpleView title="Reports" sub="People operations and workforce insights" />
)
export const Settings = () => (
  <SimpleView title="Settings" sub="Workspace preferences and account options" />
)
export const LeaveAdmin = () => <SimpleView title="Leave" sub="Team leave calendar and requests" />
export const MyLeave = () => (
  <SimpleView title="My leave" sub="Leave balance, requests and history" />
)
export const ExpensesAdmin = () => (
  <SimpleView title="Expense" sub="Expense review and reimbursement" />
)
export const MyExpenses = () => (
  <SimpleView title="My expenses" sub="Expense claims and reimbursement status" />
)
export const Payroll = () => (
  <SimpleView title="Payroll" sub="Payroll runs, payslips and compensation" />
)
export const MyPay = () => (
  <SimpleView title="My payslips" sub="Your payroll documents and payment history" />
)
export const SignDocs = () => <SimpleView title="Sign" sub="Documents awaiting signature" />
export const Feed = () => (
  <SimpleView title="Connect" sub="Company updates and team announcements" />
)
export const Learn = () => (
  <SimpleView title="Learn" sub="Learning paths and employee development" />
)
export const Roster = () => <SimpleView title="Shift" sub="Shift schedule and attendance" />
