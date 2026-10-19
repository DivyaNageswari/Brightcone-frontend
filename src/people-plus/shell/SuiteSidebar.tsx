import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { APPS, NAV_BY_ROLE, type AppKey, initials } from '../data'
import { Icon } from '../Icon'
import { LogOut, X, Banknote, Receipt, LayoutDashboard } from 'lucide-react'

export function SuiteSidebar({ appKey, close }: { appKey: AppKey; close?: () => void }) {
  const { user, can, signOut } = useAuth()
  const role = user?.role === 'hr_admin' || user?.role === 'finance' || user?.role === 'admin' ? 'admin' : 'employee'
  const app = APPS.find((entry) => entry.key === appKey) ?? APPS[0]
  const links = NAV_BY_ROLE[role][appKey]?.filter((item) => !item.permission || can(item.permission)) ?? []
  const groups = [...new Set(links.map((item) => item.group))]

  const isPayroll = appKey === 'payroll'
  const isExpense = appKey === 'expense'

  return (
    <aside className="w-64 bg-[#090E1A] border-r border-[#162238] flex flex-col justify-between h-full select-none">
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Top App Header matching Image 1 & Image 2 */}
        <div className="flex items-center justify-between pb-4 border-b border-[#162238] mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-transform ${
                isPayroll
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : isExpense
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
              }`}
            >
              {isPayroll ? (
                <Banknote size={22} />
              ) : isExpense ? (
                <Receipt size={22} />
              ) : (
                <Icon name={app.icon} size={20} />
              )}
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight">{app.name}</div>
              <div className="text-xs text-slate-400">
                {role === 'admin' ? 'HR Admin' : 'Employee Portal'}
              </div>
            </div>
          </div>

          {close && (
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={close}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-4" aria-label={`${app.name} navigation`}>
          {groups.map((group) => (
            <div key={group}>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                {group}
              </div>
              <div className="space-y-1">
                {links
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/payroll' || item.to === '/expenses' || item.to === '/'}
                      onClick={close}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                          isActive
                            ? isPayroll
                              ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold shadow-inner'
                              : isExpense
                              ? 'bg-amber-950/50 border border-amber-500/40 text-amber-300 font-semibold shadow-inner'
                              : 'bg-slate-800/80 border border-slate-700/80 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon name={item.icon} size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.comingSoon && (
                        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </NavLink>
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Card matching Image 1 & 2 */}
      <div className="p-3 m-3 rounded-2xl bg-[#10192A]/90 border border-[#1A2840] flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
            {initials(user?.name ?? 'HR')}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{user?.name ?? 'Ananya Rao'}</div>
            <div className="text-[11px] text-slate-400 truncate">
              {user?.email ?? 'ananya.rao@brightcone.ai'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
