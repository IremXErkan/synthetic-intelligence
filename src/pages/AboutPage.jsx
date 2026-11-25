import PageShell from '../components/layout/PageShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Placeholder: methodology and full TMDB attribution are written later.
function AboutPage() {
  return (
    <PageShell
      eyebrow="Archive Protocol"
      title="About"
      description="What this archive is, where its data comes from and how the editorial analysis is made."
    >
      <EmptyState title="Document being drafted" message="The methodology page is written after the archive pages are built." />
    </PageShell>
  )
}

export default AboutPage
