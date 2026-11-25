import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The comparison lab is built on day 5.
function LabPage() {
  return (
    <PageShell code="SEC-05" eyebrow="Comparison Lab" title="Lab" description="Compare two synthetic entities side by side.">
      <EmptyState tab="Status: offline" title="Module not online yet" message="The comparison lab is built on day 5." />
    </PageShell>
  )
}

export default LabPage
