import { discoverTheme } from '../../../services/tmdb.js'
import useFetch from '../../../hooks/useFetch.js'
import MediaCard from '../../media/MediaCard.jsx'
import ScaledPreview from './ScaledPreview.jsx'
import useCountUp from './useCountUp.js'

// Page 1 of the default theme query: the same request (and cache entry) as /movies.
const fetchArchivePage = (signal) => discoverTheme('movie', {}, { signal })

function Counter({ value, label, reduceMotion }) {
  const shown = useCountUp(value, 1400, reduceMotion)
  return (
    <div>
      <p className="font-mono text-4xl font-semibold text-holo [text-shadow:0_0_14px_rgb(94_234_212/0.5)] sm:text-5xl">
        {shown == null ? '—' : shown.toLocaleString('en-US')}
      </p>
      <p className="label-mono mt-1 text-ink">{label}</p>
    </div>
  )
}

/** Scene 3 — live archive size counting up, and the real /movies poster grid. */
function ArchiveScene({ lineIndex, counts, reduceMotion }) {
  const page = useFetch(fetchArchivePage)
  const showCounts = lineIndex >= 1

  return (
    <div className="grid h-full content-center gap-5 md:grid-cols-[220px_1fr] md:items-center">
      <div className="flex gap-8 md:flex-col">
        <Counter value={showCounts ? counts?.movies : null} label="Films" reduceMotion={reduceMotion} />
        <Counter value={showCounts ? counts?.series : null} label="Series" reduceMotion={reduceMotion} />
      </div>
      {page.data && (
        <ScaledPreview scale={0.42} className="h-56 sm:h-72">
          <ul className="grid grid-cols-5 gap-4">
            {page.data.results.slice(0, 10).map((item) => (
              <li key={item.id}>
                <MediaCard item={item} mediaType="movie" />
              </li>
            ))}
          </ul>
        </ScaledPreview>
      )}
    </div>
  )
}

export default ArchiveScene
