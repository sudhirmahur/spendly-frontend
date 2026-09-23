import { forwardRef, useState, useId, useEffect } from 'react'
import { cn } from '../../utils/helpers'

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant='primary', size='md', loading, icon, className, ...p }) {
  const V = { primary:'btn-primary', secondary:'btn-secondary', ghost:'btn-ghost', danger:'btn-danger', success:'btn-success', outline:'btn border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300' }
  const S = { xs:'btn-xs', sm:'btn-sm', md:'', lg:'btn-lg', icon:'btn-icon' }
  return (
    <button className={cn('btn', V[variant], S[size], className)} disabled={loading || p.disabled} {...p}>
      {loading ? <Spinner size="sm"/> : icon}{children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = forwardRef(function Input({ label, error, hint, prefix, suffix, className, id, ...p }, ref) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-slate-400 text-sm pointer-events-none">{prefix}</span>}
        <input id={inputId} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn('input', prefix&&'pl-8', suffix&&'pr-8', error&&'input-error', className)} {...p}/>
        {suffix && <span className="absolute right-3.5 text-slate-400 text-sm pointer-events-none">{suffix}</span>}
      </div>
      {error && <p id={`${inputId}-error`} role="alert" className="field-error">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
})

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = forwardRef(function Select({ label, error, children, className, id, ...p }, ref) {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="label">{label}</label>}
      <select id={selectId} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${selectId}-error` : undefined}
        className={cn('input appearance-none', error&&'input-error', className)} {...p}>{children}</select>
      {error && <p id={`${selectId}-error`} role="alert" className="field-error">⚠ {error}</p>}
    </div>
  )
})

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = forwardRef(function Textarea({ label, error, className, id, ...p }, ref) {
  const autoId = useId()
  const textareaId = id || autoId
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={textareaId} className="label">{label}</label>}
      <textarea id={textareaId} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${textareaId}-error` : undefined}
        className={cn('input resize-none', error&&'input-error', className)} {...p}/>
      {error && <p id={`${textareaId}-error`} role="alert" className="field-error">⚠ {error}</p>}
    </div>
  )
})

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, padding=true, hover, onClick, ...p }) {
  return (
    <div onClick={onClick} className={cn('card', padding&&'p-5', hover&&'card-hover cursor-pointer', className)} {...p}>
      {children}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, description, children, size='md', footer }) {
  const titleId = useId()
  const descId  = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const S = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl', '2xl':'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"/>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn('relative w-full bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-modal p-6 animate-[scaleIn_0.2s_ease_forwards]', S[size])}>
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>}
            {description && <p id={descId} className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="btn-ghost btn-icon rounded-xl ml-3 shrink-0 text-slate-400">✕</button>
        </div>
        {children}
        {footer && <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant='gray', dot, className }) {
  const V = { gray:'badge-gray', green:'badge-green', red:'badge-red', blue:'badge-blue', violet:'badge-violet', amber:'badge-amber' }
  const D = { green:'bg-emerald-500', red:'bg-red-500', blue:'bg-blue-500', violet:'bg-violet-500', amber:'bg-amber-500', gray:'bg-slate-400' }
  return (
    <span className={cn(V[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', D[variant])}/>}
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size='md', className }) {
  const S = { sm:'w-3.5 h-3.5', md:'w-5 h-5', lg:'w-7 h-7' }
  return (
    <svg className={cn('animate-spin text-current', S[size], className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center animate-in">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-4">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }) { return <div className={cn('skeleton', className)}/> }
export function SkeletonCard() {
  return <Card className="space-y-3"><Skeleton className="h-3 w-20"/><Skeleton className="h-8 w-32"/><Skeleton className="h-2 w-full"/></Card>
}
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0"/>
      <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-36"/><Skeleton className="h-2.5 w-24"/></div>
      <Skeleton className="h-4 w-20"/>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, subvalue, icon, accent='blue', trend, loading }) {
  if (loading) return <SkeletonCard/>
  const A = {
    blue   : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    red    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    violet : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  return (
    <Card className="space-y-3 animate-in">
      <div className="flex items-center justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-lg font-medium', A[accent])}>{icon}</div>
        {trend !== undefined && (
          <Badge variant={trend >= 0 ? 'green' : 'red'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono tracking-tight">{value}</p>
        {subvalue && <p className="text-xs text-slate-400 mt-0.5">{subvalue}</p>}
      </div>
    </Card>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange, options }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={cn('flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size='md', src, className }) {
  const initials = name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || '?'
  const colors   = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-orange-500','bg-pink-500','bg-cyan-500']
  const color    = colors[(name?.charCodeAt(0)||0) % colors.length]
  const S = { sm:'w-7 h-7 text-xs', md:'w-9 h-9 text-sm', lg:'w-11 h-11 text-base', xl:'w-14 h-14 text-xl' }
  if (src) return <img src={src} className={cn('rounded-xl object-cover shrink-0', S[size], className)} alt={name}/>
  return <div className={cn('rounded-xl flex items-center justify-center text-white font-semibold shrink-0', color, S[size], className)}>{initials}</div>
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, total, onPageChange, loading }) {
  if (pages <= 1) return null
  const visiblePages = () => {
    const arr = []; const start = Math.max(1, page-2); const end = Math.min(pages, page+2)
    if (start > 1) { arr.push(1); if (start > 2) arr.push('...') }
    for (let i = start; i <= end; i++) arr.push(i)
    if (end < pages) { if (end < pages-1) arr.push('...'); arr.push(pages) }
    return arr
  }
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-xs text-slate-400">{total} total record{total !== 1 ? 's' : ''}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page-1)} disabled={page<=1||loading}
          className="btn-secondary btn-xs btn-icon disabled:opacity-40">‹</button>
        {visiblePages().map((p, i) =>
          p === '...'
            ? <span key={i} className="px-2 text-slate-400 text-xs">…</span>
            : <button key={i} onClick={() => onPageChange(p)} disabled={loading}
                className={cn('w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                  p === page ? 'bg-blue-600 text-white' : 'btn-secondary')}>
                {p}
              </button>
        )}
        <button onClick={() => onPageChange(page+1)} disabled={page>=pages||loading}
          className="btn-secondary btn-xs btn-icon disabled:opacity-40">›</button>
      </div>
    </div>
  )
}

// ── Tab ───────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 gap-0.5 border border-slate-200 dark:border-slate-700">
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            active === t.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
          {t.icon && <span className="text-base leading-none">{t.icon}</span>}
          {t.label}
          {t.count !== undefined && (
            <span className={cn('px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
              active === t.value ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500')}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel='Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-2.5 mt-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="danger" className="flex-1" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
export function DropdownMenu({ trigger, children, align='left' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div className={cn('absolute z-50 mt-1.5 min-w-[180px] bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-xl shadow-modal py-1.5 animate-[scaleIn_0.15s_ease_forwards]',
            align === 'right' ? 'right-0' : 'left-0')}>
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        </>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick, icon, danger }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left',
      danger ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800')}>
      {icon && <span className="shrink-0 opacity-60">{icon}</span>}
      {children}
    </button>
  )
}
