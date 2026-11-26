import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { SquareTerminal, X } from 'lucide-react'
import HudPanel from '../common/HudPanel.jsx'
import HudRings from '../common/HudRings.jsx'
import KeyHint from '../common/KeyHint.jsx'
import StatusDot from '../common/StatusDot.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { Badge, ThreatBadge } from '../common/Badge.jsx'
import { ArchiveCount } from '../layout/StatusBar.jsx'
import useTmdbStatus from '../../hooks/useTmdbStatus.js'
import { IMAGE_SIZES, imageUrl } from '../../utils/imageUrl.js'
import { getSuggestions, runCommand } from './commands.js'

// Log, command history and the last openable list live for the browser session:
// closing and reopening the panel keeps them (a reload clears them).
const session = { log: [], history: [], lastList: [] }
let nextEntryId = 1

const GROUP_LABELS = { commands: 'Commands', dossiers: 'Dossiers', sections: 'Sections' }
const GROUP_ORDER = ['commands', 'dossiers', 'sections']

// Quick buttons only fill the input; nothing runs until Enter.
const QUICK_COMMANDS = [
  { label: 'Search', value: 'search movie ' },
  { label: 'Dossiers', value: 'dossiers' },
  { label: 'Compare', value: 'compare ' },
  { label: 'Stats', value: 'stats' },
  { label: 'Goto', value: 'goto ' },
]

const FOCUSABLE = 'button, a[href], input, [tabindex]:not([tabindex="-1"])'

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

