import { Link } from 'react-router'
import { imageUrl, IMAGE_SIZES } from '../../utils/imageUrl.js'
import TintedImage from '../common/TintedImage.jsx'

/**
 * Top-billed cast of a production. Accepts both TMDB shapes:
 * movie credits (character) and TV aggregate_credits (roles[].character).
 */
function CastList({ cast, limit = 12 }) {
  const members = [...cast]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, limit)
    .map((member) => ({
      id: member.id,
      name: member.name,
      profilePath: member.profile_path,
      character: member.character ?? member.roles?.map((role) => role.character).filter(Boolean).join(' / '),
      episodes: member.total_episode_count,
    }))

  if (members.length === 0) {
    return <p className="text-sm text-ink-muted">TMDB lists no cast for this title.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {members.map((member) => (
        <li key={member.id}>
          <Link to={`/person/${member.id}`} className="group block">
            <TintedImage src={imageUrl(member.profilePath, IMAGE_SIZES.profile)} alt={member.name} className="border border-line" />
            <p className="mt-2 text-sm font-medium text-ink group-hover:text-signal">{member.name}</p>
            {member.character && <p className="line-clamp-2 text-xs text-ink-muted">as {member.character}</p>}
            {member.episodes > 0 && (
              <p className="font-mono text-[0.6875rem] text-ink-muted">
                {member.episodes} {member.episodes === 1 ? 'episode' : 'episodes'}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default CastList
