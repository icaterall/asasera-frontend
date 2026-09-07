import { useCallback } from 'react'

import { useAuthCopy } from '@/copy/useAuthCopy'
import { ApiError } from '@/lib/api'

/**
 * Turns a thrown error into one sentence, in the active language.
 *
 * Keyed off the SERVER'S error `code`, not its English `message`. The message
 * is written for a log and is not translated; the code is a short, stable
 * vocabulary, so mapping it here is what lets an Arabic user read an Arabic
 * failure. An unrecognised code falls back to a generic line rather than
 * printing the server's English at someone — including, deliberately, on a
 * 500, where the server's text is the least useful thing we could show.
 */
export function useApiErrorMessage() {
  const { c } = useAuthCopy()

  return useCallback(
    (error: unknown): string => {
      if (!(error instanceof ApiError)) return c.errors.generic

      switch (error.code) {
        case 'network_error':
          return c.errors.network
        case 'invalid_credentials':
          return c.login.failed
        case 'link_requires_proof':
          return c.callback.accountExists
        case 'invalid_token':
          return c.reset.badToken
        /*
         * A resource that is not theirs answers 404, the same as one that
         * never existed — so the message says "not found" rather than
         * "forbidden", which would confirm the row exists.
         */
        case 'not_found':
          return c.errors.notFound
        default:
          break
      }

      /*
       * A 422 that reached here was NOT keyed to a field the form owns — the
       * form hook routes keyed ones to their inputs and only falls back to
       * this for the rest. Its message is a real validation sentence, so it
       * is worth showing even untranslated; anything else is not.
       */
      if (error.status === 422) return error.message

      return c.errors.generic
    },
    [c],
  )
}
