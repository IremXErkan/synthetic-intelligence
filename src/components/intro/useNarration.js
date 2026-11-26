import { useCallback, useEffect, useRef, useState } from 'react'
import { estimateMs } from './script.js'

const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
const END_SAFETY_MS = 2500 // Chrome sometimes never fires `end`; move on anyway

// Most natural English voice available: Edge "Natural" voices, then Chrome's
// Google voice, then any en-US / English voice.
const VOICE_PREFERENCES = [
  (v) => /natural/i.test(v.name) && /^en[-_](US|GB)/i.test(v.lang),
  (v) => /google us english/i.test(v.name),
  (v) => /^en[-_]US/i.test(v.lang),
  (v) => /^en/i.test(v.lang),
]

export function pickVoice(voices) {
  for (const matches of VOICE_PREFERENCES) {
    const voice = voices.find(matches)
    if (voice) return voice
  }
  return null
}

/** The best English voice; updates when the browser finishes loading its voice list. */
export function useVoice() {
  const [voice, setVoice] = useState(() => (SPEECH_SUPPORTED ? pickVoice(window.speechSynthesis.getVoices()) : null))

  useEffect(() => {
    if (!SPEECH_SUPPORTED) return
    const update = () => setVoice(pickVoice(window.speechSynthesis.getVoices()))
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  return voice
}

/**
 * Drives the intro: speaks each sentence and advances when it ends. Without a
 * voice (unsupported, muted or speech error) it advances after an estimated
 * reading time, so the intro always continues, silently but captioned.
 *
 * Pause cancels speech and restarts the current sentence on resume (Chrome's
 * speechSynthesis.pause() is unreliable).
 */
export default function useNarration({ scenes, context, paused, muted, voice }) {
  const [position, setPosition] = useState({ scene: 0, line: 0 })
  const [speakingKey, setSpeakingKey] = useState(null)
  const sceneStartRef = useRef(0)

  const scene = scenes[position.scene]
  const lines = scene.lines(context)
  const text = lines[position.line] ?? null // null = all lines done, holding the scene
  const key = `${position.scene}-${position.line}`

  // Remember when each scene started, for its minimum on-screen time.
  useEffect(() => {
    sceneStartRef.current = performance.now()
  }, [position.scene])

  useEffect(() => {
    if (paused) return undefined
    let finished = false
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))

    const nextLine = () => {
      if (finished) return
      finished = true
      setSpeakingKey(null)
      setPosition((p) => ({ ...p, line: p.line + 1 }))
    }

    if (text === null) {
      // Scene finished: hold until its minimum time has passed, then move on.
      if (!scene.final && position.scene < scenes.length - 1) {
        const remaining = Math.max(0, scene.minMs - (performance.now() - sceneStartRef.current))
        later(() => setPosition({ scene: position.scene + 1, line: 0 }), remaining + 300)
      }
    } else {
      const lead = position.line === 0 ? (scene.leadMs ?? 400) : 150
      const useVoice = SPEECH_SUPPORTED && voice && !muted

      later(() => {
        if (!useVoice) {
          later(nextLine, estimateMs(text))
          return
        }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = voice
        utterance.lang = voice.lang
        utterance.rate = 1
        utterance.onstart = () => setSpeakingKey(key)
        utterance.onend = nextLine
        utterance.onerror = nextLine // e.g. "not-allowed": continue silently
        window.speechSynthesis.speak(utterance)
        later(nextLine, estimateMs(text) + END_SAFETY_MS)
      }, lead)
    }

    return () => {
      finished = true
      timers.forEach(clearTimeout)
      if (SPEECH_SUPPORTED) window.speechSynthesis.cancel()
    }
  }, [text, key, paused, muted, voice, scene, scenes.length, position.scene, position.line])

  const goTo = useCallback((sceneIndex) => setPosition({ scene: sceneIndex, line: 0 }), [])

  return {
    sceneIndex: position.scene,
    lineIndex: position.line,
    caption: text ?? lines[lines.length - 1] ?? '',
    speaking: speakingKey === key && !paused && !muted,
    goTo,
  }
}
