import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { env } from '@/config/env'
import { AccountsPage } from '@/features/accounts/AccountsPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { SuiteDashboard } from '@/features/dashboard/SuiteDashboard'
import { MODULE_ALIASES, MODULE_STUBS } from '@/features/modules/modules'
import { ComingSoonRoute, ModulePage } from '@/features/modules/ModulePage'
import { UiKitPage } from '@/features/ui-kit/UiKitPage'
import { PlusShell } from '@/people-plus/PlusShell'
import { NotFoundPage } from './NotFoundPage'

/** Wraps a page so a crash inside it cannot take down the shell around it. */
const page = (element: ReactNode, scope: string) => (
  <ErrorBoundary scope={scope} resetKey={scope}>
    {element}
  </ErrorBoundary>
)

/**
 * Every URL in the app, in one table.
 *
 * Adding a page: create it under `src/features/<module>/`, add one line here, and (if it needs a
 * permission) wrap it in `<RequireAuth permission="resource:action">`. The server still checks every
 * request: the guard only decides what to show.
 */
const shellChildren: RouteObject[] = [
  { index: true, element: page(<SuiteDashboard />, 'home') },
  { path: 'employees', element: page(<AccountsPage />, 'employees') },
  { path: 'people', element: page(<AccountsPage />, 'people') },
  { path: 'change-password', element: page(<ChangePasswordPage />, 'change-password') },
  {
    path: 'audit',
    element: <RequireAuth permission="audit:read">{page(<AuditLogPage />, 'audit')}</RequireAuth>,
  },
  { path: 'coming-soon/:module', element: page(<ComingSoonRoute />, 'coming-soon') },
  ...MODULE_STUBS.map((stub) => ({
    path: stub.path,
    element: page(<ModulePage path={stub.path} />, stub.path),
  })),
  ...Object.keys(MODULE_ALIASES).map((alias) => ({
    path: alias,
    element: page(<ModulePage path={alias} />, alias),
  })),
  ...(env.uiKitEnabled ? [{ path: 'ui-kit', element: page(<UiKitPage />, 'ui-kit') }] : []),
]

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: (
      <RequireAuth>
        <PlusShell />
      </RequireAuth>
    ),
    children: shellChildren,
  },
  { path: '*', element: <NotFoundPage /> },
]
