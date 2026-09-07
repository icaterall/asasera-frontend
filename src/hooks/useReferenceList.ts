import { useCallback, useEffect, useState } from 'react'

import type { ReferenceOption } from '@/lib/api'

/**
 * Loads one of the reference lists.
 *
 * GENERIC IN THE ROW TYPE, because the lists are no longer all the same shape.
 * `workplace_types` carries a `code` alongside the two names — the front end
 * maps each card to an icon and a colour and has to key that on something
 * stable — and pinning this hook to the bare `ReferenceOption` would have
 * widened those rows on the way through and dropped the one field the screen
 * needs. The constraint keeps the id-and-two-names floor every list shares.
 *
 * Aborts on unmount, so navigating away mid-fetch does not resolve into a
 * component that is gone; and exposes `reload` so a failed list gets a retry
 * button rather than forcing a page refresh — the person may already have
 * typed three other fields, and a reload would empty them.
 *
 * `reload` puts the pair back into the loading state ITSELF rather than
 * leaving the effect to do it on the way in. The effect's job is to talk to
 * the network; resetting the display is a consequence of the click, and doing
 * it there keeps the effect from setting state synchronously on every run
 * just to cover the retry case.
 */
export function useReferenceList<T extends ReferenceOption>(
  load: (signal?: AbortSignal) => Promise<T[]>,
) {
  const [options, setOptions] = useState<T[]>([])
  // One object, so a settled result can never leave `loading` and `failed`
  // both true for a render in between two separate setState calls.
  const [state, setState] = useState<{ loading: boolean; failed: boolean }>({
    loading: true,
    failed: false,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    load(controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return
        setOptions(rows)
        setState({ loading: false, failed: false })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error as Error)?.name === 'AbortError') return
        setState({ loading: false, failed: true })
      })

    return () => controller.abort()
    // `load` is a stable module-level function; `attempt` is what re-runs it.
  }, [load, attempt])

  const reload = useCallback(() => {
    setState({ loading: true, failed: false })
    setAttempt((n) => n + 1)
  }, [])

  return { options, loading: state.loading, failed: state.failed, reload }
}
