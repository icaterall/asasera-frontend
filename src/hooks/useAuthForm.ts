import { useCallback, useRef, useState } from 'react'

import { ApiError } from '@/lib/api'

export type Validator<V> = (value: string, values: V) => string | null

/**
 * A small form controller for the five auth screens.
 *
 * The one behaviour worth naming: VALIDATION RUNS ON BLUR, NEVER ON KEYSTROKE.
 * Validating while someone types means telling them their email is invalid
 * when they have typed `a`, which is both true and useless — it turns the
 * whole form red while they are still filling it in, and people learn to
 * ignore the red. So a field is checked when it is left, and a field that
 * already shows an error clears it as soon as the person starts correcting it
 * (an error they are actively fixing is stale), then is rechecked on the next
 * blur.
 *
 * Server errors are merged into the SAME per-field map, so a 422 from the
 * backend lands under the input it belongs to rather than in a banner. The
 * backend sends `details.fields` keyed by the same names used here, which is
 * what makes that a lookup rather than a translation table.
 */
export function useAuthForm<V extends Record<string, string>>(config: {
  initial: V
  validators: Partial<Record<keyof V, Validator<V>>>
  /** Applied on blur — the email fields lowercase and trim through this. */
  normalizers?: Partial<Record<keyof V, (value: string) => string>>
  onSubmit: (values: V) => Promise<void>
  /** Maps a non-422 failure to one message shown above the submit button. */
  onError?: (error: unknown) => string
}) {
  const { initial, validators, normalizers, onSubmit, onError } = config

  const [values, setValues] = useState<V>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /*
   * Held in a ref, not state: it is read inside the submit handler and must
   * be the value at the moment of the click, not the value from the render
   * that created the closure. A double-click on a slow connection is the
   * common way to send two registrations for one person.
   */
  const inFlight = useRef(false)

  const setValue = useCallback((name: keyof V, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    // Not validation — the opposite. Clearing a stale message while it is
    // being fixed. The check itself happens on blur.
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }, [])

  const blur = useCallback(
    (name: keyof V) => {
      setValues((current) => {
        const normalize = normalizers?.[name]
        const normalized = normalize ? normalize(current[name]) : current[name]
        const next =
          normalized === current[name] ? current : { ...current, [name]: normalized }

        const validate = validators[name]
        const message = validate ? validate(normalized, next) : null
        setErrors((currentErrors) => {
          const updated = { ...currentErrors }
          if (message) updated[name] = message
          else delete updated[name]
          return updated
        })

        return next
      })
    },
    [normalizers, validators],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (inFlight.current) return

      /*
       * Normalise, then validate everything — including fields never visited,
       * which is the whole point. Someone can reach the submit button with an
       * untouched empty field by pressing Enter from the first input.
       */
      const normalized = { ...values } as V
      for (const key of Object.keys(normalized) as (keyof V)[]) {
        const normalize = normalizers?.[key]
        if (normalize) normalized[key] = normalize(normalized[key]) as V[keyof V]
      }

      const found: Partial<Record<keyof V, string>> = {}
      for (const key of Object.keys(normalized) as (keyof V)[]) {
        const validate = validators[key]
        const message = validate ? validate(normalized[key], normalized) : null
        if (message) found[key] = message
      }

      setValues(normalized)
      setFormError(null)

      if (Object.keys(found).length > 0) {
        setErrors(found)
        return
      }
      setErrors({})

      inFlight.current = true
      setSubmitting(true)
      try {
        await onSubmit(normalized)
      } catch (error) {
        /*
         * A 422 the server keyed by field goes back to those fields. Anything
         * else — 401, 409, a network failure — is not about one input, so it
         * goes above the button where it reads as being about the attempt.
         */
        const fields = error instanceof ApiError ? error.fields : {}
        const keyed = Object.entries(fields).filter(([key]) => key in normalized)

        if (keyed.length > 0) {
          setErrors(Object.fromEntries(keyed) as Partial<Record<keyof V, string>>)
        } else {
          setFormError(onError ? onError(error) : (error as Error).message)
        }
      } finally {
        inFlight.current = false
        setSubmitting(false)
      }
    },
    [values, validators, normalizers, onSubmit, onError],
  )

  /** Everything an input needs, so a screen cannot forget to wire one up. */
  const field = useCallback(
    (name: keyof V & string) => ({
      name,
      value: values[name],
      error: errors[name],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setValue(name, event.target.value),
      onBlur: () => blur(name),
    }),
    [values, errors, setValue, blur],
  )

  return {
    values,
    errors,
    formError,
    submitting,
    field,
    setValue,
    setFormError,
    handleSubmit,
  }
}
