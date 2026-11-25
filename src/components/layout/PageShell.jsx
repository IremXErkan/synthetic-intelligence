/**
 * Common page frame: mono eyebrow, h1 title, optional description and
 * header actions, then the page content.
 */
function PageShell({ eyebrow, title, description, actions, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <header className="relative border-b border-line py-10 sm:py-14">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="label-mono text-signal">{eyebrow}</p>}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
            {description && <p className="mt-3 text-ink-muted">{description}</p>}
          </div>
          {actions}
        </div>
      </header>
      <div className="py-8">{children}</div>
    </div>
  )
}

export default PageShell
