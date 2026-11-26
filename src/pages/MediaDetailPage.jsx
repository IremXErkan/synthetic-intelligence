import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { PlayCircle, Star } from 'lucide-react'
import { MEDIA_TYPES, getMediaDetails } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'
import { formatDate, getReleaseDate, getTitle, getYear } from '../utils/media.js'
import { THEME_GROUPS, getThemeGroupsForKeywords } from '../config/themeKeywords.js'
import { ENTITY_TYPES, getEntitiesForMedia, getEntityCode } from '../data/entities.js'
import HudPanel from '../components/common/HudPanel.jsx'
import TintedImage from '../components/common/TintedImage.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'
import { SkeletonBlock, SkeletonGrid } from '../components/common/Skeleton.jsx'
import CastList from '../components/media/CastList.jsx'
import MediaCard from '../components/media/MediaCard.jsx'
import NotFoundPage from './NotFoundPage.jsx'

// Verified append_to_response sets (movie credits vs TV aggregate_credits).
const APPEND = {
  movie: 'credits,videos,recommendations,keywords',
  tv: 'aggregate_credits,videos,recommendations,keywords',
}

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

function formatRuntime(minutes) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

/** Official YouTube trailer if TMDB lists one, else any YouTube trailer/teaser. */
function pickTrailer(videos = []) {
  const youtube = videos.filter((video) => video.site === 'YouTube')
  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ??
    youtube.find((video) => video.type === 'Trailer') ??
    youtube.find((video) => video.type === 'Teaser') ??
    null
  )
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <SkeletonBlock className="aspect-[2/3] w-full max-w-60" />
        <div className="space-y-4">
          <SkeletonBlock className="h-10 w-2/3" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </div>
      <div className="mt-12">
        <SkeletonGrid count={6} label="Loading cast" />
      </div>
    </div>
  )
}

