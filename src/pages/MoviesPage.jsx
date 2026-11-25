import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The movie archive is built on day 3.
function MoviesPage() {
  return (
    <PageShell code="SEC-01" eyebrow="Cinematic Archive" title="Movies" description="Films about artificial minds, androids and robots, pulled live from TMDB.">
      <EmptyState tab="Status: offline" title="Module not online yet" message="The movie archive is built on day 3." />
    </PageShell>
  )
}

export default MoviesPage
