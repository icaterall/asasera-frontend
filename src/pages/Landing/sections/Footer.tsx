import logoLightWebp from '@/assets/images/asas-logo-light.webp'
import logoLightPng from '@/assets/images/asas-logo-light.png'
import { useCopy } from '@/copy/useCopy'

const columns = [
  {
    heading: 'footer.about',
    links: ['footer.about.story', 'footer.about.method', 'footer.about.contact'],
  },
  {
    heading: 'footer.support',
    links: ['footer.support.help', 'footer.support.start', 'footer.support.status'],
  },
  {
    heading: 'footer.legal',
    links: ['footer.legal.privacy', 'footer.legal.terms', 'footer.legal.data'],
  },
] as const

/**
 * Small on purpose.
 *
 * Three columns of real links, the mark, and a copyright line. No newsletter
 * box and no social wall: neither has a job on a page sold to university
 * departments, and both would end the page on an ask rather than on the
 * product.
 */
export function Footer() {
  const { t } = useCopy()

  return (
    <footer className="bg-asas-inksurface px-5 py-14 text-white md:px-8 md:py-16">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[auto_1fr] md:gap-16">
        <div>
          <picture>
            <source srcSet={logoLightWebp} type="image/webp" />
            <img
              src={logoLightPng}
              alt={t('footer.brandAlt')}
              width={156}
              height={50}
              loading="lazy"
              decoding="async"
              className="h-[46px] w-auto"
            />
          </picture>
        </div>

        <nav aria-label={t('footer.about')} className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-3 text-sm font-bold text-white">{t(column.heading)}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    {/*
                      White at 72% over --ink clears 4.5:1 comfortably; the
                      hover goes to full white rather than to a brand colour,
                      which would not clear it on this ground.
                    */}
                    <a
                      href="#top"
                      className="rounded-asas-sm text-[0.95rem] text-white/72 transition-colors hover:text-white"
                    >
                      {t(link)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 max-w-[1200px] border-t border-white/12 pt-6">
        <p className="text-sm text-white/60">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
