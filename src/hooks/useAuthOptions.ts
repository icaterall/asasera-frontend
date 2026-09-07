import { useEffect, useState } from 'react'
import { api, API_PREFIX } from '@/lib/api'

/** Provider availability is public configuration, never a credential. */
export function useAuthOptions() {
  const [google, setGoogle] = useState(false)
  useEffect(() => {
    let active = true
    void api.get<{google: boolean}>(`${API_PREFIX}/auth/options`, {anonymous: true})
      .then(options => { if (active) setGoogle(options.google === true) }).catch(() => {})
    return () => { active = false }
  }, [])
  return { google }
}
