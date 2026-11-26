import { getEntityBySlug, SCORE_CRITERIA } from '../../../data/entities.js'
import LabRadar from '../../entity/LabRadar.jsx'
import HatchedBar from '../../common/HatchedBar.jsx'

const A = getEntityBySlug('hal-9000')
const B = getEntityBySlug('tars')

/** Scene 7 — the Comparison Lab's real radar and score bars: HAL 9000 vs TARS (editorial scores). */
function LabScene({ lineIndex }) {
  return (
    <div className="grid h-full content-center items-center gap-4 md:grid-cols-[1fr_1fr]">
      {/* Narrow screens: a smaller radar keeps its axis labels inside the panel. */}
      <LabRadar a={A} b={B} className="max-w-52 sm:max-w-72" />
      {/* The bars repeat the radar's numbers; on phones there is no room, so desktop only. */}
      <div className="hidden space-y-2 md:block" aria-hidden="true">
        <p className="label-mono mb-3 text-holo">
          {A.name} <span className="text-ink">vs</span> {B.name} · editorial scores
        </p>
        {lineIndex >= 1 &&
          SCORE_CRITERIA.slice(0, 3).map((criterion) => (
            <div key={criterion.key} className="space-y-1">
              <p className="text-xs text-ink">{criterion.label}</p>
              <HatchedBar label={A.name} value={A.scores[criterion.key]} variant="data" />
              <HatchedBar label={B.name} value={B.scores[criterion.key]} variant="editorial" />
            </div>
          ))}
      </div>
    </div>
  )
}

export default LabScene
