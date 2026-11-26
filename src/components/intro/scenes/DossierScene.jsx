import { useCallback, useEffect, useState } from 'react'
import { fetchDossierRecord } from '../../../services/catalog.js'
import useFetch from '../../../hooks/useFetch.js'
import { findCreditedCharacter } from '../../../utils/dossier.js'
import { getEntityBySlug } from '../../../data/entities.js'
import DossierFile from '../../entity/DossierFile.jsx'
import { RedactedText } from '../../common/Redacted.jsx'
import ScaledPreview from './ScaledPreview.jsx'

const HAL = getEntityBySlug('hal-9000')

/**
 * Scene 6 — HAL 9000's real dossier file (live TMDB record + editorial layer),
 * with its [CLASSIFIED] addendum declassified on cue.
 */
function DossierScene({ reduceMotion }) {
  const fetcher = useCallback((signal) => fetchDossierRecord(HAL, signal), [])
  const record = useFetch(fetcher)
  const [declassified, setDeclassified] = useState(reduceMotion)

  useEffect(() => {
    if (reduceMotion) return undefined
    const id = setTimeout(() => setDeclassified(true), 3200)
    return () => clearTimeout(id)
  }, [reduceMotion])

  return (
    <div className="grid h-full content-center gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-center">
      {record.data && (
        <ScaledPreview scale={0.48} className="h-64 sm:h-80">
          <div className="max-w-5xl">
            <DossierFile
              entity={HAL}
              media={record.data.media}
              person={record.data.person}
              creditedCharacter={findCreditedCharacter(HAL, record.data.media)}
              titleAs="p"
            />
          </div>
        </ScaledPreview>
      )}
      <div className="border border-pulse/50 bg-void/40 p-4">
        <p className="label-mono text-pulse">Archive analysis · Addendum</p>
        <p className="mt-2 text-sm leading-relaxed text-ink" aria-hidden="true">
          <RedactedText text={HAL.addendum} revealed={declassified} />
        </p>
      </div>
    </div>
  )
}

export default DossierScene
