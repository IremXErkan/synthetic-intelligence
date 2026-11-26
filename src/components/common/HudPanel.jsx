import { useId } from 'react'

// Frame (border) color, title-tab color and hover/focus glow per variant.
// data = TMDB (cyan), editorial = archive analysis (purple), alert = errors.
const VARIANTS = {
  data: {
    frame: 'bg-signal/35',
    tab: 'bg-signal/15 text-signal',
    bracket: 'text-signal/70',
    glow: 'group-hover:drop-shadow-[0_0_10px_rgb(34_211_238/0.45)] group-focus-visible:drop-shadow-[0_0_10px_rgb(34_211_238/0.45)]',
  },
  editorial: {
    frame: 'bg-pulse/40',
    tab: 'bg-pulse/15 text-pulse',
    bracket: 'text-pulse/70',
    glow: 'group-hover:drop-shadow-[0_0_10px_rgb(167_139_250/0.45)] group-focus-visible:drop-shadow-[0_0_10px_rgb(167_139_250/0.45)]',
  },
  alert: {
    frame: 'bg-threat-critical/45',
    tab: 'bg-threat-critical/15 text-threat-critical',
    bracket: 'text-threat-critical/70',
    glow: 'group-hover:drop-shadow-[0_0_10px_rgb(248_113_113/0.4)] group-focus-visible:drop-shadow-[0_0_10px_rgb(248_113_113/0.4)]',
  },
  // Holographic teal: the intro and the Archive Terminal.
  holo: {
    frame: 'bg-holo/45',
    tab: 'bg-holo/15 text-holo',
    bracket: 'text-holo/70',
    glow: 'group-hover:drop-shadow-[0_0_10px_rgb(94_234_212/0.4)] group-focus-visible:drop-shadow-[0_0_10px_rgb(94_234_212/0.4)]',
  },
  neutral: {
    frame: 'bg-line-strong',
    tab: 'bg-line text-ink-muted',
    bracket: 'text-ink-muted/60',
    glow: 'group-hover:drop-shadow-[0_0_10px_rgb(34_211_238/0.3)] group-focus-visible:drop-shadow-[0_0_10px_rgb(34_211_238/0.3)]',
  },
}

const BRACKET = 'pointer-events-none absolute size-3.5 border-current'

/**
 * Cut-corner HUD panel.
 *
 * - The border is an outer clipped layer (clip-path would cut a normal border).
 * - `glow`: drop-shadow appears only while an ancestor with the `group` class is
 *   hovered or keyboard-focused (e.g. a card <Link className="group">), never at rest.
 * - `title` renders a slanted tab above the panel as a real heading, and the
 *   panel becomes a <section> labelled by it.
 * - `fill`: the frame stretches to the panel's height (for fixed-height panels).
 * - `surface`: background classes of the body (e.g. translucent glass).
 */
function HudPanel({
  title,
  titleAs: Heading = 'h2',
  variant = 'neutral',
  brackets = false,
  glow = false,
  cut = 14,
  as,
  className = '',
  bodyClassName = 'p-5',
  fill = false,
  surface = 'bg-panel',
  children,
}) {
  const titleId = useId()
  const style = VARIANTS[variant] ?? VARIANTS.neutral
  const Tag = as ?? (title ? 'section' : 'div')

  return (
    <Tag
      aria-labelledby={title ? titleId : undefined}
      className={`relative ${glow ? `transition-[filter] duration-200 motion-reduce:transition-none ${style.glow}` : ''} ${className}`}
    >
      {title && (
        <Heading id={titleId} className={`chamfer-tab label-mono inline-block py-1 pl-3 pr-6 ${style.tab}`}>
          {title}
        </Heading>
      )}

      <div className={`chamfer p-px ${fill ? 'h-full' : ''} ${style.frame}`} style={{ '--cut': `${cut}px` }}>
        <div className={`chamfer relative h-full ${surface} ${bodyClassName}`} style={{ '--cut': `${cut}px` }}>
          {children}
        </div>
      </div>

      {brackets && (
        // Tab height is 24px (16px line + 8px padding), so top brackets move down with a title.
        <span aria-hidden="true" className={style.bracket}>
          <span className={`${BRACKET} left-2.5 border-l-2 border-t-2 ${title ? 'top-[34px]' : 'top-2.5'}`} />
          <span className={`${BRACKET} right-2.5 border-r-2 border-t-2 ${title ? 'top-[34px]' : 'top-2.5'}`} />
          <span className={`${BRACKET} bottom-2.5 left-2.5 border-b-2 border-l-2`} />
          <span className={`${BRACKET} bottom-2.5 right-2.5 border-b-2 border-r-2`} />
        </span>
      )}
    </Tag>
  )
}

export default HudPanel
