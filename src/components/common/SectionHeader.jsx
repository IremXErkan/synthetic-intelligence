/** Heading for a section inside a page: mono eyebrow + title + optional action. */
function SectionHeader({ eyebrow, title, action, as: Heading = 'h2' }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
      <div>
        {eyebrow && <p className="label-mono text-signal">{eyebrow}</p>}
        <Heading className="mt-1 text-xl font-semibold text-ink">{title}</Heading>
      </div>
      {action}
    </div>
  )
}

export default SectionHeader
