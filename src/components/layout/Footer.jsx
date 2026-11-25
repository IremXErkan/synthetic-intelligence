import { Link } from 'react-router'

// Official TMDB logo (Alt short, blue), linked from TMDB's logos & attribution page.
const TMDB_LOGO_URL =
  'https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg'

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-panel/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            <span className="font-semibold text-ink">Synthetic Intelligence</span> — an archive of fictional AI,
            androids and robots in film and television.
          </p>
          <p>
            Film, series and cast data is fetched live from TMDB.{' '}
            <span className="text-pulse">Archive Analysis</span> sections (entity types, capabilities, scores,
            threat levels) are the project&apos;s own editorial assessment.{' '}
            <Link to="/about" className="text-signal underline-offset-4 hover:underline">
              Methodology
            </Link>
          </p>
          <p className="label-mono text-[0.625rem]">SE 3355 Web Programming · Midterm Project</p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" aria-label="The Movie Database (TMDB)">
            <img src={TMDB_LOGO_URL} alt="TMDB logo" className="h-4 w-auto" width="185" height="16" loading="lazy" />
          </a>
          <p className="max-w-xs text-xs text-ink-muted md:text-right">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
