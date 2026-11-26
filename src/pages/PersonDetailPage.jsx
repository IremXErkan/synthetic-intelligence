import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Info } from 'lucide-react'
import { getPerson, isInArchive } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'
import { formatDate, getReleaseDate, getTitle, getYear } from '../utils/media.js'
import { getSyntheticReason } from '../utils/castCompiler.js'
import { ENTITIES, ENTITY_TYPES, getEntityCode } from '../data/entities.js'
import HudPanel from '../components/common/HudPanel.jsx'
import TintedImage from '../components/common/TintedImage.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'
import { SkeletonBlock } from '../components/common/Skeleton.jsx'
import MediaCard from '../components/media/MediaCard.jsx'
import NotFoundPage from './NotFoundPage.jsx'

const BIO_PREVIEW_LENGTH = 600
const CREDITS_PREVIEW = 20

const HIGHLIGHT_LABEL = {
  dossier: 'Dossier character',
  term: 'Synthetic character name',
  archive: 'In archive',
}

/**
 * Acting credits, one row per production (TMDB can list a film twice for two
 * characters), newest first, each tagged with why it is highlighted (if at all).
 */
function buildCredits(personId, cast = []) {
  const rows = new Map()
  for (const credit of cast) {
    if (credit.media_type !== 'movie' && credit.media_type !== 'tv') continue
    const key = `${credit.media_type}-${credit.id}`
    const existing = rows.get(key)
    if (existing) {
      // Merge character names role by role, so "Data / Lore" + "Data" stays "Data / Lore".
      const names = new Set([existing.character, credit.character].filter(Boolean).flatMap((c) => c.split(' / ')))
      existing.character = [...names].join(' / ') || null
      continue
    }
    rows.set(key, { ...credit, character: credit.character || null })
  }

  return [...rows.values()]
    .map((credit) => {
      const role = { character: credit.character, mediaType: credit.media_type, mediaId: credit.id }
      const highlight = getSyntheticReason(personId, role) ?? (isInArchive(credit.media_type, credit.id) ? 'archive' : null)
      return { ...credit, highlight }
    })
    .sort((a, b) => (getReleaseDate(b) ?? '0').localeCompare(getReleaseDate(a) ?? '0'))
}

function PersonSkeleton() {
  return (
    <div role="status" aria-label="Loading person" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr]">
      <SkeletonBlock className="aspect-[2/3] w-full max-w-64" />
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-1/2" />
        <SkeletonBlock className="h-40 w-full" />
      </div>
    </div>
  )
}

