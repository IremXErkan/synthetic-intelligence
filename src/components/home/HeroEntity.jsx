import { useCallback } from 'react'
import { Link } from 'react-router'
import { Shuffle } from 'lucide-react'
import { getMediaDetails, getPerson } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { getTitle, getYear } from '../../utils/media.js'
import { ENTITY_TYPES, getEntityCode } from '../../data/entities.js'
import HudRings from '../common/HudRings.jsx'
import TintedImage from '../common/TintedImage.jsx'
import ErrorState from '../common/ErrorState.jsx'
import { SkeletonBlock } from '../common/Skeleton.jsx'
import { Badge, ThreatBadge } from '../common/Badge.jsx'

/**
 * Featured entity at the center of the dashboard. Everything about the
 * production and the actor is fetched live from TMDB; name, type and threat
 * come from the editorial catalog and are labelled as such.
 * Image: the credited actor's TMDB profile, or the production backdrop when
 * the entity has no credited performer (e.g. Skynet).
 */
function HeroEntity({ entity, onShuffle }) {
  const fetcher = useCallback(
    async (signal) => {
      const [media, person] = await Promise.all([
        getMediaDetails(entity.media.type, entity.media.tmdbId, {}, { signal }),
        entity.creditPersonId ? getPerson(entity.creditPersonId, {}, { signal }) : null,
      ])
      return { media, person }
    },
    [entity],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  const ring = (content) => (
    <div className="relative mx-auto grid aspect-square w-full max-w-[22rem] place-items-center overflow-hidden">
      <HudRings className="absolute inset-0 size-full" />
      <div className="relative size-[62%] overflow-hidden rounded-full border border-signal/40">{content}</div>
    </div>
  )

  if (loading) {
    return (
      <div role="status" aria-label="Loading featured entity">
        {ring(<SkeletonBlock className="size-full rounded-full" />)}
        <SkeletonBlock className="mx-auto mt-6 h-7 w-40" />
        <SkeletonBlock className="mx-auto mt-3 h-4 w-56" />
      </div>
    )
  }

  if (error) return <ErrorState error={error} onRetry={retry} />

  const { media, person } = data
  const imagePath = person?.profile_path
    ? imageUrl(person.profile_path, IMAGE_SIZES.profileLarge)
    : imageUrl(media.backdrop_path, IMAGE_SIZES.backdropSmall)
  const year = getYear(media)
  const code = getEntityCode(entity.slug)

  return (
    <div className="text-center">
      {ring(
        <TintedImage
          src={imagePath}
          alt={person ? `${person.name}, who plays ${entity.name}` : `Still from ${getTitle(media)}`}
          aspect="aspect-square"
          className="size-full [&_img]:object-top"
        />,
      )}

      <p className="label-mono mt-5 text-ink-muted">
        Featured entity <span aria-hidden="true">//</span> {code}
      </p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">{entity.name}</h2>
      <p className="mt-2 text-sm text-ink-muted">
        <span className="text-signal">{getTitle(media)}</span>
        {year && ` (${year})`}
        {person && (
          <>
            {' · '}
            {entity.creditCharacterName?.includes('(voice)') ? 'Voiced by' : 'Played by'}{' '}
            <span className="text-ink">{person.name}</span>
          </>
        )}
      </p>

      {/* Editorial classification, labelled as such */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Badge tone="pulse">{ENTITY_TYPES[entity.entityType]}</Badge>
        <ThreatBadge level={entity.threatLevel} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={`/entity/${entity.slug}`}
          className="chamfer bg-signal px-5 py-2 text-sm font-semibold text-void transition-colors [--cut:8px] hover:bg-signal/85"
        >
          Open dossier
        </Link>
        <button
          type="button"
          onClick={onShuffle}
          className="chamfer inline-flex items-center gap-2 bg-line-strong px-4 py-2 text-sm text-ink transition-colors [--cut:8px] hover:bg-signal/20 hover:text-signal"
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Scan another
        </button>
      </div>
    </div>
  )
}

export default HeroEntity
