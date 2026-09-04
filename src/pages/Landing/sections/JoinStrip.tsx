import { useState, type FormEvent } from 'react'

import { useCopy } from '@/copy/useCopy'

import { Button } from '../ui/Button'
import { CodeInput } from '../ui/CodeInput'
import { CODE_LENGTH } from '../ui/codeFormat'

/**
 * The join strip.
 *
 * Placed directly under the hero and given the tinted ground so a student who
 * arrives mid-class — the one visitor on this page under time pressure —
 * finds it without reading anything above it. One row, not a card grid: this
 * is a single task, and surrounding it with sibling cards would make it one
 * option among several.
 *
 * Validation is client-side and deliberately quiet until submit. Validating
 * per keystroke would mark the field invalid after the first character, which
 * is hostile to someone copying six characters off a projector.
 */
export function JoinStrip() {
  const { t } = useCopy()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (code.length === 0) {
      setError(t('join.errorEmpty'))
      return
    }
    if (code.length < CODE_LENGTH) {
      setError(t('join.errorShort'))
      return
    }

    setError(undefined)
    /*
     * No session backend on this page yet: hand the code to the join route
     * and let the app own what happens next.
     */
    window.location.assign(`/join/${code}`)
  }

  return (
    <section id="join" aria-labelledby="join-title" className="scroll-mt-20 border-y border-asas-line bg-asas-tint px-5 py-8 md:px-8 md:py-10">
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-start md:gap-6"
      >
        <p id="join-title" className="text-lg font-bold text-asas-ink md:mt-9 md:shrink-0">
          {t('join.prompt')}
        </p>

        <div className="w-full md:max-w-[19rem]">
          <CodeInput
            id="join-code"
            value={code}
            onValueChange={(next) => {
              setCode(next)
              if (error) setError(undefined)
            }}
            label={t('join.inputLabel')}
            hint={t('join.inputHint')}
            error={error}
          />
        </div>

        <Button type="submit" variant="teal" size="lg" className="w-full md:mt-8 md:w-auto">
          {t('join.submit')}
        </Button>
      </form>
    </section>
  )
}
