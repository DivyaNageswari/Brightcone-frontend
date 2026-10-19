import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { APPS, getAppForPath, initials } from '../data'
import { Icon } from '../Icon'
import { AppLauncher } from './AppLauncher'
import { CommandPalette } from './CommandPalette'
import { Grid, Search, Sun, Moon, Bell, LogOut, ChevronRight, Menu } from 'lucide-react'

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
  const [hasUnread, setHasUnread] = useState(true)

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

  // Subpage title for breadcrumb
  const getSubpageTitle = () => {
    const path = location.pathname
    if (path.includes('salary-structure')) return 'Salary structure'
    if (path.includes('office-expense')) return 'Office expenses'
    if (path.includes('finance-expenses') || path.includes('review-claims')) return 'Review claims'
    if (path.includes('admin')) return 'Payroll runner'
    if (path.startsWith('/payroll')) return 'Payroll dashboard'
    if (path.startsWith('/expense') || path.startsWith('/my-expense')) return 'Expense dashboard'
    return `${app.name} dashboard`
  }

  return (
    <>
      <header className="h-16 px-4 lg:px-6 bg-[#090E1A]/95 border-b border-[#162238] flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
        {/* Left Section: Mobile Menu + Launcher + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={onMenu}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <button
            type="button"
            onClick={() => setLauncher(true)}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
            title="App Launcher"
          >
            <Grid size={18} />
          </button>

          {/* Breadcrumb matching Image 1 & 2 */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer">{app.name}</span>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-white font-semibold">{getSubpageTitle()}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <button
            type="button"
            onClick={() => setCommand(true)}
            className="w-full bg-[#111A2C] hover:bg-[#15223A] border border-[#1E2D4A] rounded-xl px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-300 transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search size={15} className="text-slate-500 group-hover:text-slate-400" />
              <span>Search people, pages or actions</span>
            </div>
            <kbd className="hidden md:inline text-[10px] bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded text-slate-400 font-mono">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Section: Theme + Notifications + User Pill + Sign Out */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            onClick={() => setHasUnread(false)}
            className="relative w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all"
            title="Notifications"
          >
            <Bell size={17} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090E1A]" />
            )}
          </button>

          {/* User Pill matching Image 1 & 2 */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full bg-[#111A2C] border border-[#1E2D4A]">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {initials(user?.name ?? 'HR')}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-white">{user?.name ?? 'Ananya Rao'}</div>
              <div className="text-[10px] text-slate-400">
                {user?.role === 'hr_admin' ? 'People Ops Lead' : user?.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/60 flex items-center justify-center transition-all"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {launcher && <AppLauncher apps={APPS} close={() => setLauncher(false)} />}
      {command && <CommandPalette close={() => setCommand(false)} />}
    </>
  )
}
