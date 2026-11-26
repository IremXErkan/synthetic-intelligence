import { Link } from 'react-router'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import { formatDate, getReleaseDate, getTitle, getYear } from '../../utils/media.js'
import { ENTITY_TYPES, getEntityCode } from '../../data/entities.js'
import HudPanel from '../common/HudPanel.jsx'
import { DataList, DataRow } from '../common/DataRow.jsx'
import { Badge, ThreatBadge } from '../common/Badge.jsx'
import DossierPortrait from './DossierPortrait.jsx'

/**
 * The classified-file core of a dossier: name plate, portrait, the live TMDB
 * source record and the editorial classification. Used by /entity/:slug and
 * the intro. `titleAs` lets embedded previews avoid a second <h1>.
 */
function DossierFile({ entity, media, person, creditedCharacter, titleAs: Title = 'h1' }) {
  const code = getEntityCode(entity.slug)
  const mediaType = entity.media.type
  const portrait = person?.profile_path
    ? imageUrl(person.profile_path, IMAGE_SIZES.profileLarge)
    : imageUrl(media.backdrop_path, IMAGE_SIZES.backdropSmall)

  return (
    <>
      {/* Name plate */}
      <header className="relative mt-6 text-center">
        <div className="chamfer mx-auto inline-block bg-pulse/40 p-px [--cut:16px]">
          <div className="chamfer bg-panel px-8 py-4 [--cut:16px] sm:px-14">
            <p className="label-mono text-ink-muted">
              Classified dossier <span aria-hidden="true">//</span> {code}
            </p>
            <Title className="mt-1 text-4xl font-bold tracking-[0.08em] text-ink sm:text-5xl">{entity.name}</Title>
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
            <section aria-label="Source record, live from TMDB">
              <h2 className="label-mono mb-3 text-signal">Source record · Live from TMDB</h2>
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
                  value={creditedCharacter ? <Badge tone="signal">TMDB credits</Badge> : <Badge tone="pulse">Editorial</Badge>}
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
            <section aria-label="Archive analysis, editorial classification" className="border-t border-pulse/30 pt-6">
              <h2 className="label-mono mb-3 text-pulse">Archive analysis · Editorial classification</h2>
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
    </>
  )
}

export default DossierFile
