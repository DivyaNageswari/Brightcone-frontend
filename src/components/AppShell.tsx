import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { currentTheme, toggleTheme } from '@/theme'
import { Avatar, Button } from './ui'

type NavItem = { to: string; label: string; permission?: string }

// Menu entries appear automatically for roles that hold the permission. Later phases add lines here.
const NAV: NavItem[] = [{ to: '/', label: 'Home' }]

const ROLE_LABEL: Record<string, string> = {
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance',
  hr_admin: 'HR Admin',
}

export function AppShell() {
  const { user, can, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(currentTheme())
  if (!user) return null

  return (
    <div className="shell">
      <aside className={`side${open ? ' open' : ''}`} aria-label="Main navigation">
        <div className="brand">Brightcone People</div>
        <span className="role">{ROLE_LABEL[user.role] ?? user.role}</span>
        <nav>
          {NAV.filter((item) => !item.permission || can(item.permission)).map((item) => (
            <NavLink key={item.to} to={item.to} end onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/change-password" onClick={() => setOpen(false)}>
            Change password
          </NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="top">
          <Button
            variant="ghost"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            Menu
          </Button>
          <div className="grow" />
          <Button
            variant="ghost"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(toggleTheme())}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <div className="who">
            <Avatar name={user.name} />
            <div>
              {user.name}
              <br />
              <small>{user.email}</small>
            </div>
          </div>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
