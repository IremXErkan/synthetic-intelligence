import { SCORE_CRITERIA } from '../../data/entities.js'
import HatchedBar from '../common/HatchedBar.jsx'

/** The five editorial scores as hatched bars, with the required disclaimer. */
function ScoreBars({ scores }) {
  return (
    <div>
      <div className="space-y-3">
        {SCORE_CRITERIA.map((criterion) => (
          <HatchedBar key={criterion.key} label={criterion.label} value={scores[criterion.key]} />
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        Scores (1–10) are the archive&apos;s subjective editorial assessment, not a scientific measurement.
      </p>
    </div>
  )
}

export default ScoreBars
