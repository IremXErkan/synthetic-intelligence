import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, FlaskConical } from 'lucide-react'
import { getMediaDetails, getPerson } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'
import { formatDate, getReleaseDate, getTitle, getYear } from '../utils/media.js'
import { ENTITY_TYPES, getEntityBySlug, getEntityCode } from '../data/entities.js'
import HudPanel from '../components/common/HudPanel.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'
import { SkeletonBlock } from '../components/common/Skeleton.jsx'
import MediaCard from '../components/media/MediaCard.jsx'
import DossierPortrait from '../components/entity/DossierPortrait.jsx'
import ScoreBars from '../components/entity/ScoreBars.jsx'
import NotFoundPage from './NotFoundPage.jsx'

const CREDITS_APPEND = { movie: 'credits', tv: 'aggregate_credits' }

/**
 * Finds the entity's performer in the live credits. Returns the credited
 * character string, or null when TMDB credits do not list them (→ editorial match).
 */
function findCreditedCharacter(entity, media) {
  if (!entity.creditPersonId) return null
  const cast = (entity.media.type === 'movie' ? media.credits : media.aggregate_credits)?.cast ?? []
  const member = cast.find((person) => person.id === entity.creditPersonId)
  if (!member) return null
  return member.character || member.roles?.map((role) => role.character).filter(Boolean).join(' / ') || null
}

