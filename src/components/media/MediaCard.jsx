import { Link } from 'react-router'
import { Star } from 'lucide-react'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { getTitle, getYear } from '../../utils/media.js'
import HudPanel from '../common/HudPanel.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { Badge } from '../common/Badge.jsx'

/**
 * Poster card for a movie or series (TMDB list item). Links to the media detail
 * page. `inArchive` adds the "In archive" badge (used on search results).
 */
function MediaCard({ item, mediaType, inArchive = false }) {
  const title = getTitle(item)
  const year = getYear(item)
  const hasRating = item.vote_count > 0

  return (
    <Link to={`/media/${mediaType}/${item.id}`} className="group block h-full">
      <HudPanel variant="data" glow cut={12} className="h-full" bodyClassName="flex h-full flex-col p-0">
        <div className="relative">
          <TintedImage src={imageUrl(item.poster_path, IMAGE_SIZES.posterCard)} alt={`${title} poster`} />
          {inArchive && (
            <Badge tone="signal" className="absolute left-2 top-2 bg-void/85">
              In archive
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col border-t border-line p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-signal">{title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs text-ink-muted">
            <span>{year ?? 'Year n/a'}</span>
            <span aria-hidden="true">·</span>
            {hasRating ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 text-threat-moderate" aria-hidden="true" />
                <span>
                  <span className="sr-only">Rating </span>
                  {item.vote_average.toFixed(1)}
                </span>
              </span>
            ) : (
              <span>No rating</span>
            )}
          </p>
          {item.overview && <p className="mt-2 line-clamp-2 text-xs text-ink-muted">{item.overview}</p>}
          <p className="label-mono mt-auto pt-3 text-[0.6875rem] text-ink-muted/80">TMDB #{item.id}</p>
        </div>
      </HudPanel>
    </Link>
  )
}

export default MediaCard
