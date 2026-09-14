/**
 * An AI credit balance, shortened to fit the balance chip.
 *
 * FLOORS BEFORE IT FORMATS, and that order is the whole point. `Intl`'s compact
 * notation rounds half-expand on its own, so a balance of 999,999 prints as
 * "1M" — a spendable figure reading larger than it is, which would send a
 * teacher into a generation they cannot afford. Truncating to the displayed
 * precision first means the number handed to `Intl` is already exact at that
 * precision, so nothing can round up. 999,999 shows as 999K: understated by a
 * rounding error, which is the safe direction for money.
 *
 * The SUFFIX IS THE LOCALE'S, not ours. English gets K and M; Arabic gets ألف
 * and مليون, with the plural agreement Arabic actually needs — 5,000 is
 * "5 آلاف", not "5 ألف". Hard-coding Latin letters into Arabic would have got
 * that wrong in a way only an Arabic reader would notice.
 *
 * `numberingSystem: 'latn'` keeps the digits Western, which is this product's
 * deliberate choice throughout; `Intl.NumberFormat('ar')` would otherwise
 * render ٣٠٬١٢٢٬٩١٣.
 *
 * The exact figure is never lost: the chip keeps it in its accessible name and
 * its title, and the account dialog shows it in full.
 *
 *   30,122,913 -> 30.1M / 30.1 مليون      999,999 -> 999K / 999 ألف
 *        5,000 -> 5K    / 5 آلاف               842 -> 842
 */
export function compactCredits(value: number, locale = 'en'): string {
  const format = (amount: number) =>
    new Intl.NumberFormat(locale, {
      numberingSystem: 'latn',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount)

  if (!Number.isFinite(value) || value <= 0) return format(0)

  for (const unit of [1_000_000, 1_000]) {
    if (value >= unit) {
      const scaled = value / unit
      /* Three characters before the suffix, so the chip's width is stable:
         30.1M, 999K, 1.2K — never 1234.5K. */
      const truncated = scaled >= 100 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10
      return format(truncated * unit)
    }
  }
  return format(Math.floor(value))
}
