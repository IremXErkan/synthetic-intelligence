import { useCallback, useEffect, useState } from 'react'

/**
 * Runs an async fetcher and tracks its loading / error / data state.
 *
 * The fetcher receives an AbortSignal and must be memoized with useCallback:
 * a new fetcher identity is what triggers a new request.
 *
 *   const fetcher = useCallback((signal) => discoverMovies({ page }, { signal }), [page])
 *   const { data, error, loading, retry } = useFetch(fetcher)
 *
 * State is only written from the async callbacks, and "loading" is derived by
 * checking whether the stored result belongs to the current fetcher/attempt.
 * This avoids setState calls directly inside the effect body.
 */
export default function useFetch(fetcher) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ fetcher: null, attempt: -1, data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setResult({ fetcher, attempt, data, error: null })
        }
      },
      (error) => {
        // Aborts are expected (unmount, params changed) and are not errors.
        if (!controller.signal.aborted && error?.name !== 'AbortError') {
          setResult({ fetcher, attempt, data: null, error })
        }
      },
    )

    // Cleanup: late responses for an old fetcher are ignored (no race conditions,
    // no setState after unmount).
    return () => controller.abort()
  }, [fetcher, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const isCurrent = result.fetcher === fetcher && result.attempt === attempt
  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    loading: !isCurrent,
    retry,
  }
}
