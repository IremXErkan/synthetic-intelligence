import { Link } from 'react-router'
import { discoverTheme } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { MIN_VOTE_COUNT, THEME_GROUPS, THEME_GROUP_KEYS } from '../config/themeKeywords.js'
import { ENTITIES, SCORE_CRITERIA, THREAT_LEVELS } from '../data/entities.js'
import PageShell from '../components/layout/PageShell.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'

// Live archive counts with and without the vote threshold. The first two are
// the exact queries used by the list pages and status bar (shared cache).
async function fetchArchiveCounts(signal) {
  const [movies, series, moviesAll, seriesAll] = await Promise.all([
    discoverTheme('movie', {}, { signal }),
    discoverTheme('tv', {}, { signal }),
    discoverTheme('movie', { includeLowVotes: true }, { signal }),
    discoverTheme('tv', { includeLowVotes: true }, { signal }),
  ])
  return {
    movies: movies.total_results,
    series: series.total_results,
    moviesAll: moviesAll.total_results,
    seriesAll: seriesAll.total_results,
  }
}

function LiveNumber({ value, loading, error }) {
  if (loading) return <span className="text-ink-muted">…</span>
  if (error) return <span className="text-ink-muted">unavailable</span>
  return <span className="font-mono text-signal">{value.toLocaleString('en-US')}</span>
}

