// Presentational pieces of the Archive Terminal, shared by the real panel
// (ArchiveTerminal) and the intro's Terminal scene, so both look identical.

import { Link } from 'react-router'
import { SquareTerminal, X } from 'lucide-react'
import KeyHint from '../common/KeyHint.jsx'
import StatusDot from '../common/StatusDot.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { Badge, ThreatBadge } from '../common/Badge.jsx'
import { ArchiveCount } from '../layout/StatusBar.jsx'
import useTmdbStatus from '../../hooks/useTmdbStatus.js'
import { IMAGE_SIZES, imageUrl } from '../../utils/imageUrl.js'

const GROUP_LABELS = { commands: 'Commands', dossiers: 'Dossiers', sections: 'Sections' }
const GROUP_ORDER = ['commands', 'dossiers', 'sections']

const TONES = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  error: 'text-threat-critical',
  success: 'text-threat-low',
  editorial: 'text-pulse',
}

const ROW_LINK =
  'group grid min-h-11 grid-cols-[2.25rem_auto_1fr_auto] items-center gap-3 px-2 py-1.5 hover:bg-holo/10 focus-visible:bg-holo/10'

function MediaResults({ items, onNavigate }) {
  return (
    <>
      <ul className="border-l border-holo/25">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.path} onClick={() => onNavigate(item.path)} className={ROW_LINK}>
              <span className="font-mono text-xs text-ink-muted">[{item.n}]</span>
              <TintedImage src={imageUrl(item.posterPath, IMAGE_SIZES.posterThumb)} alt="" className="w-8" />
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink group-hover:text-holo">{item.title}</span>
                <span className="font-mono text-xs text-ink-muted">{item.year ?? 'year unknown'}</span>
              </span>
              {item.inArchive ? <Badge tone="signal">In archive</Badge> : <span />}
            </Link>
          </li>
        ))}
      </ul>
      {/* Same rule as the list pages: the badge only knows archive pages loaded so far. */}
      <p className="font-mono text-[0.6875rem] text-ink-muted">IN ARCHIVE = theme title in archive pages loaded this session</p>
    </>
  )
}

