import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'

// Two tiny scenes. Silent reading time for these lines is 1300 ms each (the minimum).
const SCENES = [
  { id: 'a', leadMs: 0, minMs: 0, lines: () => ['One two three.', 'Four.'] },
  { id: 'b', minMs: 0, final: true, lines: () => ['End.'] },
]

const advance = (ms) => act(() => vi.advanceTimersByTime(ms))
// React runs effects (which schedule the next timers) only when an act() ends,
// so long spans are advanced in small steps.
const advanceInSteps = (ms, step = 50) => {
  for (let t = 0; t < ms; t += step) advance(step)
}

describe('pickVoice', () => {
  it('prefers natural English voices, then Google, then any English voice', async () => {
    const { pickVoice } = await import('./useNarration.js')
    const voices = [
      { name: 'Microsoft David', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' },
      { name: 'Microsoft Aria Online (Natural)', lang: 'en-US' },
      { name: 'Microsoft Denise Online (Natural)', lang: 'fr-FR' },
    ]
    expect(pickVoice(voices).name).toBe('Microsoft Aria Online (Natural)')
    expect(pickVoice(voices.slice(0, 2)).name).toBe('Google US English')
    expect(pickVoice([{ name: 'Daniel', lang: 'en-GB' }, { name: 'Thomas', lang: 'fr-FR' }]).name).toBe('Daniel')
    expect(pickVoice([{ name: 'Thomas', lang: 'fr-FR' }])).toBeNull()
  })
})

describe('useNarration without speech (captions only)', () => {
  // jsdom has no speechSynthesis, so the module runs in silent mode.
  let useNarration
  beforeEach(async () => {
    vi.useFakeTimers()
    useNarration = (await import('./useNarration.js')).default
  })
  afterEach(() => vi.useRealTimers())

  const setup = (props = {}) =>
    renderHook((p) => useNarration({ scenes: SCENES, context: {}, paused: false, muted: false, voice: null, ...p }), {
      initialProps: props,
    })

  it('advances line by line on estimated reading time, then to the next scene', () => {
    const { result } = setup()
    expect(result.current.caption).toBe('One two three.')

    advance(1300)
    expect(result.current.caption).toBe('Four.')

    advance(150 + 1300) // lead + reading time of line 2 → scene holds on its last caption
    expect(result.current.sceneIndex).toBe(0)
    expect(result.current.caption).toBe('Four.')

    advance(200) // hold (minMs 0) + 150 ms gap
    expect(result.current.sceneIndex).toBe(1)
    expect(result.current.caption).toBe('End.')
  })

  it('stays on a final scene instead of moving on', () => {
    const { result } = setup()
    advanceInSteps(20_000)
    expect(result.current.sceneIndex).toBe(1)
    expect(result.current.caption).toBe('End.')
  })

  it('freezes while paused and restarts the current line on resume', () => {
    const { result, rerender } = setup()
    rerender({ paused: true })
    advance(10_000)
    expect(result.current.caption).toBe('One two three.')

    rerender({ paused: false })
    advance(1299)
    expect(result.current.caption).toBe('One two three.')
    advance(1)
    expect(result.current.caption).toBe('Four.')
  })

  it('jumps to a chapter with goTo', () => {
    const { result } = setup()
    act(() => result.current.goTo(1))
    expect(result.current.sceneIndex).toBe(1)
    expect(result.current.caption).toBe('End.')
    expect(result.current.speaking).toBe(false)
  })
})

describe('useNarration with speech', () => {
  let spoken
  let cancel
  let useNarration
  const voice = { name: 'Test Voice', lang: 'en-US' }

  beforeEach(async () => {
    vi.useFakeTimers()
    spoken = []
    cancel = vi.fn()
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(text) {
          this.text = text
        }
      },
    )
    vi.stubGlobal('speechSynthesis', {
      speak: (utterance) => spoken.push(utterance),
      cancel,
      getVoices: () => [voice],
      addEventListener: () => {},
      removeEventListener: () => {},
    })
    vi.resetModules() // re-evaluate the module's "is speech supported" check
    useNarration = (await import('./useNarration.js')).default
  })

  afterEach(() => {
    cleanup() // unmount while the speechSynthesis stub still exists
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const setup = (props = {}) =>
    renderHook((p) => useNarration({ scenes: SCENES, context: {}, paused: false, muted: false, voice, ...p }), {
      initialProps: props,
    })

  it('speaks each line and advances when the utterance ends', () => {
    const { result } = setup()
    advance(0)
    expect(spoken.map((u) => u.text)).toEqual(['One two three.'])
    expect(spoken[0].voice).toBe(voice)

    act(() => spoken[0].onstart())
    expect(result.current.speaking).toBe(true)

    act(() => spoken[0].onend())
    expect(result.current.caption).toBe('Four.')
    advance(150)
    expect(spoken.at(-1).text).toBe('Four.')
  })

  it('moves on after a safety timeout if the browser never fires end', () => {
    const { result } = setup()
    advance(0)
    advance(1300 + 2499)
    expect(result.current.caption).toBe('One two three.')
    advance(1)
    expect(result.current.caption).toBe('Four.')
  })

  it('continues silently after a speech error', () => {
    const { result } = setup()
    advance(0)
    act(() => spoken[0].onerror())
    expect(result.current.caption).toBe('Four.')
  })

  it('does not speak when muted, and cancels speech on unmount', () => {
    const { unmount } = setup({ muted: true })
    advance(0)
    expect(spoken).toHaveLength(0)
    unmount()
    expect(cancel).toHaveBeenCalled()
  })
})

describe('useNarration with recorded files', () => {
  let players
  let useNarration
  class FakeAudio {
    constructor(src) {
      this.src = src
      this.paused = false
      players.push(this)
    }
    play() {
      return Promise.resolve()
    }
    pause() {
      this.paused = true
    }
  }

  beforeEach(async () => {
    vi.useFakeTimers()
    players = []
    vi.stubGlobal('Audio', FakeAudio)
    useNarration = (await import('./useNarration.js')).default
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const setup = (props = {}) =>
    renderHook(
      (p) => useNarration({ scenes: SCENES, context: {}, paused: false, muted: false, voice: null, recorded: true, ...p }),
      { initialProps: props },
    )

  it('plays the file of each line and advances when it ends', () => {
    const { result } = setup()
    advance(0)
    expect(players.map((p) => p.src)).toEqual(['/narration/a-1.mp3'])

    act(() => players[0].onplaying())
    expect(result.current.speaking).toBe(true)

    act(() => players[0].onended())
    expect(result.current.caption).toBe('Four.')
    advance(150)
    expect(players.at(-1).src).toBe('/narration/a-2.mp3')
  })

  it('falls back to captions if a file cannot be played', () => {
    const { result } = setup()
    advance(0)
    act(() => players[0].onerror())
    advance(1299)
    expect(result.current.caption).toBe('One two three.')
    advance(1)
    expect(result.current.caption).toBe('Four.')
  })

  it('plays nothing when muted and stops the file on unmount', () => {
    const muted = setup({ muted: true })
    advance(0)
    expect(players).toHaveLength(0)
    muted.unmount()

    const { unmount } = setup()
    advance(0)
    unmount()
    expect(players[0].paused).toBe(true)
  })
})

describe('hasRecordedNarration', () => {
  afterEach(() => vi.unstubAllGlobals())
  const respond = (init) => vi.stubGlobal('fetch', vi.fn(() => init))

  it('is true only for a real audio file', async () => {
    const { hasRecordedNarration } = await import('./useNarration.js')
    respond(Promise.resolve(new Response(null, { status: 200, headers: { 'content-type': 'audio/mpeg' } })))
    expect(await hasRecordedNarration()).toBe(true)

    // A SPA host answers a missing file with index.html.
    respond(Promise.resolve(new Response(null, { status: 200, headers: { 'content-type': 'text/html' } })))
    expect(await hasRecordedNarration()).toBe(false)

    respond(Promise.reject(new TypeError('offline')))
    expect(await hasRecordedNarration()).toBe(false)
  })
})
