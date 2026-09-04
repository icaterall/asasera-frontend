import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { GithubIcon, LinkedinIcon, XIcon } from '@/components/ui/BrandIcons'
import { Container } from '@/components/ui/Container'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'

/**
 * The address people write to.
 *
 * One constant, used by the two "get in touch" links and by the visible line
 * in the brand column, so the footer cannot end up offering two different
 * addresses. Deliberately NOT the same as the `privacy@asasera.com` published
 * on /privacy and /data-deletion: that one is the data-protection contact
 * named in the policy text and quoted to Meta, and it is answered under a
 * different obligation. Merging them would put deletion requests in the
 * support queue.
 */
const CONTACT_EMAIL = 'support@asasera.com'

/*
 * A footer link is either in-app or outbound, never both: `to` renders a
 * router <Link>, `href` renders a plain <a>, and `'href' in link` picks
 * between them below. The distinction matters for `mailto:` in particular —
 * react-router would treat it as a route and push a history entry instead of
 * opening a mail client.
 *
 * `as const` is load-bearing and not decoration: it keeps every `labelKey` a
 * literal type, which is what lets i18next reject a key that does not exist in
 * the bundles at compile time. Annotating this as `{ labelKey: string }[]`
 * widens them and silently gives that check away.
 */
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
      // Was a link to /about, which answered nobody. It is now the mailbox.
      { labelKey: 'footer.company.contact', href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
  {
    heading: 'footer.resources.heading',
    links: [
      { labelKey: 'footer.resources.docs', to: '/#platform' },
      { labelKey: 'footer.resources.guides', to: '/#platform' },
      { labelKey: 'footer.resources.status', to: '/#platform' },
      { labelKey: 'footer.resources.support', href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
] as const

const FOOTER_LINK_CLASS =
  'text-[0.95rem] text-white/70 transition-colors duration-200 hover:text-white'

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com', Icon: GithubIcon },
  { label: 'X', href: 'https://x.com', Icon: XIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedinIcon },
] as const

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative mt-32 overflow-hidden bg-ink-950 text-white">
      <Container className="relative pt-20 pb-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo onDark />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-white/70 text-pretty">
              {t('footer.blurb')}
            </p>

            {/*
              The address in full, not hidden behind the word "Contact".
              Someone scanning a footer for how to reach a company should not
              have to hover a link to find out, and an address they can select
              and copy is the one thing that works when their browser has no
              mail client wired up.

              `dir="ltr"` because the address is LTR text inside an RTL page:
              without it the trailing dot in ".com" is reordered to the wrong
              end. Left-aligned within its own box via `text-start` so it still
              follows the column in both directions.
            */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              dir="ltr"
              aria-label={`${t('footer.company.contact')}: ${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 text-start text-[0.95rem] text-white/70 transition-colors duration-200 hover:text-white"
            >
              <Mail aria-hidden="true" className="size-[17px] shrink-0" />
              {CONTACT_EMAIL}
            </a>

            <div className="mt-7 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-md border border-white/12 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-white"
                >
                  <Icon className="size-[17px]" />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-bold tracking-[0.14em] text-white/60 uppercase">
                {t(column.heading)}
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.labelKey}>
                    {'href' in link ? (
                      <a href={link.href} className={FOOTER_LINK_CLASS}>
                        {t(link.labelKey)}
                      </a>
                    ) : (
                      <Link to={link.to} className={FOOTER_LINK_CLASS}>
                        {t(link.labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/12 pt-8 sm:flex-row">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
          </p>

          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-white/60 transition-colors hover:text-white">
              {t('footer.privacy')}
            </Link>
            <Link to="/about" className="text-sm text-white/60 transition-colors hover:text-white">
              {t('footer.terms')}
            </Link>
            {/*
              The shared control is built for the page ground, where `glass`
              is a light panel. On black that reads as a lit blob, so the
              footer restates the ground and the inactive label. The active
              segment keeps the brand gradient — it is legible on both.
            */}
            <LanguageToggle className="!bg-white/8 !border-white/12 [&_button[aria-pressed='false']]:text-white/70" />
          </div>
        </div>
      </Container>

      {/*
        Oversized wordmark bleeding off the bottom edge.

        White, not `text-fg`. The footer is black in BOTH themes, so a
        foreground token is the wrong signal here: in light mode `--fg` is
        near-black, and near-black at 3.5% on a black ground is invisible —
        which is exactly how this disappeared. 6% white reads as a ghost
        without competing with the links above it.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 select-none text-center text-[clamp(4rem,17vw,15rem)] leading-none font-black text-white/[0.06]"
      >
        {t('brand.name')}
      </div>
    </footer>
  )
}
