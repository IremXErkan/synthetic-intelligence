import { useCallback } from 'react'
import { Link } from 'react-router'
import { getMediaDetails } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { getTitle, getYear } from '../../utils/media.js'
import { ENTITY_TYPES, getEntityBySlug, getEntityCode } from '../../data/entities.js'
import HudPanel from '../common/HudPanel.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { SkeletonBlock } from '../common/Skeleton.jsx'
import { ThreatBadge } from '../common/Badge.jsx'

// Editorial pick of dossiers to feature on the dashboard.
const FEATURED_SLUGS = ['hal-9000', 'ava', 'tars', 'skynet']

function DossierCard({ entity }) {
  const fetcher = useCallback(
    (signal) => getMediaDetails(entity.media.type, entity.media.tmdbId, {}, { signal }),
    [entity],
  )
  const { data: media, error, loading } = useFetch(fetcher)

  return (
    <Link to={`/entity/${entity.slug}`} className="group block h-full">
      <HudPanel variant="editorial" glow cut={12} className="h-full" bodyClassName="flex h-full gap-4 p-3">
        <div className="w-24 shrink-0">
          {loading ? (
            <SkeletonBlock className="aspect-[2/3] w-full" />
          ) : (
            // On error the image falls back to the themed placeholder.
            <TintedImage
              src={error ? null : imageUrl(media.poster_path, IMAGE_SIZES.posterCard)}
              alt={error ? `${entity.name} production poster` : `${getTitle(media)} poster`}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-col py-1">
          <span className="label-mono text-[0.6875rem] text-ink-muted">{getEntityCode(entity.slug)}</span>
          <h3 className="mt-1 text-lg font-semibold text-ink group-hover:text-pulse">{entity.name}</h3>
          <p className="truncate text-sm text-ink-muted">
            {loading && 'Loading production…'}
            {error && 'Production data unavailable'}
            {media && (
              <>
                {getTitle(media)}
                {getYear(media) && ` (${getYear(media)})`}
              </>
            )}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <span className="label-mono text-[0.6875rem] text-pulse">{ENTITY_TYPES[entity.entityType]}</span>
            <ThreatBadge level={entity.threatLevel} />
          </div>
        </div>
      </HudPanel>
    </Link>
  )
}

function FeaturedDossiers() {
  return (
    <section aria-labelledby="featured-dossiers-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="featured-dossiers-title" className="label-mono text-pulse">
            Featured dossiers
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Classification and threat level are the archive&apos;s editorial analysis. Production data is live from TMDB.
          </p>
        </div>
        <Link to="/entities" className="label-mono text-signal hover:underline">
          All dossiers →
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_SLUGS.map((slug) => (
          <li key={slug}>
            <DossierCard entity={getEntityBySlug(slug)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeaturedDossiers
