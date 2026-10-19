import { Suspense } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Spinner, ToastProvider } from '@/components/ui'
import { NotificationsProvider } from '@/services/NotificationsContext'
import { routes } from '@/routes/route-table'

/** The app below the providers. All URLs live in `routes/route-table.tsx`. */
export default function App() {
  const element = useRoutes(routes)
  const { pathname } = useLocation()
  return (
    <NotificationsProvider>
      <ToastProvider>
        <ErrorBoundary scope="app" resetKey={pathname}>
          <Suspense fallback={<Spinner />}>{element}</Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </NotificationsProvider>
  )
}
