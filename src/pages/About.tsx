import { useTranslation } from 'react-i18next'

import { CallToAction } from '@/components/sections/CallToAction'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * What this page used to be, and why none of it is left.
 *
 * It described a developer toolkit for bilingual interfaces rather than a
 * classroom tool, and carried a founding story that did not happen: a
 * consultancy origin, named client industries, a funding round, a headcount,
 * a country count and an infrastructure footprint. None of it exists —
 * Asasera has no users. Every one was deleted outright rather than reduced to
 * a vaguer version of the same claim, because a smaller false number is still
 * a false number, and this page will be read beside a real corporate filing.
 * The figures are not repeated here either: a comment quoting them puts them
 * back in the repository for the next person who greps it.
 *
 * The replacement says what is true for a product that has not launched. That
 * is a normal position to be in and a defensible one to state.
 *
 * Card budget: three, all of them in "what we believe". Everything else
 * separates on a hairline and a change of type size, which is also why the
 * milestone rail is gone rather than re-pointed at different dates.
 */

const BELIEFS = ['recovery', 'method', 'preparation'] as const

export default function About() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.about'))

  return (
    <>
      {/* 1 — what Asasera is. */}
      <section className="pt-36 pb-16 sm:pt-44">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center rounded-sm border border-line px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                {t('about.eyebrow')}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-hero font-extrabold text-balance">{t('about.title')}</h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 text-lead text-muted text-pretty">{t('about.lead')}</p>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-5 leading-relaxed text-muted text-pretty">{t('about.body')}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/*
        2 — why it exists.

        Two paragraphs under one rule. This was a candidate for two more cards
        and is deliberately not: the section is an argument, and boxing each
        half of an argument makes the reader weigh them separately instead of
        reading the second as the consequence of the first.
      */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl border-t border-line pt-12">
            <Reveal>
              <h2 className="text-title font-extrabold text-balance">{t('about.why.heading')}</h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-7 text-lead leading-relaxed text-pretty">{t('about.why.first')}</p>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-5 leading-relaxed text-muted text-pretty">{t('about.why.second')}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 3 — what we believe. The page's entire card budget. */}
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <h2 className="text-title font-extrabold text-balance">{t('about.beliefs.heading')}</h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {BELIEFS.map((key, index) => (
              <Reveal key={key} delay={index * 100}>
                <article className="h-full rounded-md border border-line bg-surface p-8">
                  {/*
                    A counter, not an icon. The old cards each carried a
                    lucide glyph in a tinted tile, which gave three unrelated
                    ideas the same decorative weight; the number just marks
                    reading order and stays out of the way. Western digits in
                    both languages, per the project rule.
                  */}
                  <span className="font-mono text-sm font-bold text-accent tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-balance">
                    {t(`about.beliefs.${key}.title`)}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted text-pretty">
                    {t(`about.beliefs.${key}.body`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 4 — where we are. Stated plainly; no card, so it reads as a note. */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl border-t border-line pt-12">
            <Reveal>
              <h2 className="text-title font-extrabold text-balance">
                {t('about.status.heading')}
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-7 text-lead leading-relaxed text-pretty">{t('about.status.body')}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 5 — one call to action. */}
      <CallToAction />
    </>
  )
}
