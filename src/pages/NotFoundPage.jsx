import { Link, useLocation } from 'react-router'
import { FileX2 } from 'lucide-react'

/** Themed 404 for unknown routes (and later for invalid detail IDs). */
function NotFoundPage({ title = 'File not found', message }) {
  const { pathname } = useLocation()

  return (
    <div className="mx-auto flex max-w-7xl justify-center px-4 py-20 sm:px-6">
      <section className="relative w-full max-w-xl rounded-lg border border-line bg-panel p-8 text-center">
        {/* Corner brackets */}
        <span aria-hidden="true" className="absolute left-3 top-3 size-4 border-l-2 border-t-2 border-threat-critical/60" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-threat-critical/60" />

        <FileX2 className="mx-auto size-10 text-threat-critical" aria-hidden="true" />
        <p className="label-mono mt-4 text-threat-critical">Error 404 · Record missing</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-3 text-ink-muted">
          {message || 'No archive record exists at this location. It may have been moved, redacted or never existed.'}
        </p>
        <p className="mt-4 break-all font-mono text-xs text-ink-muted">
          <span className="text-ink">REQUEST:</span> {pathname}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded border border-signal/50 px-4 py-2 text-sm font-medium text-signal transition-colors hover:bg-signal/10"
        >
          Return to Command Center
        </Link>
      </section>
    </div>
  )
}

export default NotFoundPage
