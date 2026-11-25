import { Link } from 'react-router'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import HudPanel from '../common/HudPanel.jsx'
import TintedImage from '../common/TintedImage.jsx'
import { Badge } from '../common/Badge.jsx'

const VISIBLE_ROLES = 2

const REASON_LABEL = {
  dossier: 'Dossier match',
  term: 'Term match',
}

/** Cast Registry card: TMDB profile, name and the roles found in the archive. */
function PersonCard({ person }) {
  // Synthetic roles first, then by billing order.
  const roles = [...person.roles].sort((a, b) => Boolean(b.syntheticReason) - Boolean(a.syntheticReason) || a.order - b.order)
  const visible = roles.slice(0, VISIBLE_ROLES)
  const hiddenCount = roles.length - visible.length

  return (
    <Link to={`/person/${person.id}`} className="group block h-full">
      <HudPanel variant="data" glow cut={12} className="h-full" bodyClassName="flex h-full flex-col p-0">
        <div className="relative">
          <TintedImage src={imageUrl(person.profilePath, IMAGE_SIZES.profile)} alt={person.name} />
          {person.department && person.department !== 'Acting' && (
            <Badge className="absolute left-2 top-2 bg-void/85">{person.department}</Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col border-t border-line p-3">
          <h3 className="text-sm font-semibold text-ink group-hover:text-signal">{person.name}</h3>
          <ul className="mt-2 space-y-2">
            {visible.map((role) => (
              <li key={`${role.mediaType}-${role.mediaId}`} className="text-xs">
                <p className="text-ink">
                  <span className="text-ink-muted">as </span>
                  {role.character || 'Uncredited role'}
                </p>
                <p className="truncate text-ink-muted">
                  {role.title}
                  {role.year && ` (${role.year})`}
                </p>
                {role.syntheticReason && (
                  <p className={`label-mono mt-1 text-[0.6875rem] ${role.syntheticReason === 'dossier' ? 'text-pulse' : 'text-signal'}`}>
                    <span aria-hidden="true">◆ </span>
                    {REASON_LABEL[role.syntheticReason]}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <p className="label-mono mt-auto pt-3 text-[0.6875rem] text-ink-muted">
              +{hiddenCount} more {hiddenCount === 1 ? 'role' : 'roles'}
            </p>
          )}
        </div>
      </HudPanel>
    </Link>
  )
}

export default PersonCard
