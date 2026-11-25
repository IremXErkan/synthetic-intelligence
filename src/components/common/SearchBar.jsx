import { useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import useDebounce from '../../hooks/useDebounce.js'

/**
 * Debounced search input. `value` is the committed query (from the URL);
 * `onSearch` is called ~350 ms after typing stops, or immediately on Enter.
 */
function SearchBar({ value, onSearch, label, placeholder, delay = 350 }) {
  const inputId = useId()
  const [text, setText] = useState(value)

  // Keep the input in sync when the URL changes from outside (back button,
  // home page search). Adjusting state during render is React's recommended
  // pattern for this; it avoids an extra effect pass.
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(value)
  }

  const debounced = useDebounce(text, delay)
  // Only react when the *debounced text* changes, not when `value` or
  // `onSearch` change, so an outside URL change is never overwritten.
  const lastDebounced = useRef(debounced)
  useEffect(() => {
    if (debounced === lastDebounced.current) return
    lastDebounced.current = debounced
    const trimmed = debounced.trim()
    if (trimmed !== value) onSearch(trimmed)
  }, [debounced, value, onSearch])

  const submit = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (trimmed !== value) onSearch(trimmed)
  }

  return (
    <form role="search" onSubmit={submit}>
      <label htmlFor={inputId} className="label-mono mb-2 block text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-line-strong bg-void py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-ink-muted/70 focus:border-signal [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            onClick={() => {
              setText('')
              onSearch('')
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBar
