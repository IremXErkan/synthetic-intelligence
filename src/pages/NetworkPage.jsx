import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/base.css' // React Flow's minimal structural CSS (no theme); all visuals are Tailwind
import { useReducedMotion } from 'framer-motion'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { fetchCatalogProductions } from '../services/catalog.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { buildNetworkGraph, entityNodeId, productionNodeId } from '../utils/networkGraph.js'
import { getTitle, getYear } from '../utils/media.js'
import { ENTITIES, ENTITY_TYPES, getEntityBySlug, getEntityCode } from '../data/entities.js'
import PageShell from '../components/layout/PageShell.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import { ThreatBadge } from '../components/common/Badge.jsx'
import { EntityNode, ProductionNode } from '../components/entity/NetworkNodes.jsx'

const NODE_TYPES = { entity: EntityNode, production: ProductionNode }
const EDGE_STYLES = {
  source: { stroke: '#22d3ee', strokeWidth: 1.5 },
  editorial: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '6 5' },
}
const BASE_GRAPH = buildNetworkGraph(ENTITIES)
const BUTTON_CLASS = 'chamfer grid size-9 place-items-center bg-line-strong text-ink [--cut:6px] hover:bg-signal/20 hover:text-signal'

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-muted">
      <li className="flex items-center gap-2">
        <svg width="28" height="6" aria-hidden="true">
          <line x1="0" y1="3" x2="28" y2="3" stroke="#22d3ee" strokeWidth="2" />
        </svg>
        Appears in (TMDB ID)
      </li>
      <li className="flex items-center gap-2">
        <svg width="28" height="6" aria-hidden="true">
          <line x1="0" y1="3" x2="28" y2="3" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 5" />
        </svg>
        Related dossier (editorial)
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-3 bg-pulse/40" /> Entity
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-3 border border-signal" /> Production (live from TMDB)
      </li>
    </ul>
  )
}

/** Details of the selected node, with a link to its page. */
function SelectionPanel({ selectedId, mediaByKey }) {
  const node = BASE_GRAPH.nodes.find((n) => n.id === selectedId)
  if (!node) {
    return <p className="text-sm text-ink-muted">Select an entity in the list or click a node to inspect it. Double-click a node to open its page.</p>
  }

  if (node.type === 'entity') {
    const { entity } = node.data
    const media = mediaByKey[productionNodeId(entity.media)]
    const related = entity.related.map(getEntityBySlug).filter(Boolean)
    return (
      <div className="space-y-3">
        <p className="label-mono text-[0.6875rem] text-ink-muted">{getEntityCode(entity.slug)}</p>
        <h3 className="text-xl font-bold text-pulse">{entity.name}</h3>
        <p className="text-sm text-ink">
          {ENTITY_TYPES[entity.entityType]} · <ThreatBadge level={entity.threatLevel} />
        </p>
        <p className="text-sm text-ink-muted">
          Appears in <span className="text-signal">{media ? `${getTitle(media)} (${getYear(media)})` : `TMDB #${entity.media.tmdbId}`}</span>
        </p>
        {related.length > 0 && (
          <p className="text-sm text-ink-muted">Related (editorial): {related.map((r) => r.name).join(', ')}</p>
        )}
        <Link to={`/entity/${entity.slug}`} className="label-mono inline-block text-signal hover:underline">
          Open dossier →
        </Link>
      </div>
    )
  }

  const { mediaType, tmdbId } = node.data
  const media = mediaByKey[node.id]
  const linked = ENTITIES.filter((e) => productionNodeId(e.media) === node.id)
  return (
    <div className="space-y-3">
      <p className="label-mono text-[0.6875rem] text-ink-muted">
        {mediaType === 'movie' ? 'Film' : 'Series'} · TMDB #{tmdbId}
      </p>
      <h3 className="text-xl font-bold text-signal">{media ? getTitle(media) : `TMDB #${tmdbId}`}</h3>
      {media?.overview && <p className="line-clamp-4 text-sm text-ink-muted">{media.overview}</p>}
      <p className="text-sm text-ink-muted">Dossiers: {linked.map((e) => e.name).join(', ')}</p>
      <Link to={`/media/${mediaType}/${tmdbId}`} className="label-mono inline-block text-signal hover:underline">
        Open production →
      </Link>
    </div>
  )
}

