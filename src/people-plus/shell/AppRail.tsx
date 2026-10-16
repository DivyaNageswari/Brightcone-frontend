import { NavLink, useNavigate } from 'react-router-dom'
import { APPS, type AppKey } from '../data'
import { Icon } from '../Icon'

export function AppRail({
  active,
  mobileOpen = false,
  onNavigate,
}: {
  active: AppKey
  mobileOpen?: boolean
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  return (
    <aside className={`pp-rail${mobileOpen ? ' is-open' : ''}`} aria-label="Brightcone apps">
      <NavLink to="/" className="pp-rail-brand" aria-label="Brightcone home">
        <img src="/brightcone-mark.png" alt="" />
      </NavLink>
      <nav>
        {APPS.map((app) => (
          <button
            type="button"
            key={app.key}
            className={`pp-rail-app${active === app.key ? ' active' : ''}`}
            style={{ '--app-color': app.color } as React.CSSProperties}
            aria-label={app.name}
            title={app.name}
            onClick={() => {
              navigate(app.path)
              onNavigate?.()
            }}
          >
            <Icon name={app.icon} size={19} />
            <span>{app.name}</span>
          </button>
        ))}
      </nav>
      <div className="pp-rail-bottom">
        <span className="pp-rail-help" title="Help">
          <Icon name="help" />
        </span>
      </div>
    </aside>
  )
}
