import useTmdbStatus from '../../../hooks/useTmdbStatus.js'
import { ENTITIES } from '../../../data/entities.js'
import StatusDot from '../../common/StatusDot.jsx'
import Typewriter from './Typewriter.jsx'

/**
 * Scene 1 — Boot. A console that types out real checks: the dossier catalog
 * size and the live TMDB link status (the same status as the site's status bar).
 */
function BootScene({ lineIndex, reduceMotion }) {
  const status = useTmdbStatus()

  return (
    <div className="flex h-full flex-col justify-center gap-6 font-mono">
      <p className="text-2xl font-semibold tracking-[0.25em] text-ink sm:text-3xl">
        <Typewriter text="SYNTHETIC INTELLIGENCE" reduceMotion={reduceMotion} />
      </p>

      <ul className="space-y-3 text-sm sm:text-base">
        <li className="text-ink">
          <Typewriter text="> initializing archive ..." reduceMotion={reduceMotion} />
        </li>
        <li className="text-ink">
          <Typewriter text={`> loading dossier catalog ... ${ENTITIES.length} records`} reduceMotion={reduceMotion} />
        </li>
        {lineIndex >= 1 && (
          <li className="flex flex-wrap items-center gap-3 text-ink">
            <Typewriter text="> connecting to api.themoviedb.org ..." reduceMotion={reduceMotion} />
            <StatusDot status={status} />
          </li>
        )}
      </ul>
    </div>
  )
}

export default BootScene
