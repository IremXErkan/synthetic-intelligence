import { useEffect, useState } from 'react'
import BootScreen from './BootScreen.jsx'
import HoloStage from './HoloStage.jsx'

/**
 * Full-screen intro dialog: boot screen → holographic narrated tour.
 * Loaded lazily from App only when it is shown.
 */
function IntroOverlay({ onClose }) {
  const [started, setStarted] = useState(false)

  // Lock page scroll and always stop speech when the intro goes away.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
      window.speechSynthesis?.cancel()
    }
  }, [])

  // Esc skips at any moment, on the boot screen as well as during the tour.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label="Archive boot sequence" className="fixed inset-0 z-[100] bg-void text-ink">
      {started ? <HoloStage onClose={onClose} /> : <BootScreen onStart={() => setStarted(true)} onSkip={onClose} />}
    </div>
  )
}

export default IntroOverlay
