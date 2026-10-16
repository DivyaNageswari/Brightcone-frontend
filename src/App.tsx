import { Suspense } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { useAuth } from '@/auth/AuthContext'
import { Spinner, ToastProvider } from '@/components/ui'
import { PlusShell } from '@/people-plus/PlusShell'
import {
  Approvals,
  Directory,
  Employees,
  Feed,
  Home,
  Learn,
  LeaveAdmin,
  MyExpenses,
  ExpensesAdmin,
  MyLeave,
  MyPay,
  Payroll,
  Recruitment,
  Reports,
  Roster,
  Settings,
  SignDocs,
  SimpleView,
  SuiteDash,
} from '@/people-plus/views'
import { AuditLogPage } from '@/routes/AuditLogPage'
import { ChangePasswordPage } from '@/routes/ChangePasswordPage'
import { ForgotPasswordPage } from '@/routes/ForgotPasswordPage'
import { LoginPage } from '@/routes/LoginPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { ResetPasswordPage } from '@/routes/ResetPasswordPage'
import { UiKitPage } from '@/routes/UiKitPage'

const isAdmin = (role?: string) => role === 'hr_admin'

function ComingSoonRoute() {
  const { module = 'This module' } = useParams()
  const title = module.split('-').map((word) => word ? `${word[0].toUpperCase()}${word.slice(1)}` : '').join(' ')
  return <SimpleView title={title} sub="This module will be available when its live backend service is connected" />
}

function IndexRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? <SuiteDash /> : <Home />
}

function PeopleRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? (
    <Employees />
  ) : (
    <SimpleView title="My profile" sub="Personal, job and bank details" />
  )
}

function LeaveRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? <LeaveAdmin /> : <MyLeave />
}

function ExpensesRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? <ExpensesAdmin /> : <MyExpenses />
}

function PayrollRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? <Payroll /> : <MyPay />
}

function RecruitRoute() {
  const { user } = useAuth()
  return isAdmin(user?.role) ? (
    <Recruitment />
  ) : (
    <SimpleView title="Jobs & referrals" sub="Job listings and employee referrals" />
  )
}

// Pages added in later phases are loaded on demand with lazy(() => import(...)) and registered
// below inside <RequireAuth permission="...">.
export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            element={
              <RequireAuth>
                <PlusShell />
              </RequireAuth>
            }
          >
            <Route index element={<IndexRoute />} />
            <Route path="people" element={<PeopleRoute />} />
            <Route path="people-dashboard" element={<SimpleView title="People dashboard" sub="Workforce information from connected People services" />} />
            <Route path="coming-soon/:module" element={<ComingSoonRoute />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="employees" element={<Employees />} />
            <Route path="leave" element={<LeaveRoute />} />
            <Route
              path="attendance"
              element={
                <SimpleView title="Attendance" sub="Clock history, regularisations and week view" />
              }
            />
            <Route
              path="profile"
              element={<SimpleView title="My profile" sub="Personal, job and bank details" />}
            />
            <Route path="recruitment" element={<RecruitRoute />} />
            <Route
              path="careers"
              element={
                <SimpleView title="Jobs & referrals" sub="Job listings and employee referrals" />
              }
            />
            <Route path="payroll" element={<PayrollRoute />} />
            <Route path="pay" element={<MyPay />} />
            <Route path="expenses" element={<ExpensesRoute />} />
            <Route path="my-expenses" element={<MyExpenses />} />
            <Route path="sign" element={<SignDocs />} />
            <Route path="my-sign" element={<SignDocs />} />
            <Route path="feed" element={<Feed />} />
            <Route path="directory" element={<Directory />} />
            <Route path="learn" element={<Learn />} />
            <Route path="my-learning" element={<Learn />} />
            <Route path="roster" element={<Roster />} />
            <Route path="my-schedule" element={<Roster />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="ui-kit" element={<UiKitPage />} />
            <Route
              path="audit"
              element={
                <RequireAuth permission="audit:read">
                  <AuditLogPage />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}
