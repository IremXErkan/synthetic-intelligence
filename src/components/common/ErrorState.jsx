import { RotateCcw, TriangleAlert } from 'lucide-react'
import HudPanel from './HudPanel.jsx'

/**
 * Error panel with a retry action.
 * @param {{ error?: Error, title?: string, onRetry?: () => void }} props
 */
function ErrorState({ error, title = 'Signal lost', onRetry }) {
  const message = error?.message || 'Something went wrong while contacting the archive.'

  return (
    <div role="alert" className="mx-auto max-w-xl">
      <HudPanel variant="alert" title="Analysis failed" titleAs="p" bodyClassName="p-6 text-center">
        <TriangleAlert className="mx-auto size-8 text-threat-critical" aria-hidden="true" />
        <h2 className="label-mono mt-3 text-threat-critical">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="chamfer mt-5 inline-flex items-center gap-2 bg-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors [--cut:8px] hover:bg-signal/20 hover:text-signal"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Retry
          </button>
        )}
      </HudPanel>
    </div>
  )
}

export default ErrorState
