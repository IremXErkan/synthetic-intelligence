// TMDB API service layer. Components never call fetch directly; they use the
// functions exported here (usually through the useFetch hook).
// Docs: https://developer.themoviedb.org/docs/getting-started

import { DEFAULT_SORT, getThemeDiscoverParams } from '../config/themeKeywords.js'

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

// ---- Connection status ---------------------------------------------------
// Real link state shown in the status bar: 'connecting' until the first
// response, then 'online' or 'error'. A 404 for one missing record does not
// mean the link is down, so only auth, server and network failures set 'error'.
let connectionStatus = 'connecting'
const statusListeners = new Set()

function setConnectionStatus(next) {
  if (next === connectionStatus) return
  connectionStatus = next
  statusListeners.forEach((listener) => listener())
}

/** For useSyncExternalStore. */
export function subscribeConnectionStatus(listener) {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

export function getConnectionStatus() {
  return connectionStatus
}

async function fetchJson(url) {
  if (!READ_TOKEN) {
    setConnectionStatus('error')
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
    setConnectionStatus('error')
    throw new TmdbError('Network error: could not reach TMDB. Check your connection.')
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 || response.status >= 500) setConnectionStatus('error')
    // TMDB error bodies look like { success: false, status_code, status_message }.
    const message = body?.status_message || `TMDB request failed (HTTP ${response.status}).`
    throw new TmdbError(message, { status: response.status, code: body?.status_code ?? null })
  }
  setConnectionStatus('online')
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

/**
 * Theme archive query: GET /discover/{movie|tv} with the shared theme params
 * (keywords, vote threshold, excluded TV genres) from config/themeKeywords.js.
 * Same defaults → same URL → same cache entry for every caller.
 * @param {'movie'|'tv'} mediaType
 * @param {{ groups?: string[], includeLowVotes?: boolean, sort?: string, page?: number, filters?: object }} query
 */
export function discoverTheme(mediaType, { groups, includeLowVotes, sort = DEFAULT_SORT, page = 1, filters = {} } = {}, options) {
  const params = {
    ...LIST_PARAMS,
    ...getThemeDiscoverParams(mediaType, { groups, includeLowVotes }),
    sort_by: sort,
    page,
    ...filters,
  }
  return tmdbRequest(`/discover/${mediaType}`, params, options)
}

// Release-date field names differ between movies and TV (verified).
const RELEASE_FIELD = { movie: 'primary_release_date', tv: 'first_air_date' }

/**
 * Newest released theme titles: sorted by release date, never later than today
 * (the vote threshold already drops most unreleased titles; this makes it explicit).
 */
export function discoverLatestTheme(mediaType, options) {
  const field = RELEASE_FIELD[mediaType]
  const today = new Date().toISOString().slice(0, 10)
  return discoverTheme(mediaType, { sort: `${field}.desc`, filters: { [`${field}.lte`]: today } }, options)
}

export const MEDIA_TYPES = ['movie', 'tv']

/**
 * GET /movie/{id} or /tv/{id}. Basic fields used: title|name, release_date|first_air_date,
 * poster_path, backdrop_path, overview, vote_average. `append` adds append_to_response.
 */
export function getMediaDetails(mediaType, id, { append } = {}, options) {
  if (!MEDIA_TYPES.includes(mediaType)) {
    return Promise.reject(new TmdbError(`Unknown media type "${mediaType}".`, { status: 404 }))
  }
  return tmdbRequest(`/${mediaType}/${id}`, { append_to_response: append }, options)
}

/** GET /person/{id}. Fields used: name, profile_path, biography, known_for_department. */
export function getPerson(id, { append } = {}, options) {
  return tmdbRequest(`/person/${id}`, { append_to_response: append }, options)
}
