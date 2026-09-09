import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bdi } from '@/components/Bdi'
import type { LandingCopyKey } from '@/copy/landing.ar'
import { useCopy } from '@/copy/useCopy'
import { experienceAr, experienceEn } from '../experience.copy'
import styles from '../Landing.module.css'

const plans = ['free', 'pro', 'dept', 'org'] as const

export function Pricing() {
  const { t, tList, lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn
  return <section id="pricing" className={styles.pricing} aria-labelledby="pricing-title"><div className={styles.container}>
    <h2 id="pricing-title">{t('pricing.title')}</h2>
    <ul className={styles.pricingGrid}>{plans.map(key => {
      const period = t(`pricing.${key}.period` as LandingCopyKey)
      const contact = key !== 'free'
      return <li key={key} className={styles.plan} data-featured={key === 'dept'}>
        <h3>{t(`pricing.${key}.name` as LandingCopyKey)}</h3>
        {key === 'dept' && <p className={styles.planTag}>{t('pricing.featured')}</p>}
        <p className={styles.planPrice}><Bdi dir="ltr">{t(`pricing.${key}.price` as LandingCopyKey)}</Bdi>{period && <span>{period}</span>}</p>
        <ul>{tList(`pricing.${key}.features` as LandingCopyKey).map(feature => <li key={feature}><Check size={16} /><span>{feature}</span></li>)}</ul>
        {contact ? <a href="#departments" className={`${styles.action} ${styles.blueAction}`}>{copy.plansContact}<ArrowRight size={16} className={styles.forward} /></a>
          : <Link to="/register" className={`${styles.action} ${styles.blueAction}`}>{copy.plansAction}<ArrowRight size={16} className={styles.forward} /></Link>}
      </li>
    })}</ul>
    <p className={styles.studentPromise}>{t('pricing.band')}</p>
  </div></section>
}
