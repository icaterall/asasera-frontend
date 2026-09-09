export type LoadingVariant = 'list' | 'cards' | 'form' | 'dashboard' | 'editor'

/** Keep the route bundle's placeholder consistent with its pending data view. */
export function loadingVariantForPath(pathname: string): LoadingVariant {
  if (/^\/teacher\/activities\/\d+\/?$/.test(pathname)) return 'editor'
  if (/^\/(?:teacher(?:\/dashboard)?|student)\/?$/.test(pathname)) return 'dashboard'
  if (/^\/(?:signup(?:\/|$)|register(?:\/|$)|login\/?$|forgot\/?$|reset\/?$|account\/?$|student\/profile\/?$|complete-profile\/?$|teacher\/activities\/new\/?$)/.test(pathname)) return 'form'
  if (pathname === '/' || /^\/teacher\/discover\/?$/.test(pathname)) return 'cards'
  return 'list'
}
