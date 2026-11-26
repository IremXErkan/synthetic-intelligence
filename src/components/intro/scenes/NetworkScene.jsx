import { useEffect, useMemo, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { fetchCatalogProductions } from '../../../services/catalog.js'
import useFetch from '../../../hooks/useFetch.js'
import { entityNodeId, mediaByProductionNode } from '../../../utils/networkGraph.js'
import { ENTITIES } from '../../../data/entities.js'
import NetworkCanvas from '../../entity/NetworkCanvas.jsx'

/** Scene 8 — the real Intelligence Network, non-interactive; dossiers light up one after another. */
function NetworkScene({ reduceMotion }) {
  const productions = useFetch(fetchCatalogProductions)
  const mediaByKey = useMemo(() => mediaByProductionNode(productions.data), [productions.data])
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduceMotion) return undefined
    const id = setInterval(() => setStep((s) => s + 1), 650)
    return () => clearInterval(id)
  }, [reduceMotion])

  const selectedId = reduceMotion ? null : entityNodeId(ENTITIES[step % ENTITIES.length].slug)

  return (
    <div className="h-full min-h-56" inert aria-hidden="true">
      <ReactFlowProvider>
        <NetworkCanvas mediaByKey={mediaByKey} selectedId={selectedId} interactive={false} />
      </ReactFlowProvider>
    </div>
  )
}

export default NetworkScene
