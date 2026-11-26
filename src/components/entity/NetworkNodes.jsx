import { Handle, Position } from '@xyflow/react'
import { getTitle, getYear } from '../../utils/media.js'
import { getEntityCode } from '../../data/entities.js'

// Edges attach at the node centre (straight lines between circle positions),
// so the handles are invisible points in the middle.
const HANDLE_STYLE = {
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0,
  pointerEvents: 'none',
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  border: 0,
}

function CenterHandles() {
  return (
    <>
      <Handle type="source" position={Position.Top} isConnectable={false} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Top} isConnectable={false} style={HANDLE_STYLE} />
    </>
  )
}

/** Dossier node (editorial layer, purple). */
export function EntityNode({ data }) {
  const { entity, active, dimmed } = data
  return (
    <div
      className={`chamfer cursor-pointer px-3 py-2 text-center transition-opacity [--cut:8px] ${
        active ? 'bg-pulse text-void shadow-[0_0_18px_rgb(167_139_250/0.7)]' : 'bg-pulse/20 text-ink hover:bg-pulse/35'
      } ${dimmed ? 'opacity-35' : 'opacity-100'}`}
    >
      <CenterHandles />
      <p className={`font-mono text-[0.625rem] tracking-widest ${active ? 'text-void/80' : 'text-pulse'}`}>
        {getEntityCode(entity.slug)}
      </p>
      <p className="whitespace-nowrap text-sm font-semibold">{entity.name}</p>
    </div>
  )
}

/** Production node (TMDB layer, cyan). Label comes live from TMDB. */
export function ProductionNode({ data }) {
  const { media, mediaType, tmdbId, active, dimmed } = data
  const label = media ? `${getTitle(media)}${getYear(media) ? ` (${getYear(media)})` : ''}` : `TMDB #${tmdbId}`
  return (
    <div
      // Fixed width: the label arrives later from TMDB, and a stable size keeps fitView correct.
      className={`w-40 cursor-pointer border px-3 py-1.5 text-center transition-opacity ${
        active ? 'border-signal bg-signal text-void' : 'border-signal/50 bg-void/90 text-signal hover:bg-signal/15'
      } ${dimmed ? 'opacity-35' : 'opacity-100'}`}
    >
      <CenterHandles />
      <p className={`font-mono text-[0.625rem] tracking-widest ${active ? 'text-void/80' : 'text-ink-muted'}`}>
        {mediaType === 'movie' ? 'FILM' : 'SERIES'}
      </p>
      <p className="text-xs font-medium leading-snug">{label}</p>
    </div>
  )
}