function NetworkGraph() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { setCenter, fitView, zoomIn, zoomOut } = useReactFlow()
  const productions = useFetch(fetchCatalogProductions)
  const [selectedId, setSelectedId] = useState(null)

  // TMDB production records keyed by production node id.
  const mediaByKey = useMemo(() => {
    const map = {}
    for (const entity of ENTITIES) {
      const media = productions.data?.[entity.slug]?.media
      if (media) map[productionNodeId(entity.media)] = media
    }
    return map
  }, [productions.data])

  // Selection highlights the node and its neighbours; everything else dims.
  const neighbours = useMemo(() => {
    if (!selectedId) return null
    const ids = new Set([selectedId])
    BASE_GRAPH.edges.forEach((edge) => {
      if (edge.source === selectedId) ids.add(edge.target)
      if (edge.target === selectedId) ids.add(edge.source)
    })
    return ids
  }, [selectedId])

  const nodes = useMemo(
    () =>
      BASE_GRAPH.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          media: node.type === 'production' ? mediaByKey[node.id] : undefined,
          active: node.id === selectedId,
          dimmed: Boolean(neighbours && !neighbours.has(node.id)),
        },
      })),
    [mediaByKey, selectedId, neighbours],
  )

  const edges = useMemo(
    () =>
      BASE_GRAPH.edges.map((edge) => {
        const connected = !selectedId || edge.source === selectedId || edge.target === selectedId
        return { ...edge, type: 'straight', style: { ...EDGE_STYLES[edge.data.kind], opacity: connected ? 1 : 0.15 } }
      }),
    [selectedId],
  )

  const focusNode = (id) => {
    setSelectedId(id)
    const node = BASE_GRAPH.nodes.find((n) => n.id === id)
    if (node) setCenter(node.position.x + 50, node.position.y + 20, { zoom: 1.1, duration: reduceMotion ? 0 : 500 })
  }

  const openNode = (node) => {
    if (node.type === 'entity') navigate(`/entity/${node.data.entity.slug}`)
    else navigate(`/media/${node.data.mediaType}/${node.data.tmdbId}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
      {/* Keyboard-accessible index of the graph */}
      <HudPanel variant="editorial" title="Entities" titleAs="h2" bodyClassName="p-3">
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-5 lg:grid-cols-1">
          {ENTITIES.map((entity) => {
            const id = entityNodeId(entity.slug)
            return (
              <li key={entity.slug}>
                <button
                  type="button"
                  aria-pressed={selectedId === id}
                  onClick={() => focusNode(id)}
                  className={`w-full px-2 py-1.5 text-left text-sm transition-colors ${
                    selectedId === id ? 'bg-pulse/20 text-pulse' : 'text-ink-muted hover:bg-line hover:text-ink'
                  }`}
                >
                  {entity.name}
                </button>
              </li>
            )
          })}
        </ul>
      </HudPanel>

      <div>
        <div
          className="bg-grid relative h-[60vh] min-h-[420px] overflow-hidden border border-line bg-void lg:h-[70vh]"
          role="figure"
          aria-label="Network graph of dossiers, their productions and editorial relations. Use the entity list for keyboard access."
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onNodeDoubleClick={(_, node) => openNode(node)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false} // double-click opens a node's page instead
            preventScrolling={false}
          />
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <button type="button" className={BUTTON_CLASS} onClick={() => zoomIn()} aria-label="Zoom in">
              <ZoomIn className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className={BUTTON_CLASS} onClick={() => zoomOut()} aria-label="Zoom out">
              <ZoomOut className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={BUTTON_CLASS}
              onClick={() => fitView({ padding: 0.15, duration: reduceMotion ? 0 : 400 })}
              aria-label="Fit whole network"
            >
              <Maximize2 className="size-4" aria-hidden="true" />
            </button>
          </div>
          {productions.loading && (
            <p className="label-mono absolute bottom-3 left-3 z-10 text-[0.6875rem] text-ink-muted" role="status">
              Loading production titles from TMDB…
            </p>
          )}
          {productions.error && (
            <p className="absolute bottom-3 left-3 z-10 text-xs text-threat-moderate" role="alert">
              Production titles unavailable.{' '}
              <button type="button" onClick={productions.retry} className="underline">
                Retry
              </button>
            </p>
          )}
        </div>
        <div className="mt-3">
          <Legend />
        </div>
      </div>

      <HudPanel variant="data" title="Selected node" titleAs="h2" bodyClassName="p-4" className="lg:self-start">
        <SelectionPanel selectedId={selectedId} mediaByKey={mediaByKey} />
      </HudPanel>
    </div>
  )
}

function NetworkPage() {
  useDocumentTitle('Intelligence Network')
  return (
    <PageShell
      code="SEC-06"
      eyebrow="Intelligence Network"
      title="Network"
      description="How the dossiers connect: solid lines link an entity to its production through its TMDB ID; dashed lines are the archive's editorial relations between entities."
    >
      <ReactFlowProvider>
        <NetworkGraph />
      </ReactFlowProvider>
    </PageShell>
  )
}

export default NetworkPage