function QuickStart({ onPick }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 py-4 text-center sm:gap-5 sm:py-6">
      <div className="relative grid size-20 place-items-center sm:size-28">
        <HudRings color="text-holo" className="absolute inset-0 size-full" />
        <SquareTerminal className="size-7 text-holo" aria-hidden="true" />
      </div>
      <div>
        <p className="label-mono text-holo">Archive terminal ready</p>
        <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.14em] text-ink sm:text-xl">What do you want to access?</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Type a command or pick one below. <span className="font-mono text-holo">help</span> lists everything.
        </p>
      </div>
      <ul className="grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-5">
        {QUICK_COMMANDS.map((quick) => (
          <li key={quick.label} className="last:col-span-2 sm:last:col-span-1">
            <button
              type="button"
              onClick={() => onPick(quick.value)}
              className="label-mono chamfer min-h-12 w-full bg-holo/10 px-3 text-holo transition-colors [--cut:8px] hover:bg-holo/20 sm:min-h-10"
            >
              {quick.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Archive Terminal: command palette (Ctrl+K). A fixed command set with a live,
 * grouped suggestion list; output accumulates in a log above the input.
 * Keys: Enter run · ↑/↓ list (or history) · Tab complete · Esc close.
 */
function ArchiveTerminal({ onClose }) {
  const navigate = useNavigate()
  const titleId = useId()
  const listId = useId()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const logRef = useRef(null)
  const controllerRef = useRef(null)
  const status = useTmdbStatus()

  const [log, setLog] = useState(session.log)
  const [input, setInput] = useState('')
  const [highlight, setHighlight] = useState(0)
  // Index into the command history while browsing it with ↑/↓, otherwise null.
  // In history mode the suggestion list stays closed so ↑/↓ keep walking history.
  const [historyIndex, setHistoryIndex] = useState(null)

  const historyMode = historyIndex !== null
  const suggestions = useMemo(() => (historyMode ? [] : getSuggestions(input)), [input, historyMode])
  const listOpen = suggestions.length > 0
  const active = Math.min(highlight, suggestions.length - 1)
  const optionId = (item) => `${listId}-${item.id}`

  // session.log is the source of truth (it must survive an unmount right after a
  // navigation command); the state mirrors it for rendering.
  const commitLog = (next) => {
    session.log = next
    setLog(next)
  }
  const updateEntry = (id, changes) => commitLog(session.log.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)))

  const editInput = (value) => {
    setInput(value)
    setHistoryIndex(null)
    setHighlight(0)
  }

  // Abort pending requests when the panel closes; focus the input on open.
  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    inputRef.current?.focus()
    return () => controller.abort()
  }, [])

  // Lock page scroll behind the dialog.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  // Esc closes from anywhere; Tab stays inside the dialog.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'Tab' && !event.defaultPrevented && rootRef.current) {
        const items = [...rootRef.current.querySelectorAll(FOCUSABLE)]
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Keep the newest output in view.
  useEffect(() => {
    if (log.length > 0 && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Keep the highlighted suggestion in view.
  useEffect(() => {
    if (!listOpen) return
    document.getElementById(optionId(suggestions[active]))?.scrollIntoView({ block: 'nearest' })
  })

  const closeAfterNavigation = (path) => onClose({ navigatedTo: path })

  const run = async (text) => {
    const command = text.trim()
    if (!command) return
    if (session.history.at(-1) !== command) session.history.push(command)
    editInput('')

    const id = nextEntryId++
    commitLog([...session.log, { id, command, pending: true, output: [] }])
    try {
      const result = await runCommand(command, { lastList: session.lastList, signal: controllerRef.current?.signal })
      if (result.list) session.lastList = result.list
      if (result.clear) return commitLog([])
      if (result.close) {
        commitLog(session.log.filter((entry) => entry.id !== id))
        return onClose()
      }
      updateEntry(id, { pending: false, output: result.output })
      if (result.navigateTo) {
        navigate(result.navigateTo)
        closeAfterNavigation(result.navigateTo)
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      updateEntry(id, { pending: false, output: [{ type: 'line', tone: 'error', text: `ERROR ${error?.message ?? 'request failed'}` }] })
    }
  }

  const complete = () => {
    if (listOpen) editInput(suggestions[active].value)
    inputRef.current?.focus()
  }

  const submit = () => {
    if (listOpen) {
      const item = suggestions[active]
      if (item.runnable) run(item.value)
      else editInput(item.value)
    } else {
      run(input)
    }
    inputRef.current?.focus()
  }

  const browseHistory = (step) => {
    const history = session.history
    if (history.length === 0) return
    if (step < 0) {
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(history[next])
    } else if (historyIndex !== null) {
      const next = historyIndex + 1
      if (next >= history.length) {
        editInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
  }

  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : -1
      if (listOpen) {
        event.preventDefault()
        setHighlight((active + step + suggestions.length) % suggestions.length)
      } else if (input === '' || historyMode) {
        event.preventDefault()
        browseHistory(step)
      }
    } else if (event.key === 'Tab' && !event.shiftKey && (listOpen || historyMode)) {
      event.preventDefault()
      if (historyMode) setHistoryIndex(null) // leave history: the list opens for this text
      else complete()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  const pick = (value) => {
    editInput(value)
    inputRef.current?.focus()
  }

  const groups = GROUP_ORDER.map((group) => ({ group, items: suggestions.filter((item) => item.group === group) })).filter(
    (entry) => entry.items.length > 0,
  )

  return (
    <div className="fixed inset-0 z-[90] flex justify-center sm:items-start sm:px-4 sm:pt-[9vh]">
      <div className="absolute inset-0 bg-void/70 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose()} />

      <motion.div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative h-full w-full sm:h-[min(640px,82vh)] sm:max-w-2xl"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <HudPanel
          variant="holo"
          cut={18}
          fill
          className="h-full"
          surface="bg-panel/80 backdrop-blur-md"
          bodyClassName="flex flex-col"
        >
          {/* Status strip: real link state and the same archive totals as the status bar. */}
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
            <button
              type="button"
              onClick={() => onClose()}
              aria-label="Close terminal"
              className="ml-auto grid size-10 place-items-center text-ink-muted hover:text-holo sm:ml-0 sm:size-8"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Log (or the start screen while nothing has been run). */}
          <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {log.length === 0 && input === '' && <QuickStart onPick={pick} />}
            {log.length === 0 && input !== '' && (
              <p className="font-mono text-xs text-ink-muted">ARCHIVE:// ready — Enter runs, Tab completes.</p>
            )}
            <ol aria-live="polite" aria-label="Terminal output" className="space-y-4">
              {log.map((entry) => (
                <li key={entry.id} className="space-y-2">
                  <p className="font-mono text-xs text-ink-muted">
                    <span className="text-holo">ARCHIVE://</span> {entry.command}
                  </p>
                  {entry.pending && <p className="label-mono text-holo motion-safe:animate-pulse">Querying archive…</p>}
                  {entry.output.map((block, index) => (
                    <OutputBlock key={index} block={block} onNavigate={closeAfterNavigation} />
                  ))}
                </li>
              ))}
            </ol>
          </div>

          {/* Input line */}
          <div className="flex items-center gap-2 border-t border-holo/25 bg-void/40 px-5 py-3">
            <span aria-hidden="true" className="font-mono text-sm text-holo">
              ARCHIVE://
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => editInput(event.target.value)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-label="Archive command"
              aria-expanded={listOpen}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={listOpen ? optionId(suggestions[active]) : undefined}
              placeholder="type a command — help lists all"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink caret-holo placeholder:text-ink-muted/70 focus:outline-none"
            />
          </div>

          {/* Live suggestions, grouped. */}
          <div
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className={listOpen ? 'max-h-[40%] shrink-0 overflow-y-auto border-t border-holo/25 py-1' : 'hidden'}
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
                      onMouseEnter={() => setHighlight(suggestions.indexOf(item))}
                      onMouseDown={(event) => event.preventDefault()} // keep focus in the input
                      onClick={() => (item.runnable ? run(item.value) : pick(item.value))}
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

          {/* Key hints (keyboard users; hidden on touch-size screens). */}
          <div className="hidden flex-wrap items-center justify-between gap-3 border-t border-holo/25 px-5 py-2.5 sm:flex">
            <KeyHint size="sm" keyLabel="↵" label="Run" onClick={submit} />
            <KeyHint size="sm" keyLabel="↑↓" label="Navigate" />
            <KeyHint size="sm" keyLabel="Tab" label="Complete" onClick={complete} />
            <KeyHint size="sm" keyLabel="Esc" label="Close" onClick={() => onClose()} />
          </div>
        </HudPanel>
      </motion.div>
    </div>
  )
}

export default ArchiveTerminal
