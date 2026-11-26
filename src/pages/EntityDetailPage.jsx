import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, FlaskConical } from 'lucide-react'
import { fetchDossierRecord } from '../services/catalog.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { findCreditedCharacter } from '../utils/dossier.js'
import { getEntityBySlug, getEntityCode } from '../data/entities.js'
import HudPanel from '../components/common/HudPanel.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import { ThreatBadge } from '../components/common/Badge.jsx'
import { SkeletonBlock } from '../components/common/Skeleton.jsx'
import MediaCard from '../components/media/MediaCard.jsx'
import DossierFile from '../components/entity/DossierFile.jsx'
import ScoreBars from '../components/entity/ScoreBars.jsx'
import { RedactedText } from '../components/common/Redacted.jsx'
import NotFoundPage from './NotFoundPage.jsx'

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
  const fetcher = useCallback((signal) => fetchDossierRecord(entity, signal), [entity])
  const { data, error, loading, retry } = useFetch(fetcher)
  useDocumentTitle(error ? 'Signal Lost' : `${entity.name} · Classified Dossier`)

  if (loading) return <DossierSkeleton />
  if (error) {
    return (
      <div className="px-4 py-16">
        <ErrorState error={error} title="Dossier link to TMDB failed" onRetry={retry} />
      </div>
    )
  }

  const { media, person } = data
  const creditedCharacter = findCreditedCharacter(entity, media)
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

      <DossierFile entity={entity} media={media} person={person} creditedCharacter={creditedCharacter} />

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

          {entity.addendum && (
            <div>
              <h3 className="label-mono mb-2 text-pulse">Addendum</h3>
              <p className="leading-relaxed text-ink">
                <RedactedText text={entity.addendum} />
              </p>
              <p className="mt-1 text-xs text-ink-muted">Select a [CLASSIFIED] passage to declassify it.</p>
            </div>
          )}

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
