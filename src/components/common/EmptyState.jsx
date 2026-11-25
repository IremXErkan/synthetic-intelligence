import { SearchX } from 'lucide-react'
import HudPanel from './HudPanel.jsx'

/**
 * Shown when a request succeeds but returns no records.
 * `children` can hold an action, e.g. a "Clear filters" button.
 */
function EmptyState({
  title = 'No records match',
  message = 'Try a different search or clear the filters.',
  tab = 'Records found: 0',
  children,
}) {
  return (
    <div role="status" className="mx-auto max-w-xl">
      <HudPanel title={tab} titleAs="p" bodyClassName="p-6 text-center">
        <SearchX className="mx-auto size-8 text-ink-muted" aria-hidden="true" />
        <h2 className="label-mono mt-3 text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        {children && <div className="mt-5">{children}</div>}
      </HudPanel>
    </div>
  )
}

export default EmptyState
