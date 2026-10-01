import { useState, useCallback } from 'react'
import type { ApiResponse } from '../services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook for API calls with loading and error states
 * @example
 * const { data: rooms, loading, error, execute } = useApi(roomsService.getAllRooms)
 * 
 * useEffect(() => {
 *   execute()
 * }, [execute])
 */
export const useApi = <T,>(apiFunction: () => Promise<ApiResponse<T>>) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const response = await apiFunction()
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null })
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error occurred',
        })
      }
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err.message || 'Network error',
      })
    }
  }, [apiFunction])

  return { ...state, execute }
}

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 * @example
 * const { execute: createRoom, loading, error } = useApiMutation(roomsService.createRoom)
 * 
 * const handleSubmit = async (data) => {
 *   await execute(data)
 * }
 */
export const useApiMutation = <T, P extends any[]>(
  mutationFunction: (...args: P) => Promise<ApiResponse<T>>
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true)
      setError(null)
      try {
        const response = await mutationFunction(...args)
        if (response.success) {
          return response.data
        } else {
          setError(response.error || 'Unknown error occurred')
          return null
        }
      } catch (err: any) {
        setError(err.message || 'Network error')
        return null
      } finally {
        setLoading(false)
      }
    },
    [mutationFunction]
  )

  return { execute, loading, error }
}
