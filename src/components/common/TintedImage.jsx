import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * TMDB image with a cool tint that fades to full color on hover / keyboard focus.
 * Color returns when this image or an ancestor with the `group` class (e.g. a card
 * link) is hovered or focused. Shows a themed placeholder when TMDB has no image
 * (src is null) or the file fails to load — no substitute image is fetched.
 *
 * @param {{ src: string|null, alt: string, aspect?: string, className?: string }} props
 */
function TintedImage({ src, alt, aspect = 'aspect-[2/3]', className = '' }) {
  // Remember which src failed; a new src automatically gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState(null)
  const showPlaceholder = !src || failedSrc === src

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={`${alt} (no image available)`}
        className={`grid place-items-center bg-panel-raised text-ink-muted ${aspect} ${className}`}
      >
        <div className="flex flex-col items-center gap-2 px-2 text-center">
          <ImageOff className="size-6" aria-hidden="true" />
          <span className="label-mono text-[0.6875rem]">No visual on file</span>
        </div>
      </div>
    )
  }

  const reveal =
    'group-hover:grayscale-0 group-hover:saturate-100 group-focus-visible:grayscale-0 group-hover/tint:grayscale-0 group-hover/tint:saturate-100'
  const fadeTint = 'group-hover:opacity-0 group-focus-visible:opacity-0 group-hover/tint:opacity-0'

  return (
    <div className={`group/tint relative overflow-hidden bg-panel-raised ${aspect} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={`size-full object-cover grayscale-[55%] saturate-75 transition duration-300 motion-reduce:transition-none ${reveal}`}
      />
      {/* Cyan tint layer */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-signal/20 mix-blend-color transition-opacity duration-300 motion-reduce:transition-none ${fadeTint}`}
      />
    </div>
  )
}

export default TintedImage
