import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThreatBadge } from './Badge.jsx'
import ErrorState from './ErrorState.jsx'
import { RedactedText } from './Redacted.jsx'

describe('ThreatBadge', () => {
  it('shows the level as text (not colour alone) with a screen-reader prefix', () => {
    render(<ThreatBadge level="critical" />)
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('Threat level:')).toHaveClass('sr-only')
  })

  it('renders nothing for an unknown level', () => {
    const { container } = render(<ThreatBadge level="apocalyptic" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('ErrorState', () => {
  it('shows the TMDB message and calls onRetry', () => {
    const onRetry = vi.fn()
    render(<ErrorState error={new Error('Invalid API key')} onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid API key')
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('RedactedText', () => {
  it('hides [[…]] passages until they are declassified with the keyboard', () => {
    render(
      <p>
        <RedactedText text="Its awakening [[shifts between timelines]]." />
      </p>,
    )
    const toggle = screen.getByRole('button', { name: /classified passage/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('shifts between timelines')).not.toBeInTheDocument()

    fireEvent.keyDown(toggle, { key: 'Enter' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('shifts between timelines')).toBeInTheDocument()

    fireEvent.keyDown(toggle, { key: ' ' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('leaves text without markers untouched', () => {
    render(<p>{<RedactedText text="Plain editorial note." />}</p>)
    expect(screen.getByText('Plain editorial note.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
