// "::  LABEL  value" rows. Always render DataRow inside DataList (a <dl>), so
// screen readers get proper term/description pairs. The "::" prefix is decorative.

const LABEL_COLORS = {
  data: 'text-signal', // TMDB values
  editorial: 'text-pulse', // archive analysis values
  neutral: 'text-ink-muted',
}

export function DataList({ className = '', children }) {
  return <dl className={`space-y-2 ${className}`}>{children}</dl>
}

/**
 * @param {{ label: string, value?: React.ReactNode, variant?: 'data'|'editorial'|'neutral' }} props
 * A null/empty value shows "—" (read as "Not available"); no placeholder data is invented.
 */
export function DataRow({ label, value, variant = 'data' }) {
  const isEmpty = value === null || value === undefined || value === ''

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className={`label-mono shrink-0 sm:w-44 ${LABEL_COLORS[variant] ?? LABEL_COLORS.data}`}>
        <span aria-hidden="true" className="mr-2 opacity-60">
          ::
        </span>
        {label}
      </dt>
      <dd className="text-sm text-ink">
        {isEmpty ? (
          <>
            <span aria-hidden="true" className="text-ink-muted">
              —
            </span>
            <span className="sr-only">Not available</span>
          </>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