function DossierRows({ items, onNavigate }) {
  return (
    <>
      <p className="label-mono text-pulse">Editorial catalog · open &lt;n&gt;</p>
      <ul className="border-l border-pulse/30">
        {items.map((item) => (
          <li key={item.slug}>
            <Link to={item.path} onClick={() => onNavigate(item.path)} className={ROW_LINK}>
              <span className="font-mono text-xs text-ink-muted">[{item.n}]</span>
              <span className="font-mono text-xs text-pulse">{item.code}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink group-hover:text-holo">{item.name}</span>
                <span className="font-mono text-xs text-ink-muted">
                  {item.slug} · {item.typeLabel}
                </span>
              </span>
              <ThreatBadge level={item.threatLevel} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function DossierSummary({ item, production, onNavigate }) {
  return (
    <div className="space-y-2">
      {/* Editorial layer, visibly separate from TMDB data. */}
      <div className="border border-pulse/40 bg-pulse/5 p-3">
        <p className="label-mono text-pulse">Editorial classification</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-pulse">{item.code}</span>
          <span className="font-semibold text-ink">{item.name}</span>
          <span className="text-xs text-ink-muted">{item.typeLabel}</span>
          <ThreatBadge level={item.threatLevel} />
        </p>
        <p className="mt-1.5 line-clamp-3 text-sm text-ink-muted">{item.summary}</p>
      </div>
      {production && (
        <p className="font-mono text-xs text-ink-muted">
          <span className="text-signal">TMDB</span> production · {production.title}
          {production.year ? ` (${production.year})` : ''}
        </p>
      )}
      <Link to={item.path} onClick={() => onNavigate(item.path)} className="label-mono inline-block py-1 text-holo hover:underline">
        Open dossier (open 1) →
      </Link>
    </div>
  )
}

function HelpRows({ rows }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
      {rows.map((row) => (
        <div key={row.usage} className="contents">
          <dt className="font-mono text-xs text-holo">{row.usage}</dt>
          <dd className="mb-1.5 text-xs text-ink-muted sm:mb-0">{row.description}</dd>
        </div>
      ))}
    </dl>
  )
}

function OutputBlock({ block, onNavigate }) {
  switch (block.type) {
    case 'media':
      return <MediaResults items={block.items} onNavigate={onNavigate} />
    case 'dossiers':
      return <DossierRows items={block.items} onNavigate={onNavigate} />
    case 'dossier':
      return <DossierSummary item={block.item} production={block.production} onNavigate={onNavigate} />
    case 'help':
      return <HelpRows rows={block.rows} />
    default:
      return <p className={`whitespace-pre-wrap font-mono text-xs ${TONES[block.tone] ?? TONES.default}`}>{block.text}</p>
  }
}

/** One log entry: the command line, a pending state, then its output blocks. */
export function LogEntry({ entry, onNavigate }) {
  return (
    <li className="space-y-2">
      <p className="font-mono text-xs text-ink-muted">
        <span className="text-holo">ARCHIVE://</span> {entry.command}
      </p>
      {entry.pending && <p className="label-mono text-holo motion-safe:animate-pulse">Querying archive…</p>}
      {entry.output.map((block, index) => (
        <OutputBlock key={index} block={block} onNavigate={onNavigate} />
      ))}
    </li>
  )
}

/** Top strip: real TMDB link state and the same archive totals as the status bar. */
export function TerminalStatusStrip({ titleId, onClose }) {
  const status = useTmdbStatus()
  return (
    <div className="flex items-center gap-3 border-b border-holo/25 bg-holo/5 py-2 pl-5 pr-3">
      <SquareTerminal className="size-4 shrink-0 text-holo" aria-hidden="true" />
      <h2 id={titleId} className="label-mono text-holo">
        Archive terminal
      </h2>
      <StatusDot status={status} label="TMDB" />
      <div className="ml-auto hidden items-center gap-3 sm:flex">
        <ArchiveCount mediaType="movie" unit="Films" />
        <ArchiveCount mediaType="tv" unit="Series" />
      </div>
      {onClose && (
        <button
          type="button"
          onClick={() => onClose()}
          aria-label="Close terminal"
          className="ml-auto grid size-10 place-items-center text-ink-muted hover:text-holo sm:ml-0 sm:size-8"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/**
 * Grouped suggestion listbox. `optionId(item)` gives each option's DOM id (the
 * input points at the active one with aria-activedescendant).
 */
export function SuggestionList({ listId, suggestions, active, optionId, onHover, onChoose }) {
  const open = suggestions.length > 0
  const groups = GROUP_ORDER.map((group) => ({ group, items: suggestions.filter((item) => item.group === group) })).filter(
    (entry) => entry.items.length > 0,
  )

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Suggestions"
      className={open ? 'max-h-[40%] shrink-0 overflow-y-auto border-t border-holo/25 py-1' : 'hidden'}
    >
      {groups.map(({ group, items }) => (
        <div key={group} role="group" aria-labelledby={`${listId}-${group}`}>
          <p id={`${listId}-${group}`} className="label-mono px-5 pb-1 pt-2 text-[0.625rem] text-ink-muted">
            {GROUP_LABELS[group]}
          </p>
          {items.map((item) => {
            const selected = item === suggestions[active]
            return (
              <div
                key={item.id}
                id={optionId(item)}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => onHover?.(suggestions.indexOf(item))}
                onMouseDown={(event) => event.preventDefault()} // keep focus in the input
                onClick={() => onChoose?.(item)}
                className={`mx-2 flex min-h-11 cursor-pointer items-center gap-3 border-l-2 px-3 py-1.5 sm:min-h-9 ${
                  selected ? 'border-holo bg-holo/10' : 'border-transparent'
                }`}
              >
                <span className="font-mono text-sm text-ink">{item.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{item.detail}</span>
                <span
                  className={`label-mono shrink-0 text-[0.625rem] ${
                    item.group === 'dossiers' ? 'text-pulse' : item.group === 'sections' ? 'text-signal' : 'text-holo'
                  }`}
                >
                  {item.tag}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Key hints bar (hidden on touch-size screens). Without handlers the hints are not clickable. */
export function TerminalHints({ onRun, onComplete, onClose }) {
  return (
    <div className="hidden flex-wrap items-center justify-between gap-3 border-t border-holo/25 px-5 py-2.5 sm:flex">
      <KeyHint size="sm" keyLabel="↵" label="Run" onClick={onRun} />
      <KeyHint size="sm" keyLabel="↑↓" label="Navigate" />
      <KeyHint size="sm" keyLabel="Tab" label="Complete" onClick={onComplete} />
      <KeyHint size="sm" keyLabel="Esc" label="Close" onClick={onClose} />
    </div>
  )
}
