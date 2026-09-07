import { useAuthCopy } from '@/copy/useAuthCopy'

/**
 * The primary action, and the only place a form is submitted from.
 *
 * Disabled while in flight, with the spinner INSIDE the button rather than
 * over the page: the button is what was pressed, so it is where the feedback
 * belongs, and a person's eye is already there. A page-level overlay would
 * also hide the form they might want to re-read.
 *
 * The label stays visible next to the spinner rather than being replaced by
 * it, so the button does not change width mid-submit and shift the layout
 * under the cursor.
 */
export function SubmitButton({
  label,
  submitting,
  /* Defaults to the generic "Working…". The address step passes "Checking…",
     because that button does something specific and worth naming. */
  busyLabel,
}: {
  label: string
  submitting: boolean
  busyLabel?: string
}) {
  const { c } = useAuthCopy()

  return (
    <button
      type="submit"
      disabled={submitting}
      // `aria-busy` is what tells assistive technology the control is working;
      // `disabled` alone reads only as "unavailable", which is a different
      // thing and does not explain why.
      aria-busy={submitting}
      className="auth-button auth-button--primary"
    >
      {submitting ? (
        <span
          // `rounded-full` on a circle, which is what the radius rule reserves
          // it for — this is not a pill button.
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      <span>{submitting ? (busyLabel ?? c.common.submitting) : label}</span>
    </button>
  )
}
