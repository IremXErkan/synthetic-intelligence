import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'

const SCOPES = [
  { value: 'movies', label: 'Movies' },
  { value: 'series', label: 'Series' },
]

/**
 * Global search: sends the query to the matching list page as ?q=…, where the
 * list page runs the actual TMDB search (state lives in the URL there).
 */
function ArchiveSearch() {
  const navigate = useNavigate()
  const inputId = useId()
  const scopeId = useId()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('movies')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/${scope}?q=${encodeURIComponent(trimmed)}` : `/${scope}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor={inputId} className="label-mono block text-ink-muted">
        Search the archive
      </label>
      {/* Input on its own row; scope + submit below, so it fits the narrow dashboard column. */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Blade Runner"
            className="w-full border border-line-strong bg-void py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-signal"
          />
        </div>
        <div className="flex gap-2">
        <label htmlFor={scopeId} className="sr-only">
          Search in
        </label>
        <select
          id={scopeId}
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="flex-1 border border-line-strong bg-void px-3 py-2 text-sm text-ink focus:border-signal"
        >
          {SCOPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="chamfer bg-signal px-4 py-2 text-sm font-semibold text-void transition-colors [--cut:8px] hover:bg-signal/85"
        >
          Search
        </button>
        </div>
      </div>
    </form>
  )
}

export default ArchiveSearch
