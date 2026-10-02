// Load data once when a portal page opens: const { data, error, reload } = useLoad(portalApi.tasks)
import { useCallback, useEffect, useState } from 'react'

export function useLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    load()
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch(() => setError('Could not load this page. Please refresh.'))
  }, [load])

  useEffect(reload, [reload])
  return { data, error, reload }
}
