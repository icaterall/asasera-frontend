import { Navigate, useLocation } from 'react-router-dom'

/**
 * Redirect to `to`, carrying the query string along.
 *
 * A bare `<Navigate to="/reset" />` drops `?token=…`, which for a reset link
 * is the entire message — the person would arrive at a form that immediately
 * tells them their link is incomplete, which is worse than the 404 it
 * replaces because it looks like the token expired.
 *
 * `replace` so the dead path does not sit in history: pressing Back from the
 * reset form should return to wherever they came from, not bounce through the
 * redirect again.
 */
export function KeepQueryRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation()
  return <Navigate to={`${to}${search}${hash}`} replace />
}
