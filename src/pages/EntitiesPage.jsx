import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The dossier database is built on day 4.
function EntitiesPage() {
  return (
    <PageShell eyebrow="Intelligence Database" title="Entities" description="Classified dossiers on the most notable synthetic minds.">
      <EmptyState title="Module not online yet" message="The dossier database is built on day 4." />
    </PageShell>
  )
}

export default EntitiesPage
