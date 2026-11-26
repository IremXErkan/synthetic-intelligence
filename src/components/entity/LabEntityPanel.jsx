import { useCallback } from 'react'
import { Link } from 'react-router'
import { getMediaDetails, getPerson } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { getTitle, getYear } from '../../utils/media.js'
import { ENTITY_TYPES, getEntityCode } from '../../data/entities.js'
import HudPanel from '../common/HudPanel.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { ThreatBadge } from '../common/Badge.jsx'
import { SkeletonBlock } from '../common/Skeleton.jsx'

/**
 * One side of the comparison: live TMDB production + performer, editorial
 * type/threat. `accent` is the series color used in the chart (cyan / purple).
 */
function LabEntityPanel({ entity, slotLabel, accent }) {
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

  const portrait = data
    ? data.person?.profile_path
      ? imageUrl(data.person.profile_path, IMAGE_SIZES.profile)
      : imageUrl(data.media.backdrop_path, IMAGE_SIZES.backdropSmall)
    : null

  return (
    <HudPanel variant={accent === 'signal' ? 'data' : 'editorial'} title={slotLabel} titleAs="h2" className="h-full">
      <div className="flex gap-4">
        <div className="w-24 shrink-0">
          {loading ? (
            <SkeletonBlock className="aspect-[2/3] w-full" />
          ) : (
            <TintedImage
              src={error ? null : portrait}
              alt={data?.person ? `${data.person.name}, who plays ${entity.name}` : `${entity.name}`}
              className="[&_img]:object-top"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="label-mono text-[0.6875rem] text-ink-muted">{getEntityCode(entity.slug)}</p>
          <h3 className={`text-xl font-bold ${accent === 'signal' ? 'text-signal' : 'text-pulse'}`}>{entity.name}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {loading && 'Loading production…'}
            {error && (
              <>
                Production data unavailable.{' '}
                <button type="button" onClick={retry} className="text-signal underline">
                  Retry
                </button>
              </>
            )}
            {data && (
              <>
                {getTitle(data.media)}
                {getYear(data.media) && ` (${getYear(data.media)})`}
                {data.person && <span className="block text-xs">Played by {data.person.name}</span>}
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="label-mono text-[0.6875rem] text-pulse">{ENTITY_TYPES[entity.entityType]}</span>
            <ThreatBadge level={entity.threatLevel} />
          </div>
          <Link to={`/entity/${entity.slug}`} className="label-mono mt-3 inline-block text-[0.6875rem] text-signal hover:underline">
            Open dossier →
          </Link>
        </div>
      </div>
    </HudPanel>
  )
}

export default LabEntityPanel
