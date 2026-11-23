import { useCallback } from 'react'
import { discoverMovies } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'

// TEMPORARY (day 1): live check of the service layer, hook and image helper.
// Removed when the real Command Center is built on day 2.
function ApiCheck() {
  const fetcher = useCallback(
    (signal) => discoverMovies({ sort_by: 'popularity.desc', page: 1 }, { signal }),
    [],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) return <p className="font-mono text-sm text-slate-400">Loading from TMDB…</p>

  if (error) {
    return (
      <div className="rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        <p>{error.message}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-3 rounded border border-red-400 px-3 py-1 hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data?.results?.length) return <p className="text-slate-400">No results.</p>

  return (
    <div>
      <p className="font-mono text-xs text-slate-500">
        /discover/movie → total_results: {data.total_results.toLocaleString('en-US')}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {data.results.slice(0, 5).map((movie) => {
          const poster = imageUrl(movie.poster_path, IMAGE_SIZES.posterCard)
          return (
            <li key={movie.id} className="text-left">
              {poster ? (
                <img src={poster} alt={`${movie.title} poster`} className="aspect-[2/3] w-full rounded object-cover" />
              ) : (
                <div className="aspect-[2/3] w-full rounded bg-slate-800" aria-hidden="true" />
              )}
              <p className="mt-2 text-sm font-medium text-slate-200">{movie.title}</p>
              <p className="font-mono text-xs text-slate-500">
                {movie.release_date?.slice(0, 4) || '—'} · ★ {movie.vote_average.toFixed(1)}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Placeholder: becomes the Command Center on day 2.
function HomePage() {
  return (
    <section className="mx-auto max-w-4xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-400">
        Fictional AI &amp; Robotics Archive
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-cyan-300 sm:text-6xl">
        Synthetic Intelligence
      </h1>
      <p className="mt-6 text-slate-400">Tailwind CSS and React Router are running.</p>
      <div className="mt-12">
        <ApiCheck />
      </div>
    </section>
  )
}

export default HomePage
