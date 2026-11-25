import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The dossier database is built on day 4.
function EntitiesPage() {
  return (
    <PageShell code="SEC-04" eyebrow="Intelligence Database" title="Entities" description="Classified dossiers on the most notable synthetic minds.">
      <EmptyState tab="Status: offline" title="Module not online yet" message="The dossier database is built on day 4." />
    </PageShell>
  )
}

export default EntitiesPage
