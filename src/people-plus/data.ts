export type AppKey = 'people' | 'recruit' | 'payroll' | 'expense' | 'sign' | 'connect' | 'learn' | 'shift' | 'plus'
export type AppDefinition = { key: AppKey; name: string; icon: string; color: string; description: string; path: string }
export type SideLink = { label: string; to: string; icon: string; group: string; permission?: string; comingSoon?: boolean }

export const APPS: AppDefinition[] = [
  { key: 'people', name: 'People', icon: 'users', color: '#12A58E', description: 'Employee records, time off and HR operations', path: '/people-dashboard' },
  { key: 'recruit', name: 'Recruit', icon: 'briefcase', color: '#7C5CFF', description: 'Jobs, candidates, interviews and offers', path: '/recruitment' },
  { key: 'payroll', name: 'Payroll', icon: 'pay', color: '#0F9F6E', description: 'Payroll runs, salary register and compliance', path: '/payroll' },
  { key: 'expense', name: 'Expense', icon: 'receipt', color: '#E07A1D', description: 'Claims, approvals and reimbursements', path: '/expenses' },
  { key: 'sign', name: 'Sign', icon: 'pen', color: '#D9466F', description: 'E-signatures for offers, NDAs and letters', path: '/sign' },
  { key: 'connect', name: 'Connect', icon: 'chat', color: '#0BA6CC', description: 'Company feed, kudos and announcements', path: '/feed' },
  { key: 'learn', name: 'Learn', icon: 'learn', color: '#6366F1', description: 'Courses, compliance training and skills', path: '/learn' },
  { key: 'shift', name: 'Shift', icon: 'calendar', color: '#3B82C4', description: 'Rosters, shift swaps and attendance', path: '/roster' },
  { key: 'plus', name: 'People Plus', icon: 'dashboard', color: '#0B6FDB', description: 'Your whole HR suite on one dashboard', path: '/' },
]

const soon = (label: string, icon: string, group: string): SideLink => ({ label, icon, group, to: `/coming-soon/${encodeURIComponent(label.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`, comingSoon: true })
const link = (label: string, to: string, icon: string, group: string, permission?: string): SideLink => ({ label, to, icon, group, permission })

export const NAV_BY_ROLE: Record<'admin' | 'employee', Record<AppKey, SideLink[]>> = {
  admin: {
    plus: [link('Suite dashboard', '/', 'dashboard', 'Overview'), link('Approvals inbox', '/approvals', 'inbox', 'Overview'), link('Reports & analytics', '/reports', 'chart', 'Overview'), link('Settings & access', '/settings', 'gear', 'Administration'), link('Audit log', '/audit', 'shield', 'Administration', 'audit:read')],
    people: [link('People dashboard', '/people-dashboard', 'dashboard', 'Overview'), link('Portal accounts', '/employees', 'users', 'Workforce', 'users:manage'), soon('Org structure', 'org', 'Workforce'), soon('Onboarding', 'login', 'Workforce'), soon('Exits & offboarding', 'logout', 'Workforce'), soon('Leave management', 'leave', 'Time off'), soon('Performance', 'chart', 'Operations'), soon('Assets', 'laptop', 'Operations'), soon('Documents & letters', 'doc', 'Operations'), soon('Helpdesk queue', 'chat', 'Operations')],
    recruit: [soon('Recruit dashboard', 'dashboard', 'Overview'), soon('Pipeline & jobs', 'briefcase', 'Hiring')],
    payroll: [soon('Payroll dashboard', 'dashboard', 'Overview'), soon('Payroll runs', 'pay', 'Payroll'), soon('Benefits', 'heart', 'Payroll')],
    expense: [soon('Expense dashboard', 'dashboard', 'Overview'), soon('All claims', 'receipt', 'Claims')],
    sign: [soon('Sign dashboard', 'dashboard', 'Overview'), soon('Signature requests', 'pen', 'Documents'), soon('Templates', 'doc', 'Documents')],
    connect: [soon('Company feed', 'chat', 'Overview'), soon('Announcements', 'mega', 'Communicate'), soon('People directory', 'users', 'Communicate')],
    learn: [soon('Learn dashboard', 'dashboard', 'Overview'), soon('Courses', 'learn', 'Catalogue')],
    shift: [soon('Weekly roster', 'calendar', 'Overview'), soon('Swap requests', 'swap', 'Manage'), soon('Attendance & shifts', 'clock', 'Manage')],
  },
  employee: {
    plus: [link('My dashboard', '/', 'home', 'Overview')],
    people: [soon('My profile', 'user', 'Me'), soon('Leave', 'leave', 'Me'), soon('Attendance', 'clock', 'Me'), soon('Goals & reviews', 'chart', 'Grow'), soon('Documents & letters', 'doc', 'Workplace'), soon('My assets', 'laptop', 'Workplace'), soon('HR helpdesk', 'chat', 'Workplace'), soon('Resignation', 'logout', 'Workplace')],
    recruit: [soon('Jobs & referrals', 'briefcase', 'Careers')],
    payroll: [soon('Payslips & tax', 'pay', 'Pay'), soon('Benefits', 'heart', 'Pay')],
    expense: [soon('My expenses', 'receipt', 'Claims')],
    sign: [soon('Documents to sign', 'pen', 'Documents')],
    connect: [soon('Company feed', 'chat', 'Community'), soon('People directory', 'users', 'Community')],
    learn: [soon('My learning', 'learn', 'Learning')],
    shift: [soon('My schedule', 'calendar', 'Schedule')],
  },
}

export function getAppForPath(path: string): AppDefinition {
  for (const app of APPS) {
    if (path === app.path) return app
    if (path.startsWith(app.path + '/') && app.path !== '/') return app
  }
  if (path === '/people-dashboard' || path === '/employees') return APPS.find((app) => app.key === 'people')!
  if (path === '/approvals' || path === '/reports' || path === '/settings' || path === '/audit') return APPS.find((app) => app.key === 'plus')!
  return APPS.find((app) => app.key === 'plus')!
}

export const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
