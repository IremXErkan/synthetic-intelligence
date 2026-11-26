import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { SquareTerminal } from 'lucide-react'
import HudPanel from '../common/HudPanel.jsx'
import HudRings from '../common/HudRings.jsx'
import { getSuggestions, runCommand } from './commands.js'
import { LogEntry, SuggestionList, TerminalHints, TerminalStatusStrip } from './TerminalParts.jsx'

// Log, command history and the last openable list live for the browser session:
// closing and reopening the panel keeps them (a reload clears them).
const session = { log: [], history: [], lastList: [] }
let nextEntryId = 1

// Quick buttons only fill the input; nothing runs until Enter.
const QUICK_COMMANDS = [
  { label: 'Search', value: 'search movie ' },
  { label: 'Dossiers', value: 'dossiers' },
  { label: 'Compare', value: 'compare ' },
  { label: 'Stats', value: 'stats' },
  { label: 'Goto', value: 'goto ' },
]

const FOCUSABLE = 'button, a[href], input, [tabindex]:not([tabindex="-1"])'

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
          <TerminalStatusStrip titleId={titleId} onClose={onClose} />

          {/* Log (or the start screen while nothing has been run). */}
          <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {log.length === 0 && input === '' && <QuickStart onPick={pick} />}
            {log.length === 0 && input !== '' && (
              <p className="font-mono text-xs text-ink-muted">ARCHIVE:// ready — Enter runs, Tab completes.</p>
            )}
            <ol aria-live="polite" aria-label="Terminal output" className="space-y-4">
              {log.map((entry) => (
                <LogEntry key={entry.id} entry={entry} onNavigate={closeAfterNavigation} />
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
          <SuggestionList
            listId={listId}
            suggestions={suggestions}
            active={active}
            optionId={optionId}
            onHover={setHighlight}
            onChoose={(item) => (item.runnable ? run(item.value) : pick(item.value))}
          />

          <TerminalHints onRun={submit} onComplete={complete} onClose={() => onClose()} />
        </HudPanel>
      </motion.div>
    </div>
  )
}

export default ArchiveTerminal