function DossierSkeleton() {
  return (
    <div role="status" aria-label="Opening dossier" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SkeletonBlock className="mx-auto h-16 w-72" />
      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <SkeletonBlock className="aspect-[2/3] w-full" />
        <div className="space-y-4">
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

function Dossier({ entity }) {
  const fetcher = useCallback(
    async (signal) => {
      const [media, person] = await Promise.all([
        getMediaDetails(entity.media.type, entity.media.tmdbId, { append: CREDITS_APPEND[entity.media.type] }, { signal }),
        entity.creditPersonId ? getPerson(entity.creditPersonId, {}, { signal }) : null,
      ])
      return { media, person }
    },
    [entity],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) return <DossierSkeleton />
  if (error) {
    return (
      <div className="px-4 py-16">
        <ErrorState error={error} title="Dossier link to TMDB failed" onRetry={retry} />
      </div>
    )
  }

  const { media, person } = data
  const code = getEntityCode(entity.slug)
  const creditedCharacter = findCreditedCharacter(entity, media)
  const portrait = person?.profile_path
    ? imageUrl(person.profile_path, IMAGE_SIZES.profileLarge)
    : imageUrl(media.backdrop_path, IMAGE_SIZES.backdropSmall)
  const related = entity.related.map(getEntityBySlug).filter(Boolean)
  const mediaType = entity.media.type

  return (
    <motion.article
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      // "File opening": the frame unfolds vertically once (skipped for reduced motion).
      initial={{ opacity: 0, scaleY: 0.96 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ transformOrigin: 'top' }}
    >
      <Link to="/entities" className="label-mono inline-flex items-center gap-2 text-ink-muted hover:text-signal">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Intelligence database
      </Link>

      {/* Name plate */}
      <header className="relative mt-6 text-center">
        <div className="chamfer mx-auto inline-block bg-pulse/40 p-px [--cut:16px]">
          <div className="chamfer bg-panel px-8 py-4 [--cut:16px] sm:px-14">
            <p className="label-mono text-ink-muted">
              Classified dossier <span aria-hidden="true">//</span> {code}
            </p>
            <h1 className="mt-1 text-4xl font-bold tracking-[0.08em] text-ink sm:text-5xl">{entity.name}</h1>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="absolute right-0 top-1 hidden rotate-6 border-2 border-threat-high/70 px-3 py-1 font-mono text-sm font-medium tracking-[0.3em] text-threat-high/80 md:inline-block"
        >
          CLASSIFIED
        </span>
      </header>

      {/* Main frame */}
      <HudPanel variant="neutral" brackets className="mt-8" bodyClassName="p-5 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="mx-auto w-56 md:w-full">
            <DossierPortrait
              src={portrait}
              alt={person ? `${person.name}, who plays ${entity.name}` : `Still from ${getTitle(media)}`}
            />
            <p className="label-mono mt-2 text-center text-[0.6875rem] text-ink-muted">
              {person ? 'Performer profile · TMDB' : 'Production still · TMDB'}
            </p>
          </div>

          <div className="grid min-w-0 gap-6">
            {/* TMDB layer */}
            <section aria-labelledby="dossier-tmdb">
              <h2 id="dossier-tmdb" className="label-mono mb-3 text-signal">
                Source record · Live from TMDB
              </h2>
              <DataList>
                <DataRow
                  label="Origin"
                  value={
                    <Link to={`/media/${mediaType}/${media.id}`} className="text-signal hover:underline">
                      {getTitle(media)}
                      {getYear(media) && ` (${getYear(media)})`}
                    </Link>
                  }
                />
                <DataRow label="First appearance" value={formatDate(getReleaseDate(media))} />
                <DataRow label="Medium" value={mediaType === 'movie' ? 'Feature film' : 'Television series'} />
                <DataRow
                  label="Portrayed by"
                  value={
                    person ? (
                      <Link to={`/person/${person.id}`} className="text-signal hover:underline">
                        {person.name}
                      </Link>
                    ) : null
                  }
                />
                <DataRow label="Credited as" value={creditedCharacter} />
                <DataRow
                  label="Character match"
                  value={
                    creditedCharacter ? (
                      <Badge tone="signal">TMDB credits</Badge>
                    ) : (
                      <Badge tone="pulse">Editorial</Badge>
                    )
                  }
                />
                <DataRow label="TMDB ID" value={<span className="font-mono">#{media.id}</span>} />
              </DataList>
              {!creditedCharacter && (
                <p className="mt-3 text-xs text-ink-muted">
                  This entity is not a credited character in TMDB, so the link to {getTitle(media)} is an editorial match.
                </p>
              )}
            </section>

            {/* Editorial layer */}
            <section aria-labelledby="dossier-analysis" className="border-t border-pulse/30 pt-6">
              <h2 id="dossier-analysis" className="label-mono mb-3 text-pulse">
                Archive analysis · Editorial classification
              </h2>
              <DataList>
                <DataRow label="Entity ID" value={<span className="font-mono">{code}</span>} variant="editorial" />
                <DataRow label="Classification" value={ENTITY_TYPES[entity.entityType]} variant="editorial" />
                <DataRow label="Aliases" value={entity.aliases.join(', ')} variant="editorial" />
                <DataRow label="Threat assessment" value={<ThreatBadge level={entity.threatLevel} />} variant="editorial" />
              </DataList>
            </section>
          </div>
        </div>
      </HudPanel>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Associated media (TMDB) + related dossiers (editorial) */}
        <div className="space-y-6">
          <HudPanel variant="data" title="Associated media">
            <div className="max-w-48">
              <MediaCard item={media} mediaType={mediaType} />
            </div>
          </HudPanel>

          {related.length > 0 && (
            <HudPanel variant="editorial" title="Related dossiers">
              <ul className="space-y-3">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link to={`/entity/${other.slug}`} className="group flex items-center justify-between gap-3">
                      <span>
                        <span className="label-mono block text-[0.6875rem] text-ink-muted">{getEntityCode(other.slug)}</span>
                        <span className="font-semibold text-ink group-hover:text-pulse">{other.name}</span>
                      </span>
                      <ThreatBadge level={other.threatLevel} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ink-muted">Relations are editorial associations, not TMDB data.</p>
            </HudPanel>
          )}
        </div>

        {/* Analyst notes (editorial) */}
        <HudPanel variant="editorial" title="Analyst notes" brackets bodyClassName="space-y-6 p-6">
          <p className="leading-relaxed text-ink">{entity.summary}</p>

          <div>
            <h3 className="label-mono mb-2 text-pulse">Observed capabilities</h3>
            <ul className="space-y-1.5 text-sm text-ink">
              {entity.capabilities.map((capability) => (
                <li key={capability} className="flex gap-2">
                  <span aria-hidden="true" className="text-pulse">
                    ::
                  </span>
                  {capability}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-mono mb-3 text-pulse">Capability profile</h3>
            <ScoreBars scores={entity.scores} />
          </div>

          <Link
            to={`/lab?a=${entity.slug}`}
            className="chamfer inline-flex items-center gap-2 bg-pulse px-5 py-2.5 text-sm font-semibold text-void transition-colors [--cut:8px] hover:bg-pulse/85"
          >
            <FlaskConical className="size-4" aria-hidden="true" />
            Compare in Lab
          </Link>
        </HudPanel>
      </div>
    </motion.article>
  )
}

/** /entity/:slug — unknown slugs get the themed 404 without any request. */
function EntityDetailPage() {
  const { slug } = useParams()
  const entity = getEntityBySlug(slug)
  if (!entity) {
    return <NotFoundPage title="Dossier not found" message={`No classified file exists for "${slug}".`} />
  }
  return <Dossier key={entity.slug} entity={entity} />
}

export default EntityDetailPage
