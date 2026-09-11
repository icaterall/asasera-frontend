/**
 * Time zones for the assignment form (v5.1 C2).
 *
 * The SERVER resolves a wall-clock time in a named zone and the server clock decides whether an
 * assignment is open — nothing here is authoritative. This module exists so the teacher can see
 * the instant, and be asked the daylight-saving question, BEFORE submitting: the same wall time
 * can be skipped (clocks forward) or happen twice (clocks back), and neither the browser nor the
 * server may pick one silently. The server re-resolves every value and still answers 422
 * `nonexistent_local_time` / `ambiguous_local_time`, which the form surfaces as the same choice.
 *
 * The algorithm mirrors `resolveLocalTime` in the backend's delivery.service.ts: a zone changes
 * offset at most once a day, so the offsets in force one day either side of the wall time are the
 * only candidates, and a candidate is real when the instant reads back as the same wall time.
 */
export type ZoneResolution = 'earlier' | 'later'
export type LocalResolution =
  | {state:'empty'}
  | {state:'invalid'}
  | {state:'ok';instant:Date}
  | {state:'ambiguous'|'nonexistent';candidates:Date[]}

const WALL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

/** The wall clock of `instant` in `tz`, encoded as a UTC millisecond value. */
function wallClock(instant:number,tz:string){
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(new Date(instant))
  const n = (type:string) => Number(parts.find(p => p.type === type)?.value)
  return Date.UTC(n('year'),n('month')-1,n('day'),n('hour')%24,n('minute'),n('second'))
}

export function isValidZone(tz:string){
  try { new Intl.DateTimeFormat('en-US',{timeZone:tz}); return true } catch { return false }
}

/** `YYYY-MM-DDTHH:mm` in `tz`, optionally disambiguated. Never guesses: an edge case is reported. */
export function resolveLocal(local:string,tz:string,resolution?:ZoneResolution|''):LocalResolution{
  if (!local) return {state:'empty'}
  const m = WALL.exec(local)
  if (!m || !isValidZone(tz)) return {state:'invalid'}
  const [y,mo,d,h,mi] = m.slice(1,6).map(Number) as [number,number,number,number,number]
  const wall = Date.UTC(y,mo-1,d,h,mi), check = new Date(wall)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo-1 || check.getUTCDate() !== d || h > 23 || mi > 59) return {state:'invalid'}
  const offsets = [...new Set([wall-86400000,wall,wall+86400000].map(t => wallClock(t,tz)-t))]
  const instants = [...new Set(offsets.map(offset => wall-offset))].sort((a,b) => a-b)
  const real = instants.filter(instant => wallClock(instant,tz) === wall)
  if (real.length === 1) return {state:'ok',instant:new Date(real[0]!)}
  const candidates = (real.length ? real : instants).map(t => new Date(t))
  if (resolution) return {state:'ok',instant:resolution === 'earlier' ? candidates[0]! : candidates[candidates.length-1]!}
  return {state:real.length ? 'ambiguous' : 'nonexistent',candidates}
}

/** The device's own zone, which the form starts from — the teacher may change it. */
export function deviceZone(){
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return tz && isValidZone(tz) ? tz : 'UTC'
}

const COMMON = ['UTC','Asia/Muscat','Asia/Dubai','Asia/Riyadh','Asia/Qatar','Asia/Kuwait','Asia/Bahrain','Asia/Baghdad','Asia/Amman','Asia/Beirut','Asia/Jerusalem','Africa/Cairo','Africa/Khartoum','Africa/Casablanca','Asia/Karachi','Asia/Kolkata','Asia/Jakarta','Asia/Singapore','Asia/Tokyo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Istanbul','Europe/Moscow','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Australia/Sydney']

/** Every zone this browser knows, with the device zone first so the default is one tap away. */
export function zoneOptions(current:string){
  const all = (Intl as {supportedValuesOf?:(key:string) => string[]}).supportedValuesOf?.('timeZone') ?? COMMON
  const rest = all.filter(z => z !== current).sort((a,b) => a.localeCompare(b))
  return [current,...rest].filter(isValidZone)
}

/** A label that cannot be misread: the wall time with its zone and offset, plus the UTC instant. */
export function describeInstant(instant:Date,tz:string,locale:string){
  /* Components, not dateStyle/timeStyle: ECMA-402 forbids combining those with `timeZoneName`,
     and the offset is the whole point of this line. */
  const zoned = new Intl.DateTimeFormat(locale,{timeZone:tz,year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'shortOffset'}).format(instant)
  const utc = new Intl.DateTimeFormat(locale,{timeZone:'UTC',dateStyle:'medium',timeStyle:'short'}).format(instant)
  const device = new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(instant)
  return {zoned,utc,device,sameZone:deviceZone() === tz,iso:instant.toISOString()}
}
