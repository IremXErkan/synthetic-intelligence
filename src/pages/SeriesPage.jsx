import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder route: The series archive is built on day 3.
function SeriesPage() {
  return (
    <PageShell code="SEC-02" eyebrow="Cinematic Archive" title="Series" description="Television series about synthetic intelligence, pulled live from TMDB.">
      <EmptyState tab="Status: offline" title="Module not online yet" message="The series archive is built on day 3." />
    </PageShell>
  )
}

export default SeriesPage
