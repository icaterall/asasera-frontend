import { useRef, useState, type FormEvent } from 'react'

import facesLarge from '@/assets/images/faces_success-1210.webp'
import facesMedium from '@/assets/images/faces_success-960.webp'
import facesSmall from '@/assets/images/faces_success-640.webp'
import facesFallback from '@/assets/images/faces_success.png'
import { cn } from '@/lib/cn'
import { useCopy } from '@/copy/useCopy'

import { Button } from '../ui/Button'
import { SectionShell } from '../ui/SectionShell'

type FieldName = 'name' | 'email' | 'org' | 'faculty'
type Errors = Partial<Record<FieldName, string>>

/**
 * One field, with a real `<label>` and its error wired through
 * `aria-describedby`.
 *
 * Placeholder-as-label is the usual shortcut here and it fails twice: the
 * label vanishes exactly when the user is typing and needs it, and several
 * screen readers do not announce a placeholder as a name at all. So every
 * field carries a visible label above it, and the error text is associated
 * rather than merely adjacent.
 */
function Field({
  name,
  label,
  type = 'text',
  inputMode,
  value,
  error,
  onChange,
  inputRef,
}: {
  name: FieldName
  label: string
  type?: string
  inputMode?: 'text' | 'email' | 'numeric'
  value: string
  error?: string
  onChange: (next: string) => void
  inputRef?: (el: HTMLInputElement | null) => void
}) {
  const id = `dept-${name}`
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-asas-ink">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          'min-h-12 w-full rounded-asas-sm border bg-asas-surface px-4 py-3 text-base text-asas-ink',
          error ? 'border-asas-danger' : 'border-asas-line',
        )}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-asas-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Departments() {
  const { t } = useCopy()
  const [values, setValues] = useState({ name: '', email: '', org: '', faculty: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({})

  function validate(): Errors {
    const next: Errors = {}
    if (!values.name.trim()) next.name = t('dept.form.errName')
    /* Deliberately permissive: the shape of an address, not a spec-complete regex. */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = t('dept.form.errEmail')
    if (!values.org.trim()) next.org = t('dept.form.errOrg')
    if (!(Number(values.faculty) > 0)) next.faculty = t('dept.form.errFaculty')
    return next
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setErrors(found)

    /*
      Move focus to the first field that failed. Without this, a keyboard or
      screen-reader user submits and is left at the button with no indication
      that anything above it changed.
    */
    const firstBad = (['name', 'email', 'org', 'faculty'] as const).find((key) => found[key])
    if (firstBad) {
      refs.current[firstBad]?.focus()
      return
    }

    setSent(true)
  }

  return (
    <SectionShell id="departments" tone="tint" labelledBy="departments-title">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          {/* Gradient use 2 of 2: a short rule opening the buying section. */}
          <span aria-hidden="true" className="mb-6 block h-[3px] w-16 rounded-asas-sm bg-gradient-to-l from-asas-blue to-asas-teal" />

          <h2 id="departments-title" className="text-[1.75rem] font-bold text-asas-ink md:text-[2.25rem] lg:text-[2.5rem]">
            {t('dept.title')}
          </h2>

          <p className="mt-4 max-w-[52ch] text-lg text-asas-muted">{t('dept.body')}</p>

          <picture>
            <source media="(min-width: 1024px)" srcSet={facesLarge} type="image/webp" />
            <source media="(min-width: 640px)" srcSet={facesMedium} type="image/webp" />
            <source srcSet={facesSmall} type="image/webp" />
            <img
              src={facesFallback}
              alt={t('dept.imageAlt')}
              width={1210}
              height={999}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 34rem, 100vw"
              className="mt-8 aspect-[1210/999] w-full rounded-asas border border-asas-line object-cover"
            />
          </picture>
        </div>

        <div className="rounded-asas border border-asas-line bg-asas-surface p-6 md:p-8">
          <h3 className="mb-6 text-xl font-bold text-asas-ink">{t('dept.form.title')}</h3>

          {sent ? (
            <p role="status" className="rounded-asas bg-asas-accent-teal/12 px-4 py-4 text-base font-medium text-asas-accent-teal">
              {t('dept.form.sent')}
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
              <Field
                name="name"
                label={t('dept.form.name')}
                value={values.name}
                error={errors.name}
                inputRef={(el) => (refs.current.name = el)}
                onChange={(next) => setValues((v) => ({ ...v, name: next }))}
              />
              <Field
                name="email"
                label={t('dept.form.email')}
                type="email"
                inputMode="email"
                value={values.email}
                error={errors.email}
                inputRef={(el) => (refs.current.email = el)}
                onChange={(next) => setValues((v) => ({ ...v, email: next }))}
              />
              <Field
                name="org"
                label={t('dept.form.org')}
                value={values.org}
                error={errors.org}
                inputRef={(el) => (refs.current.org = el)}
                onChange={(next) => setValues((v) => ({ ...v, org: next }))}
              />
              <Field
                name="faculty"
                label={t('dept.form.faculty')}
                inputMode="numeric"
                value={values.faculty}
                error={errors.faculty}
                inputRef={(el) => (refs.current.faculty = el)}
                onChange={(next) => setValues((v) => ({ ...v, faculty: next }))}
              />

              <Button type="submit" variant="primary" size="lg" className="mt-1 w-full">
                {t('dept.cta')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
