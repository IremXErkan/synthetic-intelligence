import MediaArchive from '../components/media/MediaArchive.jsx'

function SeriesPage() {
  return (
    <MediaArchive
      mediaType="tv"
      code="SEC-02"
      eyebrow="Cinematic Archive"
      title="Series"
      description="Television series about synthetic intelligence, pulled live from TMDB by theme keywords."
      unitLabel="series"
    />
  )
}

export default SeriesPage
