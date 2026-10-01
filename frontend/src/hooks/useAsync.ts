import { useCallback, useEffect, useRef, useState } from 'react'

interface Result<T> {
  key: string
  data?: T
  error?: string
}

/**
 * Runs `load` whenever `key` changes (or `reload` is called) and ignores responses that arrive
 * after the key has moved on. `previous` keeps the last successful data while the next one loads.
 */
export function useAsync<T>(key: string, load: () => Promise<T>) {
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)
  const [previous, setPrevious] = useState<T | undefined>(undefined)
  const fullKey = `${key}#${attempt}`

  useEffect(() => {
    let ignore = false
    loadRef
      .current()
      .then(
        (data): Result<T> => ({ key: fullKey, data }),
        (e: Error): Result<T> => ({ key: fullKey, error: e.message }),
      )
      .then((r) => {
        if (ignore) return
        setResult(r)
        if (r.data !== undefined) setPrevious(r.data)
      })
    return () => {
      ignore = true
    }
  }, [fullKey])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const current = result?.key === fullKey ? result : null
  return {
    data: current?.data,
    previous,
    error: current?.error ?? null,
    loading: !current,
    reload,
  }
}
