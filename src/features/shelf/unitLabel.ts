export type CurriculumUnitLabel = { titleAr: string | null; titleEn: string | null; unitOrder: number }

/** A missing translation is not permission to switch the interface language. */
export function unitLabel(unit: CurriculumUnitLabel, language: string): string {
  if (language.startsWith('ar')) return unit.titleAr?.trim() || `الوحدة ${unit.unitOrder}`
  return unit.titleEn?.trim() || `Unit ${unit.unitOrder}`
}