function AboutPage() {
  useDocumentTitle('About & Methodology')
  const counts = useFetch(fetchArchiveCounts)
  const live = (key) => <LiveNumber value={counts.data?.[key]} loading={counts.loading} error={counts.error} />

  return (
    <PageShell
      code="SEC-07"
      eyebrow="Archive Protocol"
      title="About & Methodology"
      description="What this archive is, where its data comes from, and how the editorial analysis is made."
    >
      <div className="space-y-10">
        <section className="max-w-3xl space-y-4 leading-relaxed text-ink">
          <p>
            <strong>Synthetic Intelligence</strong> is an interactive archive of fictional artificial intelligences,
            androids and robots in film and television. It treats the screen&apos;s thinking machines as if they were
            files in a research institute&apos;s classified database: you can browse the productions they appear in,
            the people who play and voice them, and a small set of dossiers that analyse the most notable ones.
          </p>
          <p className="text-ink-muted">
            Built for SE 3355 Web Programming (midterm project) with React, React Router and Tailwind CSS. Charts use
            Recharts, animations use Framer Motion and icons come from Lucide.
          </p>
        </section>

        {/* The two data layers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <HudPanel variant="data" title="Layer A · Live TMDB data">
            <p className="text-sm leading-relaxed text-ink">
              Every film, series, cast member, poster, backdrop, date, rating, overview, credit and recommendation is
              requested live from The Movie Database (TMDB) API when you open a page. Nothing from TMDB is copied into
              this project&apos;s code. Values in <span className="text-signal">cyan</span> come from this layer.
            </p>
          </HudPanel>
          <HudPanel variant="editorial" title="Layer B · Editorial analysis">
            <p className="text-sm leading-relaxed text-ink">
              The {ENTITIES.length} dossiers add a hand-written layer on top: entity type, capabilities, threat level,
              related entities and five capability scores. Each dossier stores only TMDB IDs for its production and
              performer, which were verified against TMDB credits. Values in <span className="text-pulse">purple</span>{' '}
              are this project&apos;s own interpretation and are always labelled &quot;Archive Analysis&quot;.
            </p>
          </HudPanel>
        </div>

        {/* Theme methodology with live numbers */}
        <HudPanel variant="data" title="How the archive is selected">
          <div className="space-y-5 text-sm leading-relaxed text-ink">
            <p>
              The archive is not a fixed list. Films and series are pulled from TMDB&apos;s <code className="font-mono text-signal">/discover</code>{' '}
              endpoint using TMDB keywords. A title is included if it carries <em>any</em> of the theme keywords below
              (logical OR).
            </p>

            <ul className="grid gap-3 sm:grid-cols-2">
              {THEME_GROUP_KEYS.map((key) => (
                <li key={key}>
                  <Badge tone="signal">{THEME_GROUPS[key].label}</Badge>
                  <p className="mt-1 text-xs text-ink-muted">
                    {THEME_GROUPS[key].keywords.map((keyword) => `${keyword.name} (#${keyword.id})`).join(', ')}
                  </p>
                </li>
              ))}
            </ul>

            <DataList className="border-t border-line pt-4">
              <DataRow label="Films in archive" value={<>{live('movies')} with ≥ {MIN_VOTE_COUNT} votes · {live('moviesAll')} in total</>} />
              <DataRow label="Series in archive" value={<>{live('series')} with ≥ {MIN_VOTE_COUNT} votes · {live('seriesAll')} in total</>} />
            </DataList>
            <p className="text-xs text-ink-muted">
              Counts are live <code className="font-mono">total_results</code> values from TMDB. A minimum of{' '}
              {MIN_VOTE_COUNT} votes removes hundreds of obscure, unrated titles; the list pages can switch it off with
              &quot;Include low-vote titles&quot;. TMDB&apos;s Kids genre is excluded from series (it mostly added
              children&apos;s cartoons). Keywords such as &quot;mecha&quot; and &quot;giant robot&quot; were tested and
              left out because they describe piloted machines rather than artificial minds.
            </p>

            <p>
              <strong>Searching</strong> on the Movies and Series pages queries all of TMDB, not only the archive;
              results seen in archive lists are marked &quot;In archive&quot;. The <strong>Cast Registry</strong> is
              compiled from the top-billed credits of archive productions as you load them. Its &quot;probable synthetic
              characters&quot; filter is a heuristic: it matches character names containing words such as robot,
              android or AI, plus characters in the dossier catalog.
            </p>
          </div>
        </HudPanel>

        {/* Editorial scoring */}
        <HudPanel variant="editorial" title="Reading the dossiers">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="label-mono mb-3 text-pulse">Capability scores (1–10)</h2>
              <DataList>
                {SCORE_CRITERIA.map((criterion) => (
                  <DataRow key={criterion.key} label={criterion.label} value={criterion.description} variant="editorial" />
                ))}
              </DataList>
              <p className="mt-4 text-xs text-ink-muted">
                Scores are a subjective editorial assessment of each entity as portrayed on screen. They are not
                measurements and are not provided by TMDB.
              </p>
            </div>
            <div>
              <h2 className="label-mono mb-3 text-pulse">Threat assessment</h2>
              <ul className="flex flex-wrap gap-2">
                {THREAT_LEVELS.map((level) => (
                  <li key={level}>
                    <ThreatBadge level={level} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink">
                How dangerous the entity is to the people around it within its own story, from helpful companions
                (low) to entities that threaten humanity as a whole (critical). Each level has its own label and icon,
                so it never depends on colour alone.
              </p>
              <p className="mt-3 text-sm text-ink">
                A dossier shows <Badge tone="signal">TMDB credits</Badge> when its character is found in the live
                credits, and <Badge tone="pulse">Editorial</Badge> when the entity is not a credited role (for example
                Skynet).
              </p>
            </div>
          </div>
        </HudPanel>

        {/* Attribution (required by TMDB's terms) */}
        <HudPanel variant="neutral" title="Attribution" brackets bodyClassName="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="shrink-0" aria-label="The Movie Database (TMDB), opens in a new tab">
            <img src="/tmdb-logo.svg" alt="TMDB logo" className="h-6 w-auto" width="185" height="24" />
          </a>
          <div className="space-y-2 text-sm text-ink">
            <p className="font-medium">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
            <p className="text-ink-muted">
              Film, series and people data and images are provided by The Movie Database. Fictional characters and
              productions belong to their respective rights holders. Back to the{' '}
              <Link to="/" className="text-signal hover:underline">
                Command Center
              </Link>
              .
            </p>
            {/* Credit for the recorded intro narration (public/narration/). */}
            <p className="text-ink-muted">Narration voice generated with ElevenLabs.</p>
          </div>
        </HudPanel>
      </div>
    </PageShell>
  )
}

export default AboutPage
