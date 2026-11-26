import { useMemo } from 'react'
import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/base.css' // React Flow's minimal structural CSS (no theme); all visuals are Tailwind
import { CATALOG_GRAPH } from '../../utils/networkGraph.js'
import { EntityNode, ProductionNode } from './NetworkNodes.jsx'

const NODE_TYPES = { entity: EntityNode, production: ProductionNode }
const EDGE_STYLES = {
  source: { stroke: '#22d3ee', strokeWidth: 1.5 },
  editorial: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '6 5' },
}

/**
 * The Intelligence Network graph (React Flow). Selection highlights a node and
 * its neighbours. With `interactive={false}` it is a static preview (intro).
 * Must be rendered inside a ReactFlowProvider.
 */
function NetworkCanvas({ mediaByKey, selectedId, onSelect, onOpen, interactive = true }) {
  const neighbours = useMemo(() => {
    if (!selectedId) return null
    const ids = new Set([selectedId])
    CATALOG_GRAPH.edges.forEach((edge) => {
      if (edge.source === selectedId) ids.add(edge.target)
      if (edge.target === selectedId) ids.add(edge.source)
    })
    return ids
  }, [selectedId])

  const nodes = useMemo(
    () =>
      CATALOG_GRAPH.nodes.map((node) => ({
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
      CATALOG_GRAPH.edges.map((edge) => {
        const connected = !selectedId || edge.source === selectedId || edge.target === selectedId
        return { ...edge, type: 'straight', style: { ...EDGE_STYLES[edge.data.kind], opacity: connected ? 1 : 0.15 } }
      }),
    [selectedId],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      onNodeClick={interactive ? (_, node) => onSelect?.(node.id) : undefined}
      onNodeDoubleClick={interactive ? (_, node) => onOpen?.(node) : undefined}
      onPaneClick={interactive ? () => onSelect?.(null) : undefined}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.3}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      nodesFocusable={interactive}
      edgesFocusable={false}
      panOnDrag={interactive}
      zoomOnPinch={interactive}
      zoomOnScroll={false}
      zoomOnDoubleClick={false} // double-click opens a node's page instead
      preventScrolling={false}
    />
  )
}

export default NetworkCanvas
