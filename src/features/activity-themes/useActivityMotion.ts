import { useSyncExternalStore } from 'react'
const KEY = 'asasera.activity.motion'
const EVENT = 'asasera-activity-motion'
let fallback = true
function saved() { try { const value=localStorage.getItem(KEY); return value===null ? fallback : value!=='off' } catch { return fallback } }
function subscribe(callback: () => void) {
  const change = () => callback()
  window.addEventListener(EVENT, change)
  window.addEventListener('storage', change)
  return () => { window.removeEventListener(EVENT, change); window.removeEventListener('storage', change) }
}
function subscribeReduced(callback: () => void) {
  const query = matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
export function useActivityMotion() {
  const enabled = useSyncExternalStore(subscribe, saved, () => false)
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => true)
  return { enabled: enabled && !reduced, reduced, toggle: () => {
    fallback = !saved()
    try { localStorage.setItem(KEY, fallback ? 'on' : 'off') } catch { /* Preference still works in this tab. */ }
    window.dispatchEvent(new Event(EVENT))
  } }
}
