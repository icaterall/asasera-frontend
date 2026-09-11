import { ArrowRight } from 'lucide-react'
import { useCopy } from '@/copy/useCopy'
import { experienceAr, experienceEn } from '../experience.copy'
import styles from '../Landing.module.css'

/**
 * One honest statement instead of a plan grid.
 *
 * During the pilot there is nothing to buy: teachers and students use the
 * platform for free and AI generation carries a small trial credit. A grid of
 * four plans with prices would advertise purchases the product cannot take,
 * so this section says what is true and points questions at the contact form.
 * The `pricing` id stays because the header and footer still anchor to it.
 */
export function Pricing() {
  const { lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn
  return <section id="pricing" className={styles.pricing} aria-labelledby="pricing-title"><div className={styles.container}>
    <div className={styles.sectionIntro}>
      <h2 id="pricing-title">{copy.pricingTitle}</h2>
      <p>{copy.pricingBody}</p>
    </div>
    <p className={styles.studentPromise}>{copy.pricingStudents} <a href="#departments" className={styles.textAction}>{copy.pricingContact}<ArrowRight size={16} className={styles.forward} /></a></p>
  </div></section>
}
