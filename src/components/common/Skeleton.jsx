// Themed loading placeholders. Shimmer is disabled for prefers-reduced-motion
// (see the `skeleton` utility in index.css).

export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded ${className}`} aria-hidden="true" />
}

/** Placeholder shaped like a media card (poster + two text lines). */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-line bg-panel p-2" aria-hidden="true">
      <SkeletonBlock className="aspect-[2/3] w-full" />
      <SkeletonBlock className="mt-3 h-4 w-4/5" />
      <SkeletonBlock className="mt-2 h-3 w-2/5" />
    </div>
  )
}

/** Grid of card placeholders with a screen-reader status message. */
export function SkeletonGrid({ count = 10, label = 'Loading records' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  )
}
