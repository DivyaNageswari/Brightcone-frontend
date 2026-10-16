import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'ghost' | 'link'
  block?: boolean
  loading?: boolean
}

export function Button({
  variant,
  block,
  loading,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const cls = ['btn', variant, block ? 'block' : '', className].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

function Messages({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <>
      {hint && !error && (
        <span id={`${id}-hint`} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className="error" role="alert">
          {error}
        </span>
      )}
    </>
  )
}

const describedBy = (id: string, error?: string, hint?: string) =>
  [error ? `${id}-err` : '', hint && !error ? `${id}-hint` : ''].filter(Boolean).join(' ') ||
  undefined

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, id, ...rest },
  ref,
) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <input
          ref={ref}
          id={inputId}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/** A password input with a Show/Hide button. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type'>>(
  function PasswordField({ label, error, hint, id, ...rest }, ref) {
    const auto = useId()
    const inputId = id ?? auto
    const [shown, setShown] = useState(false)
    return (
      <div className="field">
        <label htmlFor={inputId}>{label}</label>
        <div className="input-wrap">
          <input
            ref={ref}
            id={inputId}
            className="input"
            type={shown ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, error, hint)}
            {...rest}
          />
          <button
            type="button"
            className="btn link toggle"
            onClick={() => setShown((s) => !s)}
            aria-pressed={shown}
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        </div>
        <Messages id={inputId} error={error} hint={hint} />
      </div>
    )
  },
)

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'ok' | 'info'
  children: ReactNode
}) {
  return (
    <div className={`alert ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="center-screen" role="status">
      <div className="spinner" />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}

export function Pill({
  tone,
  children,
}: {
  tone?: 'ok' | 'warn' | 'bad' | 'info'
  children: ReactNode
}) {
  return <span className={`pill ${tone ?? ''}`}>{children}</span>
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="avatar" aria-hidden="true">
      {initials}
    </span>
  )
}

type LabelProps = { label: string; error?: string; hint?: string }

/** A native `<select>` with the same label / error / hint treatment as `TextField`. */
export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & LabelProps
>(function SelectField({ label, error, hint, id, children, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <select
          ref={ref}
          id={inputId}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        >
          {children}
        </select>
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/** A multi-line text input with the same label / error / hint treatment as `TextField`. */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & LabelProps
>(function TextareaField({ label, error, hint, id, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <textarea
          ref={ref}
          id={inputId}
          className="input"
          rows={rest.rows ?? 4}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/**
 * Tabs following the WAI-ARIA tabs pattern. Only the selected panel is mounted, so a panel's
 * contents never sit in the DOM where a screen reader would read them out of context.
 */
export function Tabs({
  tabs,
  initial,
  active: activeProp,
  onChange,
}: {
  tabs: { id: string; label: string; panel?: ReactNode }[]
  initial?: string
  active?: string
  onChange?: (id: string) => void
}) {
  const [internalActive, setInternalActive] = useState(initial ?? tabs[0]?.id ?? '')
  const active = activeProp !== undefined ? activeProp : internalActive
  const handleSelect = (id: string) => {
    setInternalActive(id)
    onChange?.(id)
  }
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  if (!current) return null
  return (
    <div className="tabs">
      <div role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === current.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={t.id === current.id ? 0 : -1}
            className={`tab${t.id === current.id ? ' active' : ''}`}
            onClick={() => handleSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current.panel && (
        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          {current.panel}
        </div>
      )}
    </div>
  )
}


/**
 * A determinate progress bar. `value` is a percentage; the accessible name and the numeric
 * readout are both exposed so the bar is not just a coloured rectangle.
 */
export function ProgressBar({
  label,
  value,
}: {
  label: string
  /** Percentage complete, 0-100. */
  value: number
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="progress">
      <div className="progress-head">
        <span>{label}</span>
        <span className="progress-value">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="progress-track"
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** A single headline number, used in rows on dashboards. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

/** Shown when a list has no rows. `action` is optional, for a "create the first one" button. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {body && <p className="empty-body">{body}</p>}
      {action}
    </div>
  )
}

/**
 * A placeholder shown while data loads. Marked `aria-hidden` because the live region next to it
 * already announces the loading state; announcing both would talk over itself.
 */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-group" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  )
}

/* ==========================================================================
   P1-21 Components: FormModal, ConfirmDialog, Drawer, Toast, and DataTable
   ========================================================================== */

/**
 * An accessible modal dialog with backdrop, escape key listener, and focus trapping.
 */
export function FormModal({
  open,
  onClose,
  title,
  children,
  maxWidth = '520px',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-box"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/**
 * A specialized dialog for confirming destructive or critical actions.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
}) {
  return (
    <FormModal open={open} onClose={onClose} title={title} maxWidth="420px">
      <div className="confirm-body">
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} type="button" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </FormModal>
  )
}

/**
 * A sliding drawer sheet panel from the left or right of the screen.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  position = 'right',
  width = '400px',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  position?: 'right' | 'left'
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className={`drawer-panel drawer-${position}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h3 id="drawer-title" className="drawer-title">
            {title}
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}

export { ToastProvider } from './Toast'
export type { ToastItem, ToastInput, ToastType, ToastContextValue } from './ToastContext'



/** Data table column definition */
export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
}

/**
 * Generic data table with search filtering, column sorting, and pagination.
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Search records…',
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyBody,
  loading = false,
}: {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  emptyTitle?: string
  emptyBody?: string
  loading?: boolean
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      }),
    )
  }, [data, query, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="table-kit">
      {searchable && (
        <div className="table-search-bar">
          <input
            type="search"
            className="input search-input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            aria-label="Filter records"
          />
          <span className="table-count-badge">
            {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'sortable' : ''}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="sort-icon">
                        {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '24px' }}>
                  <Skeleton rows={3} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px' }}>
                  <EmptyState title={emptyTitle} body={emptyBody} />
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={keyExtractor(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="pagination-buttons">
            <Button
              variant="ghost"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
