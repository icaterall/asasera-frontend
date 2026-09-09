import { useCallback, useRef, useState, type SetStateAction } from 'react'
import type { z } from 'zod'
import { clearDraft, readDraft, writeDraft } from './session-drafts'

/** Store at the input event, before React commits and before any network debounce. */
export function useSessionDraft<T>(key: string | null, initial: T, schema: z.ZodType<T>) {
  const [restored, setRestored] = useState(() => readDraft(key, schema))
  const [value, setValue] = useState<T>(restored ?? initial)
  const latest = useRef(value)
  const [storageError, setStorageError] = useState(false)
  const update = useCallback((next: SetStateAction<T>) => {
    const result = typeof next === 'function' ? (next as (prior: T) => T)(latest.current) : next
    latest.current = result
    setStorageError(!writeDraft(key, result))
    setValue(result)
  }, [key])
  const clear = useCallback((expected?: T) => {
    setStorageError(!clearDraft(key, expected))
    setRestored(null)
  }, [key])
  return { value, update, clear, restored: restored !== null, storageError }
}
