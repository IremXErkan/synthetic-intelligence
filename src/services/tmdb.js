// TMDB API service layer. Components never call fetch directly; they use the
// functions exported here (usually through the useFetch hook).
// Docs: https://developer.themoviedb.org/docs/getting-started

const API_BASE_URL = 'https://api.themoviedb.org/3'
const READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN

// Applied to every request so all text comes back in English.
const DEFAULT_PARAMS = { language: 'en-US' }
// Applied to list endpoints (discover/search) that can return adult titles.
const LIST_PARAMS = { include_adult: 'false' }

const MAX_CACHE_ENTRIES = 200

/**
 * Error thrown for every failed TMDB call. `status` is the HTTP status
 * (0 for network failures) and `message` is safe to show in the UI.
 */
export class TmdbError extends Error {
  constructor(message, { status = 0, code = null } = {}) {
    super(message)
    this.name = 'TmdbError'
    this.status = status
    this.code = code
  }
}

// url -> Promise of parsed JSON. Storing the promise (not the result) also
// de-duplicates identical requests that are in flight at the same time.
const responseCache = new Map()

function buildUrl(path, params) {
  const url = new URL(API_BASE_URL + path)
  const merged = { ...DEFAULT_PARAMS, ...params }
  // Sort keys so the same params in a different order hit the same cache entry.
  Object.keys(merged)
    .sort()
    .forEach((key) => {
      const value = merged[key]
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  return url.toString()
}

async function fetchJson(url) {
  if (!READ_TOKEN) {
    throw new TmdbError('TMDB access token is missing. Set VITE_TMDB_READ_TOKEN in .env.')
  }

  let response
  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${READ_TOKEN}`,
      },
    })
  } catch {
    throw new TmdbError('Network error: could not reach TMDB. Check your connection.')
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    // TMDB error bodies look like { success: false, status_code, status_message }.
    const message = body?.status_message || `TMDB request failed (HTTP ${response.status}).`
    throw new TmdbError(message, { status: response.status, code: body?.status_code ?? null })
  }
  return body
}

// Rejects as soon as `signal` aborts. The underlying fetch keeps running so its
// cached result can be reused (e.g. by React StrictMode's second effect run).
function abortable(promise, signal) {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error) => {
        signal.removeEventListener('abort', onAbort)
        reject(error)
      },
    )
  })
}

/**
 * Low-level GET request with in-memory caching.
 * @param {string} path   API path, e.g. '/discover/movie'
 * @param {object} params Query params (undefined/null/'' values are dropped)
 * @param {{ signal?: AbortSignal }} options
 */
export function tmdbRequest(path, params = {}, { signal } = {}) {
  const url = buildUrl(path, params)

  let promise = responseCache.get(url)
  if (!promise) {
    promise = fetchJson(url)
    // Failed requests are not cached, so "Retry" really retries.
    promise.catch(() => responseCache.delete(url))
    responseCache.set(url, promise)

    if (responseCache.size > MAX_CACHE_ENTRIES) {
      // Map keeps insertion order: drop the oldest entry.
      responseCache.delete(responseCache.keys().next().value)
    }
  }
  return abortable(promise, signal)
}

// ---- Endpoint functions --------------------------------------------------
// Only endpoints whose responses have been checked against the live API are
// added here. More are added as each one is verified.

/** GET /discover/movie → { page, results[], total_pages, total_results } */
export function discoverMovies(params = {}, options) {
  return tmdbRequest('/discover/movie', { ...LIST_PARAMS, ...params }, options)
}
