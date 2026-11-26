import { Link } from 'react-router'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { getTitle, getYear } from '../../utils/media.js'
import { ENTITY_TYPES, getEntityCode } from '../../data/entities.js'
import HudPanel from '../common/HudPanel.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { Badge, ThreatBadge } from '../common/Badge.jsx'
import { SkeletonBlock } from '../common/Skeleton.jsx'

/**
 * Dossier card. `media` is the live TMDB record of the entity's production
 * (null while unavailable); name, type and threat are editorial.
 */
function EntityCard({ entity, media, mediaError }) {
  const productionLabel = media
    ? `${getTitle(media)}${getYear(media) ? ` (${getYear(media)})` : ''}`
    : mediaError
      ? 'Production data unavailable'
      : 'Loading production…'

  return (
    <Link to={`/entity/${entity.slug}`} className="group block h-full">
      <HudPanel variant="editorial" glow cut={12} className="h-full" bodyClassName="flex h-full flex-col p-0">
        {!media && !mediaError ? (
          <SkeletonBlock className="aspect-video w-full rounded-none" />
        ) : (
          <TintedImage
            src={media ? imageUrl(media.backdrop_path, IMAGE_SIZES.backdropSmall) : null}
            alt={media ? `Still from ${getTitle(media)}` : `${entity.name} production still`}
            aspect="aspect-video"
          />
        )}
        <div className="flex flex-1 flex-col border-t border-line p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono text-[0.6875rem] text-ink-muted">{getEntityCode(entity.slug)}</span>
            <Badge tone="signal">{entity.media.type === 'movie' ? 'Film' : 'Series'}</Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-ink group-hover:text-pulse">{entity.name}</h2>
          <p className="truncate text-sm text-signal">{productionLabel}</p>
          <p className="mt-2 line-clamp-2 text-xs text-ink-muted">{entity.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <Badge tone="pulse">{ENTITY_TYPES[entity.entityType]}</Badge>
            <ThreatBadge level={entity.threatLevel} />
          </div>
        </div>
      </HudPanel>
    </Link>
  )
}

export default EntityCard
