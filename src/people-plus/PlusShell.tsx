import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { currentTheme, toggleTheme } from '@/theme'
import { getAppForPath } from './data'
import { SuiteSidebar } from './shell/SuiteSidebar'
import { AppRail } from './shell/AppRail'
import { TopBar } from './shell/TopBar'
import './people-plus.css'
import './suite.css'
import '@/styles/design-system-v3.css'

export function PlusShell() {
  const location = useLocation()
  const app = getAppForPath(location.pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState(currentTheme())
  const setMode = (mode: 'light' | 'dark') => { if (currentTheme() !== mode) toggleTheme(); setTheme(mode) }
  return <div className="pp-app" data-app={app.key}><AppRail active={app.key} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} /><div className="pp-shell"><div className={`pp-sidebar-wrap${mobileOpen ? ' is-open' : ''}`}><SuiteSidebar appKey={app.key} close={() => setMobileOpen(false)} /></div>{mobileOpen && <button className="pp-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}<div className="pp-main"><TopBar onMenu={() => setMobileOpen(true)} theme={theme} setTheme={setMode} /><main className="pp-content"><Outlet /></main></div></div></div>
}
