import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import useFetch from './useFetch.js'

// A promise we can resolve/reject from the test.
function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useFetch', () => {
  it('goes from loading to data', async () => {
    const fetcher = vi.fn(() => Promise.resolve({ title: 'Interstellar' }))
    const { result } = renderHook(() => useFetch(fetcher))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ title: 'Interstellar' })
    expect(result.current.error).toBeNull()
  })

  it('exposes errors and refetches on retry', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('Signal lost'))
      .mockResolvedValueOnce({ ok: true })
    const { result } = renderHook(() => useFetch(fetcher))

    await waitFor(() => expect(result.current.error?.message).toBe('Signal lost'))
    act(() => result.current.retry())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('aborts the old request and ignores its late response when the fetcher changes', async () => {
    const first = deferred()
    const second = deferred()
    const signals = []
    const fetchA = (signal) => {
      signals.push(signal)
      return first.promise
    }
    const fetchB = () => second.promise

    const { result, rerender } = renderHook(({ fetcher }) => useFetch(fetcher), { initialProps: { fetcher: fetchA } })
    rerender({ fetcher: fetchB })
    expect(signals[0].aborted).toBe(true)

    // The stale response arrives after the new request started: it must be ignored.
    await act(async () => first.resolve('stale'))
    expect(result.current.data).toBeNull()

    await act(async () => second.resolve('fresh'))
    expect(result.current.data).toBe('fresh')
  })

  it('does not report AbortError as an error', async () => {
    const fetcher = () => Promise.reject(new DOMException('Aborted', 'AbortError'))
    const { result, unmount } = renderHook(() => useFetch(fetcher))
    unmount()
    await Promise.resolve()
    expect(result.current.error).toBeNull()
  })
})
