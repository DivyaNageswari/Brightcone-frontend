import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { listNotifications, markNotificationRead } from '@/api/notifications'
import { APPS, getAppForPath } from '../data'
import { Icon } from '../Icon'
import { AppLauncher } from './AppLauncher'
import { CommandPalette } from './CommandPalette'

export function TopBar({
  onMenu,
  theme,
  setTheme,
}: {
  onMenu: () => void
  theme: string
  setTheme: (mode: 'light' | 'dark') => void
}) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const app = getAppForPath(location.pathname)
  const [launcher, setLauncher] = useState(false)
  const [command, setCommand] = useState(false)
  const [notice, setNotice] = useState(false)
  const queryClient = useQueryClient()
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    refetchInterval: 60_000,
  })
  const markRead = async (id: string) => {
    await markNotificationRead(id)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommand(true)
      }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [])
  return (
    <>
      <header className="pp-header">
        <button
          type="button"
          className="pp-icon-button pp-mobile-menu"
          aria-label="Open app navigation"
          onClick={onMenu}
        >
          <Icon name="menu" />
        </button>
        <button
          type="button"
          className="pp-launcher-button"
          onClick={() => setLauncher(true)}
          aria-label="Open app launcher"
        >
          <Icon name="grid" />
        </button>
        <div className="pp-breadcrumb">
          <span>Brightcone</span>
          <Icon name="chevron" size={13} />
          <strong>{app.name}</strong>
        </div>
        <button type="button" className="pp-command-trigger" onClick={() => setCommand(true)}>
          <Icon name="search" />
          <span>Search people, pages or actions</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div className="pp-header-actions">
          <button
            type="button"
            className="pp-icon-button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <div className="pp-notice-wrap">
            <button
              type="button"
              className="pp-icon-button"
              aria-label={`Notifications${notifications.data?.unread_count ? `, ${notifications.data.unread_count} unread` : ''}`}
              aria-expanded={notice}
              onClick={() => setNotice((value) => !value)}
            >
              <Icon name="bell" />
              {!!notifications.data?.unread_count && (
                <span className="pp-notice-count">
                  {notifications.data.unread_count > 99 ? '99+' : notifications.data.unread_count}
                </span>
              )}
            </button>
            {notice && (
              <div className="pp-notice-popover">
                <strong>Notifications</strong>
                {notifications.isPending && <p>Loading notifications…</p>}
                {notifications.isError && <p>Could not load notifications. Try again.</p>}
                {notifications.data?.items.length === 0 && <p>You’re all caught up.</p>}
                {notifications.data?.items.map((item) => (
                  <button
                    className={`pp-notice-item${item.read_at ? '' : ' is-unread'}`}
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!item.read_at) void markRead(item.id).catch(() => undefined)
                    }}
                  >
                    <span>{item.title}</span>
                    <small>{item.body}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="pp-header-divider" />
          <span className="pp-user">
            <span className="pp-avatar">{user?.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <strong>{user?.name}</strong>
              <small>{user?.role.replace('_', ' ')}</small>
            </span>
          </span>
          <button type="button" className="pp-signout" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>
      {launcher && <AppLauncher apps={APPS} close={() => setLauncher(false)} />}
      {command && <CommandPalette close={() => setCommand(false)} />}
    </>
  )
}
