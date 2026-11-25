import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The cast registry is built on day 3.
function CastPage() {
  return (
    <PageShell code="SEC-03" eyebrow="Cast Registry" title="Cast" description="The actors and voice artists behind fictional machines.">
      <EmptyState tab="Status: offline" title="Module not online yet" message="The cast registry is built on day 3." />
    </PageShell>
  )
}

export default CastPage