function MediaDetail({ type, id }) {
  const fetcher = useCallback((signal) => getMediaDetails(type, id, { append: APPEND[type] }, { signal }), [type, id])
  const { data, error, loading, retry } = useFetch(fetcher)
  // 404s get their title from NotFoundPage; null leaves the title as is.
  useDocumentTitle(loading ? null : error ? (error.status === 404 ? null : 'Signal Lost') : getTitle(data))

  if (loading) return <DetailSkeleton />
  if (error?.status === 404) {
    return <NotFoundPage title="Title not found" message={`TMDB has no ${type === 'movie' ? 'film' : 'series'} with ID ${id}.`} />
  }
  if (error) {
    return (
      <div className="px-4 py-16">
        <ErrorState error={error} onRetry={retry} />
      </div>
    )
  }

  const title = getTitle(data)
  const year = getYear(data)
  const credits = type === 'movie' ? data.credits : data.aggregate_credits
  const keywordIds = (data.keywords?.keywords ?? data.keywords?.results ?? []).map((keyword) => keyword.id)
  const themeGroups = getThemeGroupsForKeywords(keywordIds)
  const dossiers = getEntitiesForMedia(type, data.id)
  const trailer = pickTrailer(data.videos?.results)
  const recommendations = data.recommendations?.results?.slice(0, 10) ?? []
  const directors = type === 'movie' ? data.credits?.crew?.filter((member) => member.job === 'Director').map((m) => m.name) : []
  const backdrop = imageUrl(data.backdrop_path, IMAGE_SIZES.backdrop)

  return (
    <article>
      {/* Hero: backdrop is decorative (the poster carries the alt text) */}
      <header className="relative overflow-hidden border-b border-line">
        {backdrop && (
          <img src={backdrop} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-30 grayscale-[40%]" />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/40" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[240px_1fr]">
          <div className="w-44 sm:w-56 md:w-full">
            <HudPanel variant="data" cut={14} bodyClassName="p-0">
              <TintedImage src={imageUrl(data.poster_path, IMAGE_SIZES.posterDetail)} alt={`${title} poster`} />
            </HudPanel>
          </div>

          <div className="min-w-0">
            <p className="label-mono text-ink-muted">
              {type === 'movie' ? 'Film' : 'Series'} <span aria-hidden="true">//</span> TMDB #{data.id}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
              {title}
              {year && <span className="font-normal text-ink-muted"> ({year})</span>}
            </h1>
            {data.tagline && <p className="mt-3 text-lg italic text-ink-muted">“{data.tagline}”</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
              {data.vote_count > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 text-threat-moderate" aria-hidden="true" />
                  <span className="text-ink">{data.vote_average.toFixed(1)}</span> / 10
                  <span className="text-xs">({data.vote_count.toLocaleString('en-US')} votes)</span>
                </span>
              )}
              {type === 'movie' && formatRuntime(data.runtime) && <span>{formatRuntime(data.runtime)}</span>}
              {type === 'tv' && data.number_of_seasons > 0 && (
                <span>
                  {data.number_of_seasons} {data.number_of_seasons === 1 ? 'season' : 'seasons'} · {data.number_of_episodes} episodes
                </span>
              )}
            </div>

            {data.genres?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Genres">
                {data.genres.map((genre) => (
                  <li key={genre.id}>
                    <Badge>{genre.name}</Badge>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 max-w-3xl leading-relaxed text-ink">{data.overview || 'TMDB has no overview for this title.'}</p>

            {trailer && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
                className="chamfer mt-6 inline-flex items-center gap-2 bg-signal px-5 py-2.5 text-sm font-semibold text-void transition-colors [--cut:8px] hover:bg-signal/85"
              >
                <PlayCircle className="size-4" aria-hidden="true" />
                Watch trailer on YouTube
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <HudPanel variant="data" title="TMDB record">
            <DataList>
              <DataRow label={type === 'movie' ? 'Release date' : 'First aired'} value={formatDate(getReleaseDate(data))} />
              {type === 'tv' && <DataRow label="Last aired" value={formatDate(data.last_air_date)} />}
              {type === 'movie' && <DataRow label="Directed by" value={directors.join(', ')} />}
              {type === 'tv' && <DataRow label="Created by" value={data.created_by?.map((c) => c.name).join(', ')} />}
              {type === 'tv' && <DataRow label="Network" value={data.networks?.map((n) => n.name).join(', ')} />}
              <DataRow label="Status" value={data.status} />
              <DataRow label="Language" value={data.original_language ? languageNames.of(data.original_language) : null} />
              <DataRow
                label="Theme keywords"
                value={
                  themeGroups.length > 0 ? (
                    <span className="flex flex-wrap gap-2">
                      {themeGroups.map((key) => (
                        <Badge key={key} tone="signal">
                          {THEME_GROUPS[key].label}
                        </Badge>
                      ))}
                    </span>
                  ) : (
                    'Not tagged with archive keywords'
                  )
                }
              />
            </DataList>
          </HudPanel>

          {/* Editorial layer: only shown when the dossier catalog references this title */}
          <HudPanel variant="editorial" title="Archive analysis · Linked dossiers">
            {dossiers.length > 0 ? (
              <ul className="space-y-3">
                {dossiers.map((entity) => (
                  <li key={entity.slug}>
                    <Link to={`/entity/${entity.slug}`} className="group flex flex-wrap items-center justify-between gap-3">
                      <span>
                        <span className="label-mono block text-[0.6875rem] text-ink-muted">{getEntityCode(entity.slug)}</span>
                        <span className="text-lg font-semibold text-ink group-hover:text-pulse">{entity.name}</span>
                        <span className="ml-2 text-sm text-pulse">{ENTITY_TYPES[entity.entityType]}</span>
                      </span>
                      <ThreatBadge level={entity.threatLevel} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No dossier in the archive references this title yet.</p>
            )}
          </HudPanel>
        </div>

        <section aria-labelledby="cast-title">
          <h2 id="cast-title" className="label-mono mb-4 text-signal">
            Top-billed cast
          </h2>
          <CastList cast={credits?.cast ?? []} />
        </section>

        <section aria-labelledby="recs-title">
          <h2 id="recs-title" className="label-mono mb-1 text-signal">
            Recommended by TMDB
          </h2>
          <p className="mb-4 text-xs text-ink-muted">TMDB recommendations; not all of them are part of the archive theme.</p>
          {recommendations.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {recommendations.map((item) => (
                <li key={item.id}>
                  <MediaCard item={item} mediaType={item.media_type === 'tv' || item.media_type === 'movie' ? item.media_type : type} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">TMDB has no recommendations for this title.</p>
          )}
        </section>
      </div>
    </article>
  )
}

/** /media/:type/:id — validates the route before any request is made. */
function MediaDetailPage() {
  const { type, id } = useParams()

  if (!MEDIA_TYPES.includes(type)) {
    return <NotFoundPage title="Unknown media type" message={`"${type}" is not a valid archive section. Use /media/movie/… or /media/tv/….`} />
  }
  if (!/^\d+$/.test(id)) {
    return <NotFoundPage title="Invalid record ID" message={`"${id}" is not a valid TMDB ID.`} />
  }

  // key: a new title starts from a clean state.
  return <MediaDetail key={`${type}-${id}`} type={type} id={Number(id)} />
}

export default MediaDetailPage
