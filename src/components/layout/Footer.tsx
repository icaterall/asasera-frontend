import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { GithubIcon, LinkedinIcon, XIcon } from '@/components/ui/BrandIcons'
import { Container } from '@/components/ui/Container'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'

const LINK_COLUMNS = [
  {
    heading: 'footer.product.heading',
    links: [
      { labelKey: 'footer.product.features', to: '/#features' },
      { labelKey: 'footer.product.platform', to: '/#platform' },
      { labelKey: 'footer.product.pricing', to: '/#cta' },
      { labelKey: 'footer.product.changelog', to: '/#cta' },
    ],
  },
  {
    heading: 'footer.company.heading',
    links: [
      { labelKey: 'footer.company.about', to: '/about' },
      { labelKey: 'footer.company.careers', to: '/about' },
      { labelKey: 'footer.company.blog', to: '/about' },
      { labelKey: 'footer.company.contact', to: '/about' },
    ],
  },
  {
    heading: 'footer.resources.heading',
    links: [
      { labelKey: 'footer.resources.docs', to: '/#platform' },
      { labelKey: 'footer.resources.guides', to: '/#platform' },
      { labelKey: 'footer.resources.status', to: '/#platform' },
      { labelKey: 'footer.resources.support', to: '/about' },
    ],
  },
] as const

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com', Icon: GithubIcon },
  { label: 'X', href: 'https://x.com', Icon: XIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedinIcon },
] as const

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <Container className="relative pt-20 pb-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted text-pretty">
              {t('footer.blurb')}
            </p>

            <div className="mt-7 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-md border border-line text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-fg"
                >
                  <Icon className="size-[17px]" />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-bold tracking-[0.14em] text-faint uppercase">
                {t(column.heading)}
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      to={link.to}
                      className="text-[0.95rem] text-muted transition-colors duration-200 hover:text-fg"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-line pt-8 sm:flex-row">
          <p className="text-sm text-faint">
            © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
          </p>

          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-faint transition-colors hover:text-fg">
              {t('footer.privacy')}
            </Link>
            <Link to="/about" className="text-sm text-faint transition-colors hover:text-fg">
              {t('footer.terms')}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </Container>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 select-none text-center text-[clamp(4rem,17vw,15rem)] leading-none font-black text-fg/[0.035]"
      >
        {t('brand.name')}
      </div>
    </footer>
  )
}
