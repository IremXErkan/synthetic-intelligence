import { SearchX } from 'lucide-react'

/**
 * Shown when a request succeeds but returns no records.
 * `children` can hold an action, e.g. a "Clear filters" button.
 */
function EmptyState({ title = 'No records match', message = 'Try a different search or clear the filters.', children }) {
  return (
    <div role="status" className="mx-auto max-w-xl rounded-lg border border-line bg-panel p-6 text-center">
      <SearchX className="mx-auto size-8 text-ink-muted" aria-hidden="true" />
      <p className="label-mono mt-3 text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

export default EmptyState