function PersonDetail({ id }) {
  const fetcher = useCallback((signal) => getPerson(id, { append: 'combined_credits' }, { signal }), [id])
  const { data, error, loading, retry } = useFetch(fetcher)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [showAllCredits, setShowAllCredits] = useState(false)

  const credits = useMemo(() => (data ? buildCredits(data.id, data.combined_credits?.cast) : []), [data])

  if (loading) return <PersonSkeleton />
  if (error?.status === 404) return <NotFoundPage title="Person not found" message={`TMDB has no person with ID ${id}.`} />
  if (error) {
    return (
      <div className="px-4 py-16">
        <ErrorState error={error} onRetry={retry} />
      </div>
    )
  }

  const highlighted = credits.filter((credit) => credit.highlight)
  const visibleCredits = showAllCredits ? credits : credits.slice(0, CREDITS_PREVIEW)
  const dossiers = ENTITIES.filter((entity) => entity.creditPersonId === data.id)
  const bio = data.biography?.trim()
  const bioIsLong = bio && bio.length > BIO_PREVIEW_LENGTH

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="w-48 sm:w-60 md:w-full">
          <HudPanel variant="data" cut={14} bodyClassName="p-0">
            <TintedImage src={imageUrl(data.profile_path, IMAGE_SIZES.profileLarge)} alt={data.name} className="[&_img]:object-top" />
          </HudPanel>
        </div>

        <div className="min-w-0">
          <p className="label-mono text-ink-muted">
            Personnel file <span aria-hidden="true">//</span> TMDB #{data.id}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl">{data.name}</h1>

          <HudPanel variant="data" title="TMDB record" titleAs="h2" className="mt-6 max-w-2xl">
            <DataList>
              <DataRow label="Known for" value={data.known_for_department} />
              <DataRow label="Born" value={formatDate(data.birthday)} />
              {data.deathday && <DataRow label="Died" value={formatDate(data.deathday)} />}
              <DataRow label="Birthplace" value={data.place_of_birth} />
              <DataRow label="Acting credits" value={credits.length > 0 ? credits.length : null} />
            </DataList>
          </HudPanel>

          <section className="mt-6 max-w-3xl" aria-labelledby="bio-title">
            <h2 id="bio-title" className="label-mono mb-2 text-signal">
              Biography
            </h2>
            {bio ? (
              <>
                <p className="whitespace-pre-line leading-relaxed text-ink">
                  {bioIsLong && !bioExpanded ? `${bio.slice(0, BIO_PREVIEW_LENGTH).trimEnd()}…` : bio}
                </p>
                {bioIsLong && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded((open) => !open)}
                    aria-expanded={bioExpanded}
                    className="label-mono mt-2 text-signal hover:underline"
                  >
                    {bioExpanded ? 'Show less' : 'Read full biography'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-muted">TMDB has no English biography for this person.</p>
            )}
          </section>
        </div>
      </header>

      {dossiers.length > 0 && (
        <HudPanel variant="editorial" title="Archive analysis · Linked dossiers" className="mt-12">
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
        </HudPanel>
      )}

      <section className="mt-12" aria-labelledby="archive-roles-title">
        <h2 id="archive-roles-title" className="label-mono mb-1 text-signal">
          Archive-related roles
        </h2>
        <p className="mb-4 flex gap-2 text-xs text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Highlighted when the character is in the dossier catalog, its name suggests a machine, or the title
          appeared in the archive lists during this visit.
        </p>
        {highlighted.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {highlighted.map((credit) => (
              <li key={`${credit.media_type}-${credit.id}`} className="space-y-2">
                <MediaCard item={credit} mediaType={credit.media_type} />
                <p className="text-xs text-ink">
                  <span className="text-ink-muted">as </span>
                  {credit.character || 'Uncredited role'}
                </p>
                <p className={`label-mono text-[0.6875rem] ${credit.highlight === 'dossier' ? 'text-pulse' : 'text-signal'}`}>
                  <span aria-hidden="true">◆ </span>
                  {HIGHLIGHT_LABEL[credit.highlight]}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No roles matched the archive highlights.</p>
        )}
      </section>

      <section className="mt-12" aria-labelledby="credits-title">
        <h2 id="credits-title" className="label-mono mb-4 text-signal">
          All acting credits ({credits.length})
        </h2>
        {credits.length > 0 ? (
          <HudPanel variant="neutral" bodyClassName="p-0">
            <ol className="divide-y divide-line">
              {visibleCredits.map((credit) => (
                <li key={`${credit.media_type}-${credit.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-ink-muted">{getYear(credit) ?? '—'}</span>
                  <span className="min-w-0 flex-1">
                    <Link to={`/media/${credit.media_type}/${credit.id}`} className="text-sm font-medium text-ink hover:text-signal">
                      {getTitle(credit)}
                    </Link>
                    {credit.character && <span className="text-sm text-ink-muted"> · as {credit.character}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    {credit.highlight && (
                      <Badge tone={credit.highlight === 'dossier' ? 'pulse' : 'signal'}>{HIGHLIGHT_LABEL[credit.highlight]}</Badge>
                    )}
                    <Badge>{credit.media_type === 'movie' ? 'Film' : 'Series'}</Badge>
                  </span>
                </li>
              ))}
            </ol>
          </HudPanel>
        ) : (
          <p className="text-sm text-ink-muted">TMDB lists no acting credits for this person.</p>
        )}
        {credits.length > CREDITS_PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAllCredits((all) => !all)}
            aria-expanded={showAllCredits}
            className="label-mono mt-4 text-signal hover:underline"
          >
            {showAllCredits ? 'Show fewer' : `Show all ${credits.length} credits`}
          </button>
        )}
      </section>
    </article>
  )
}

/** /person/:id — validates the ID before any request is made. */
function PersonDetailPage() {
  const { id } = useParams()
  if (!/^\d+$/.test(id)) {
    return <NotFoundPage title="Invalid personnel ID" message={`"${id}" is not a valid TMDB person ID.`} />
  }
  return <PersonDetail key={id} id={Number(id)} />
}

export default PersonDetailPage
