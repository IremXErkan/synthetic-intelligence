import { RotateCcw, TriangleAlert } from 'lucide-react'

/**
 * Error panel with a retry action.
 * @param {{ error?: Error, title?: string, onRetry?: () => void }} props
 */
function ErrorState({ error, title = 'Signal lost', onRetry }) {
  const message = error?.message || 'Something went wrong while contacting the archive.'

  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-lg border border-threat-critical/40 bg-threat-critical/5 p-6 text-center"
    >
      <TriangleAlert className="mx-auto size-8 text-threat-critical" aria-hidden="true" />
      <p className="label-mono mt-3 text-threat-critical">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-signal hover:text-signal"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorState
