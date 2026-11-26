import { fetchCastPreview } from '../../../services/cast.js'
import useFetch from '../../../hooks/useFetch.js'
import PersonCard from '../../person/PersonCard.jsx'
import ScaledPreview from './ScaledPreview.jsx'

/** Scene 5 — real PersonCards compiled from archive credits (same logic as /cast). */
function CastScene() {
  const people = useFetch(fetchCastPreview)

  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <p className="label-mono text-holo">Cast registry · compiled from archive credits</p>
      {people.data && (
        <ScaledPreview scale={0.55} className="h-64 sm:h-72">
          <ul className="grid grid-cols-5 gap-4">
            {people.data.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} />
              </li>
            ))}
          </ul>
        </ScaledPreview>
      )}
    </div>
  )
}

export default CastScene
