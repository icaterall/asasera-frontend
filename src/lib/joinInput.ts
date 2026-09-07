/** Accept the digit sets commonly entered on English and Arabic keyboards. */
export function normalizePin(value: string): string {
  return value.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0)).replace(/\D/g, '').slice(0, 6)
}

/** A teacher's assignment link must stay on this app and retain its capability. */
export function assignmentPath(value: string, origin: string): string | null {
  try {
    const url = new URL(value.trim(), origin)
    if (url.origin !== origin || url.username || url.password || !/^\/learn\/[0-9a-f-]{36}\/?$/i.test(url.pathname)) return null
    return url.pathname + url.search + url.hash
  } catch { return null }
}
