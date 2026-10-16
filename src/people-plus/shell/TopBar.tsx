import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { APPS, getAppForPath } from '../data'
import { Icon } from '../Icon'
import { AppLauncher } from './AppLauncher'
import { CommandPalette } from './CommandPalette'

export function TopBar({ onMenu, theme, setTheme }: { onMenu: () => void; theme: string; setTheme: (mode: 'light' | 'dark') => void }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const app = getAppForPath(location.pathname)
  const [launcher, setLauncher] = useState(false)
  const [command, setCommand] = useState(false)
  const [notice, setNotice] = useState(false)
  useEffect(() => { const onShortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommand(true) } }; window.addEventListener('keydown', onShortcut); return () => window.removeEventListener('keydown', onShortcut) }, [])
  return <>
    <header className="pp-header"><button type="button" className="pp-icon-button pp-mobile-menu" aria-label="Open app navigation" onClick={onMenu}><Icon name="menu" /></button><button type="button" className="pp-launcher-button" onClick={() => setLauncher(true)} aria-label="Open app launcher"><Icon name="grid" /></button><div className="pp-breadcrumb"><span>Brightcone</span><Icon name="chevron" size={13} /><strong>{app.name}</strong></div><button type="button" className="pp-command-trigger" onClick={() => setCommand(true)}><Icon name="search" /><span>Search people, pages or actions</span><kbd>Ctrl K</kbd></button><div className="pp-header-actions"><button type="button" className="pp-icon-button" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button><div className="pp-notice-wrap"><button type="button" className="pp-icon-button" aria-label="Notifications" onClick={() => setNotice((value) => !value)}><Icon name="bell" /></button>{notice && <div className="pp-notice-popover"><strong>Coming soon</strong><p>Notifications are not available in the connected backend.</p></div>}</div><span className="pp-header-divider" /><span className="pp-user"><span className="pp-avatar">{user?.name.slice(0, 1).toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.role.replace('_', ' ')}</small></span></span><button type="button" className="pp-signout" onClick={() => void signOut()}>Sign out</button></div></header>
    {launcher && <AppLauncher apps={APPS} close={() => setLauncher(false)} />}
    {command && <CommandPalette close={() => setCommand(false)} />}
  </>
}
