import { useState, useCallback } from 'react'

export function useFormState() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setSuccess(false)
  }, [])

  const handleSubmit = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await fn()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, success, setError, setSuccess, setLoading, reset, handleSubmit }
}
