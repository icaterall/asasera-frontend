import heroBackdropPng from '@/assets/images/bk-hero.png'
import heroBackdropWebp from '@/assets/images/bk-hero.webp'
import { Bdi } from '@/components/Bdi'
import { useCopy } from '@/copy/useCopy'

import { Button } from '../ui/Button'
import { IconPlay } from '../ui/Icons'

/**
 * The in-class decision card — the hero's focal point, and one of the five
 * boxes on the page.
 *
 * `--warn` appears here and nowhere else. The motion is a slow shadow pulse
 * rather than a scale or a bounce: this is a card that interrupts a lecture,
 * and it should read as "this needs you" rather than as a notification toy.
 * `prefers-reduced-motion` swaps the pulse for a static ring in tokens.css,
 * so the emphasis survives without the movement.
 */
function DecisionCard() {
  const { t } = useCopy()

  return (
    <div className="asas-attention rounded-md border border-line bg-surface p-6 md:p-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-amber-500" />
        <span className="text-sm font-medium text-muted">{t('hero.decisionLabel')}</span>
      </div>

      {/*
        The count is a Latin numeral opening an Arabic sentence, so it is
        isolated: left bare, the digit and the word after it can resolve
        against each other and swap sides.
      */}
      <p className="mb-6 text-[1.5rem] leading-snug font-bold text-fg md:text-[1.875rem]">
        <Bdi dir="ltr">{t('hero.decisionCount')}</Bdi> {t('hero.decisionTitle')}
      </p>

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex min-h-12 items-center rounded-md bg-brand-500 px-6 font-bold text-white">
          {t('hero.decisionFix')}
        </span>
        <span className="inline-flex min-h-12 items-center rounded-md border border-line px-6 font-bold text-fg">
          {t('hero.decisionSkip')}
        </span>
      </div>
    </div>
  )
}

/**
 * The end-of-session line — the page's bidi stress test.
 *
 * Each English term is wrapped in its own isolate *including its
 * parentheses*. The brackets are neutral characters, so leaving them outside
 * the isolate lets the algorithm resolve them against the surrounding Arabic
 * and flip them onto the wrong side of the term.
 */
function SessionSummary() {
  const { t } = useCopy()

  return (
    <div className="rounded-md border border-line bg-surface p-6 md:p-7">
      <p className="mb-3 text-sm font-medium text-muted">{t('hero.summaryLabel')}</p>

      <p className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lead font-bold text-fg">
        <span className="text-accent-alt">
          <Bdi dir="ltr">{t('hero.summaryMasteredCount')}</Bdi> {t('hero.summaryMastered')}
        </span>
        <span aria-hidden="true" className="text-line">
          •
        </span>
        <span className="text-accent">
          <Bdi dir="ltr">{t('hero.summaryRecoveredCount')}</Bdi> {t('hero.summaryRecovered')}
        </span>
        <span aria-hidden="true" className="text-line">
          •
        </span>
        <span className="text-fg">
          <Bdi dir="ltr">{t('hero.summaryNeedYouCount')}</Bdi> {t('hero.summaryNeedYou')}
        </span>
      </p>

      <p className="text-[0.9375rem] leading-[1.8] text-muted">
        <span className="font-bold text-fg">{t('hero.summaryReasonLabel')} </span>
        {t('hero.summaryReasonBefore')}{' '}
        <Bdi dir="ltr" className="font-medium text-fg">
          ({t('hero.summaryReasonTermOne')})
        </Bdi>{' '}
        {t('hero.summaryReasonMiddle')}{' '}
        <Bdi dir="ltr" className="font-medium text-fg">
          ({t('hero.summaryReasonTermTwo')})
        </Bdi>
      </p>
    </div>
  )
}

export function Hero() {
  const { t } = useCopy()

  return (
    <section
      id="top"
      className="relative flex min-h-[88svh] items-center overflow-hidden bg-surface py-16 md:py-24"
    >
      {/*
        The supplied backdrop is off-brand purple, so it is desaturated and
        hue-shifted toward the brand blue, dropped to 14% opacity, and masked
        so it fades out well before the column holding the heading. It sits in
        the inline-end corner precisely so it never lies under text in either
        direction. Decorative, so hidden from assistive tech.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 hidden w-[560px] lg:block"
        style={{
          insetInlineEnd: '-6rem',
          maskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
        }}
      >
        <picture>
          <source srcSet={heroBackdropWebp} type="image/webp" />
          <img
            src={heroBackdropPng}
            alt=""
            width={800}
            height={529}
            className="w-full opacity-[0.14]"
            style={{ filter: 'grayscale(0.5) hue-rotate(-58deg) saturate(1.15)' }}
          />
        </picture>
      </div>

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
        <div>
          <h1 className="max-w-[16ch] text-hero font-bold text-fg">{t('hero.title')}</h1>

          <p className="mt-6 max-w-[46ch] text-lead text-muted">{t('hero.subtitle')}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="#join" variant="primary" size="lg">
              {t('hero.ctaPrimary')}
            </Button>
            <Button href="#how" variant="ghost" size="lg">
              <IconPlay size={20} />
              {t('hero.ctaSecondary')}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted">{t('hero.trust')}</p>
        </div>

        {/* Real DOM rather than a screenshot, so it stays crisp at any size. */}
        <div className="flex flex-col gap-4">
          <DecisionCard />
          <SessionSummary />
        </div>
      </div>
    </section>
  )
}
