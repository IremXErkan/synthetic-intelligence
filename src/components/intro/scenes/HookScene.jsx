import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { imageUrl, IMAGE_SIZES } from '../../../utils/imageUrl.js'
import { getTitle } from '../../../utils/media.js'
import HudRings from '../../common/HudRings.jsx'
import TintedImage from '../../common/TintedImage.jsx'

const HEADLINES = ['Made to help us', 'To serve · To protect', 'Some wanted more']

/**
 * Scene 2 — Hook. Live TMDB stills of the archive's productions cycle inside the
 * HUD rings while the headline follows the narration.
 */
function HookScene({ lineIndex, media, reduceMotion }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (media.length < 2) return undefined
    const id = setInterval(() => setFrame((f) => f + 1), reduceMotion ? 2400 : 1100)
    return () => clearInterval(id)
  }, [media.length, reduceMotion])

  const current = media.length ? media[frame % media.length] : null
  const headline = HEADLINES[Math.min(lineIndex, HEADLINES.length - 1)]

  return (
    <div className="grid h-full content-center items-center gap-4 md:gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-44 md:max-w-72">
        <HudRings className="absolute inset-0 size-full" />
        <div className="absolute inset-[18%] overflow-hidden rounded-full border border-signal/40">
          <AnimatePresence mode="popLayout">
            {current && (
              <motion.div
                key={current.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TintedImage
                  src={imageUrl(current.backdrop_path, IMAGE_SIZES.backdropSmall)}
                  alt={`Still from ${getTitle(current)}`}
                  aspect="aspect-square"
                  className="size-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <p className="label-mono text-holo">Subject class: synthetic intelligence</p>
        <AnimatePresence mode="wait">
          <motion.h2
            key={headline}
            className={`mt-3 text-3xl font-bold uppercase tracking-[0.12em] sm:text-4xl ${lineIndex >= 2 ? 'text-threat-high' : 'text-ink'}`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {headline}
          </motion.h2>
        </AnimatePresence>
        {current && <p className="label-mono mt-4 text-[0.6875rem] text-ink">Frame: {getTitle(current)} · TMDB</p>}
      </div>
    </div>
  )
}

export default HookScene
