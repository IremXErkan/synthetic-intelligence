import { useState } from 'react'

/**
 * A "[CLASSIFIED]" passage inside editorial text that the reader can declassify
 * (click / Enter / Space). Used only for flavour details in editorial notes,
 * never to hide information the page depends on.
 */
export function Redacted({ children, revealed: revealedProp }) {
  const [revealedState, setRevealed] = useState(false)
  // `revealed` prop (optional) lets a preview, e.g. the intro, declassify it on cue.
  const revealed = revealedProp ?? revealedState
  const toggle = () => setRevealed((open) => !open)

  // A <span role="button"> instead of <button>: browsers lay buttons out as
  // inline-blocks, which breaks the sentence flow. Keyboard support is added by hand.
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggle()
        }
      }}
      aria-expanded={revealed}
      className={`cursor-pointer rounded-sm px-0.5 transition-colors ${
        revealed
          ? 'text-ink underline decoration-threat-high/60 decoration-dotted underline-offset-4'
          : 'font-mono text-sm tracking-wider text-threat-high hover:bg-threat-high/10'
      }`}
    >
      {revealed ? (
        children
      ) : (
        <>
          <span aria-hidden="true">[CLASSIFIED]</span>
          <span className="sr-only">Classified passage, press to declassify</span>
        </>
      )}
    </span>
  )
}

/** Renders editorial text where [[…]] marks a redacted passage. */
export function RedactedText({ text, revealed }) {
  const parts = text.split(/\[\[(.+?)\]\]/g) // odd indexes are the redacted passages
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <Redacted key={index} revealed={revealed}>
        {part}
      </Redacted>
    ) : (
      part
    ),
  )
}
