import {
  forwardRef,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
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
