import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { APPS, NAV_BY_ROLE, type AppKey } from '../data'
import { Icon } from '../Icon'
import { initials } from '../data'

export function SuiteSidebar({ appKey, close }: { appKey: AppKey; close?: () => void }) {
  const { user, can, signOut } = useAuth()
  const role = user?.role === 'hr_admin' ? 'admin' : 'employee'
  const app = APPS.find((entry) => entry.key === appKey)!
  const links = NAV_BY_ROLE[role][appKey].filter((item) => !item.permission || can(item.permission))
  const groups = [...new Set(links.map((item) => item.group))]
  return (
    <aside className="pp-sidebar">
      <div className="pp-sidebar-app">
        <span
          className="pp-sidebar-app-icon"
          style={{ background: `${app.color}20`, color: app.color }}
        >
          <Icon name={app.icon} />
        </span>
        <span>
          <strong>{app.name}</strong>
          <small>Brightcone People Plus</small>
        </span>
        <button
          type="button"
          className="pp-sidebar-collapse"
          aria-label="Close navigation"
          onClick={close}
        >
          <Icon name="x" />
        </button>
      </div>
      <nav className="pp-sidebar-nav" aria-label={`${app.name} navigation`}>
        {groups.map((group) => (
          <section key={group} className="pp-nav-group">
            <h2>{group}</h2>
            {links
              .filter((item) => item.group === group)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={close}
                  className={({ isActive }) => `pp-nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {item.comingSoon && <small className="pp-soon-tag">Soon</small>}
                </NavLink>
              ))}
          </section>
        ))}
      </nav>
      <div className="pp-sidebar-profile">
        <span className="pp-avatar">{initials(user?.name ?? '')}</span>
        <span>
          <strong>{user?.name}</strong>
          <small>{user?.role.replace('_', ' ')}</small>
        </span>
        <button
          type="button"
          className="pp-sidebar-logout"
          aria-label="Sign out"
          title="Sign out"
          onClick={() => void signOut()}
        >
          <Icon name="logout" size={17} />
        </button>
      </div>
    </aside>
  )
}
