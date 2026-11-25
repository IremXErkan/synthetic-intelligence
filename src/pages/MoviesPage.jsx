import MediaArchive from '../components/media/MediaArchive.jsx'

function MoviesPage() {
  return (
    <MediaArchive
      mediaType="movie"
      code="SEC-01"
      eyebrow="Cinematic Archive"
      title="Movies"
      description="Films about artificial minds, androids and robots, pulled live from TMDB by theme keywords."
      unitLabel="films"
    />
  )
}

export default MoviesPage
