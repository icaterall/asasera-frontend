import { useCopy } from '@/copy/useCopy'
import { experienceAr, experienceEn } from '../experience.copy'

import { Card } from '../ui/Card'
import { SectionShell } from '../ui/SectionShell'

const primary = ['mcq', 'truefalse'] as const

/**
 * Two developed cards and one quiet line.
 *
 * The card budget is spent on the two question types the product generates
 * from a teacher's material — multiple choice and true/false. Ordering, drag
 * and interactive images are real and keep working, so they are named, but
 * as a single "also supported" row: five equal boxes buried the argument and
 * made the optional types look like prerequisites for a simple quiz.
 */
export function Types() {
  const { t, lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn

  return (
    <SectionShell id="types" tone="tint" title={copy.typesTitle} lead={copy.typesBody}>
      <div className="grid gap-5 md:grid-cols-2">
        {primary.map((key) => (
          <Card key={key} raised className="overflow-hidden p-6 md:p-7">
            <h3 className="mb-2 text-xl font-semibold text-fg">{t(`types.${key}.title` as 'types.mcq.title')}</h3>
            <p className="text-[0.9375rem] leading-[1.8] text-muted">{t(`types.${key}.body` as 'types.mcq.body')}</p>
          </Card>
        ))}
      </div>

      <p className="mt-10 border-t border-line pt-6 text-[0.9375rem] text-muted md:mt-12">{copy.typesAlso}</p>
    </SectionShell>
  )
}
