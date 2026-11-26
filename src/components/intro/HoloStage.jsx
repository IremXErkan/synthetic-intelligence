import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { discoverTheme } from '../../services/tmdb.js'
import { fetchCatalogProductions } from '../../services/catalog.js'
import useFetch from '../../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import TintedImage from '../common/TintedImage.jsx'
import { ChapterRail, KeyHint, VoiceWave } from './IntroControls.jsx'
import { SCENES } from './script.js'
import useNarration, { useVoice } from './useNarration.js'
import useHoloTilt from './useHoloTilt.js'
import BootScene from './scenes/BootScene.jsx'
import HookScene from './scenes/HookScene.jsx'
import CloseScene from './scenes/CloseScene.jsx'

// Scenes that exist in the site right now; others in the script are skipped.
const SCENE_COMPONENTS = { boot: BootScene, hook: HookScene, close: CloseScene }
const AVAILABLE_SCENES = SCENES.filter((scene) => scene.id in SCENE_COMPONENTS)

// Same default theme query as the list pages and status bar (shared cache).
async function fetchArchiveCounts(signal) {
  const [movies, series] = await Promise.all([discoverTheme('movie', {}, { signal }), discoverTheme('tv', {}, { signal })])
  return { movies: movies.total_results, series: series.total_results }
}

const FOCUSABLE = 'button, a[href], [tabindex]:not([tabindex="-1"])'

/** Background "parallax" panels: blurred, tinted TMDB stills behind the main screen. */
function BackPanel({ media, className, depthX, z }) {
  return (
    <motion.div
      aria-hidden="true"
      // All transforms go through Framer Motion (an inline transform would override a CSS class one).
      style={{ x: depthX, z, rotateY: -14 }}
      className={`chamfer pointer-events-none absolute hidden overflow-hidden border border-signal/20 opacity-35 blur-[3px] [--cut:14px] md:block ${className}`}
    >
      {media && <TintedImage src={imageUrl(media.backdrop_path, IMAGE_SIZES.backdropSmall)} alt="" aspect="aspect-video" />}
    </motion.div>
  )
}

