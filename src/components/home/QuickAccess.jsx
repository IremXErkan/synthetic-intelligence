import { Link } from 'react-router'
import { ArrowRight, Clapperboard, Database, FlaskConical, Network, Tv, Users } from 'lucide-react'
import { discoverTheme } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { ENTITIES } from '../../data/entities.js'
import HudPanel from '../common/HudPanel.jsx'

// Same default query as the list pages and status bar → shared cache entry.
const fetchMovies = (signal) => discoverTheme('movie', {}, { signal })
const fetchSeries = (signal) => discoverTheme('tv', {}, { signal })

function LiveCount({ fetcher, unit }) {
  const { data, error, loading } = useFetch(fetcher)
  if (loading) return <span className="text-ink-muted">Counting…</span>
  if (error) return <span className="text-ink-muted">Count unavailable</span>
  return (
    <span>
      <span className="text-ink">{data.total_results.toLocaleString('en-US')}</span> {unit}
    </span>
  )
}

const SECTIONS = [
  {
    to: '/movies',
    code: 'SEC-01',
    title: 'Movies',
    icon: Clapperboard,
    text: 'Films about artificial minds and machines.',
    meta: <LiveCount fetcher={fetchMovies} unit="films" />,
  },
  {
    to: '/series',
    code: 'SEC-02',
    title: 'Series',
    icon: Tv,
    text: 'Television series about synthetic intelligence.',
    meta: <LiveCount fetcher={fetchSeries} unit="series" />,
  },
  {
    to: '/cast',
    code: 'SEC-03',
    title: 'Cast',
    icon: Users,
    text: 'The actors and voices behind the machines.',
    meta: 'Compiled from archive credits',
  },
  {
    to: '/entities',
    code: 'SEC-04',
    title: 'Entities',
    icon: Database,
    text: 'Classified dossiers on notable synthetic minds.',
    meta: (
      <span>
        <span className="text-ink">{ENTITIES.length}</span> dossiers
      </span>
    ),
  },
  {
    to: '/lab',
    code: 'SEC-05',
    title: 'Lab',
    icon: FlaskConical,
    text: 'Compare two entities side by side.',
    meta: 'Editorial scores · radar view',
  },
  {
    to: '/network',
    code: 'SEC-06',
    title: 'Network',
    icon: Network,
    text: 'How dossiers and productions connect.',
    meta: 'TMDB links · editorial relations',
  },
]

function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <h2 id="quick-access-title" className="label-mono mb-4 text-signal">
        Archive sectors
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ to, code, title, icon: Icon, text, meta }) => (
          <li key={to}>
            <Link to={to} className="group block h-full">
              <HudPanel variant="neutral" glow cut={12} className="h-full" bodyClassName="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-signal" aria-hidden="true" />
                  <span className="label-mono text-[0.6875rem] text-ink-muted">{code}</span>
                </div>
                <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold text-ink group-hover:text-signal">
                  {title}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{text}</p>
                <p className="mt-auto pt-4 font-mono text-xs text-ink-muted">{meta}</p>
              </HudPanel>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default QuickAccess
