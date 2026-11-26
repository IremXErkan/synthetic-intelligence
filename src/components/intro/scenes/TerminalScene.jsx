import { useEffect, useId, useState } from 'react'
import HudPanel from '../../common/HudPanel.jsx'
import { getSuggestions, runCommand } from '../../terminal/commands.js'
import { LogEntry, SuggestionList, TerminalHints, TerminalStatusStrip } from '../../terminal/TerminalParts.jsx'

const PARTIAL = 'dossier ha' // typed by hand
const COMMAND = 'dossier hal-9000' // after Tab completion
const TICK_MS = 90
const TYPE_FROM_TICK = 6 // ~0.5 s before typing starts
const COMPLETE_TICK = 28 // ~2.5 s: Tab completes the slug
const RUN_TICK = 39 // ~3.5 s: Enter runs it

/**
 * Scene 9 — the real Archive Terminal parts, non-interactive: a command is typed,
 * completed with Tab from the live suggestion list, then run for real (the
 * dossier is editorial, the production title comes live from TMDB).
 * With reduced motion it starts at the finished state.
 */
function TerminalScene({ reduceMotion }) {
  const listId = useId()
  const [tick, setTick] = useState(reduceMotion ? RUN_TICK : 0)
  const [output, setOutput] = useState(null)
  const running = tick >= RUN_TICK

  useEffect(() => {
    if (running) return undefined
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running) return undefined
    const controller = new AbortController()
    runCommand(COMMAND, { signal: controller.signal }).then(
      (result) => setOutput(result.output),
      (error) => {
        if (error?.name !== 'AbortError') {
          setOutput([{ type: 'line', tone: 'error', text: `ERROR ${error?.message ?? 'request failed'}` }])
        }
      },
    )
    return () => controller.abort()
  }, [running])

  let input = ''
  if (!running) input = tick >= COMPLETE_TICK ? COMMAND : PARTIAL.slice(0, Math.max(0, tick - TYPE_FROM_TICK))
  const suggestions = input ? getSuggestions(input) : []

  return (
    <div className="mx-auto h-full max-w-2xl" inert aria-hidden="true">
      <HudPanel variant="holo" cut={18} fill className="h-full" surface="bg-panel/80" bodyClassName="flex flex-col">
        <TerminalStatusStrip titleId={`${listId}-title`} />

        {/* Bottom-aligned like a real terminal: if space is short, the oldest lines go first. */}
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-5 py-4">
          {running ? (
            <ol className="space-y-4">
              <LogEntry entry={{ command: COMMAND, pending: output === null, output: output ?? [] }} onNavigate={() => {}} />
            </ol>
          ) : (
            <p className="font-mono text-xs text-ink-muted">ARCHIVE:// ready — Enter runs, Tab completes.</p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-holo/25 bg-void/40 px-5 py-3 font-mono text-sm">
          <span className="text-holo">ARCHIVE://</span>
          <span className="text-ink">{input}</span>
          <span className="-ml-1.5 h-4 w-2 bg-holo motion-safe:animate-pulse" />
        </div>

        <SuggestionList listId={listId} suggestions={suggestions} active={0} optionId={(item) => `${listId}-${item.id}`} />
        <TerminalHints />
      </HudPanel>
    </div>
  )
}

export default TerminalScene