function HoloStage({ onClose }) {
  const reduceMotion = useReducedMotion()
  const tilt = useHoloTilt()
  const voice = useVoice()
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const rootRef = useRef(null)

  const productions = useFetch(fetchCatalogProductions)
  const counts = useFetch(fetchArchiveCounts)
  const context = useMemo(() => ({ counts: counts.data }), [counts.data])

  const narration = useNarration({ scenes: AVAILABLE_SCENES, context, paused, muted, voice })
  const scene = AVAILABLE_SCENES[narration.sceneIndex]
  const Scene = SCENE_COMPONENTS[scene.id]

  // Preload every catalog still once the records arrive, so scenes never wait on images.
  const media = useMemo(
    () => Object.values(productions.data ?? {}).map((entry) => entry.media).filter(Boolean),
    [productions.data],
  )
  useEffect(() => {
    media.forEach((item) => {
      const src = imageUrl(item.backdrop_path, IMAGE_SIZES.backdrop)
      if (src) new Image().src = src
    })
  }, [media])

  // Keyboard (Esc is handled by IntroOverlay): Space pauses, M mutes; Tab stays
  // inside the dialog. Space is always pause/resume here (as the on-screen hint
  // says), even on a focused button — otherwise it could trigger ENTER ARCHIVE by
  // accident. Buttons remain usable with Enter.
  useEffect(() => {
    rootRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === ' ') {
        event.preventDefault()
        setPaused((p) => !p)
      } else if (event.key.toLowerCase() === 'm' && !event.ctrlKey && !event.metaKey) {
        setMuted((m) => !m)
      } else if (event.key === 'Tab' && rootRef.current) {
        const items = [...rootRef.current.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[inert]'))
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
  }, [])

  const panelIntro = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
    : {
        initial: { scaleY: 0.004, opacity: 0 },
        animate: { scaleY: 1, opacity: [0, 1, 0.4, 1, 0.7, 1] },
        transition: { scaleY: { delay: 0.3, duration: 0.45, ease: 'easeOut' }, opacity: { delay: 0.3, duration: 0.8 } },
      }

  return (
    <div ref={rootRef} tabIndex={-1} className="relative h-full overflow-hidden outline-none">
      {/* Ambient background */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(34_211_238/0.12),transparent_60%)]" />

      {/* 3D stage */}
      <div className="absolute inset-0 flex items-center justify-center px-3 pb-36 pt-6 md:px-8 md:pb-32 [perspective:1400px] [perspective-origin:50%_40%]">
        <BackPanel media={media[1]} depthX={tilt.depthX} z={-220} className="left-[4%] top-[10%] w-[26vw]" />
        <BackPanel media={media[5]} depthX={tilt.depthX} z={-260} className="bottom-[22%] right-[3%] w-[24vw]" />

        {/* Light line that the screen materializes from */}
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute h-0.5 w-[min(1100px,94vw)] bg-signal shadow-[0_0_24px_rgb(34_211_238)]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 0.75, times: [0, 0.4, 1] }}
          />
        )}

        <motion.div
          className="relative w-full max-w-[1100px] [transform-style:preserve-3d] drop-shadow-[0_0_24px_rgb(34_211_238/0.35)]"
          style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
          {...panelIntro}
        >
          {/* Glass panel: translucent dark-teal glass + a hollow cyan outline on top
              (a filled frame layer would show through the translucent glass). */}
          <div className="relative">
            <div aria-hidden="true" className="chamfer-ring pointer-events-none absolute inset-0 z-10 bg-signal/80 [--cut:22px]" />
            <div className="chamfer relative grid h-[min(620px,64vh)] grid-rows-[auto_1fr] bg-[rgb(4_24_31/0.62)] backdrop-blur-md [--cut:22px] md:grid-cols-[200px_1fr] md:grid-rows-[auto_1fr]">
              {/* Scan lines over the glass (behind the text panels, very faint) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(34_211_238/0.04)_0_1px,transparent_1px_4px)]" />

              <header className="relative col-span-full flex items-center justify-between border-b border-signal/25 px-5 py-3">
                <p className="label-mono text-signal">
                  Archive boot sequence <span aria-hidden="true">//</span> {String(narration.sceneIndex + 1).padStart(2, '0')}/
                  {String(AVAILABLE_SCENES.length).padStart(2, '0')}
                </p>
                <div className="flex items-center gap-3">
                  <span className="label-mono hidden text-[0.6875rem] text-ink-muted sm:inline">
                    {muted || !voice ? 'Narration: captions only' : 'Narration: audio'}
                  </span>
                  <VoiceWave active={narration.speaking} />
                </div>
              </header>

              <aside className="relative hidden border-r border-signal/20 p-4 md:block">
                <ChapterRail scenes={AVAILABLE_SCENES} activeIndex={narration.sceneIndex} onSelect={narration.goTo} />
              </aside>

              <section className="relative min-h-0 overflow-hidden p-4 md:p-6" aria-label={scene.chapter}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scene.id}
                    className="h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Scene lineIndex={narration.lineIndex} media={media} counts={counts.data} onEnter={onClose} reduceMotion={reduceMotion} />
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Flat (non-3D) layer: captions + controls stay perfectly readable */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-4 pb-5">
        <p aria-live="polite" className="max-w-3xl bg-void/75 px-4 py-2 text-center text-base leading-relaxed text-ink sm:text-lg">
          {narration.caption}
        </p>
        <div className="flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-4">
          <p className="label-mono text-[0.6875rem] text-ink-muted">{paused ? 'Paused' : 'Live archive data · TMDB'}</p>
          <div className="flex flex-wrap items-center gap-5">
            <KeyHint keyLabel="Esc" label="Skip" onClick={onClose} />
            <KeyHint keyLabel="Space" label={paused ? 'Resume' : 'Pause'} onClick={() => setPaused((p) => !p)} pressed={paused} />
            <KeyHint keyLabel="M" label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)} pressed={muted} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HoloStage
