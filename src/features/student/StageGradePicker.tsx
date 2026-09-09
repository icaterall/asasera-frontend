import { useEffect, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingIndicator, Select } from '@/design'
import { reference } from '@/lib/api'
import { learningLabel, type LearningProfile } from '@/shared/student'
import styles from './Student.module.css'

export function StageGradePicker({ value, onChange, ar, disabled = false, onValidityChange }: {
  value: LearningProfile; onChange: (value: LearningProfile) => void; ar: boolean; disabled?: boolean
  onValidityChange?: (valid: boolean) => void
}) {
  const id = useId()
  const stages = useQuery({ queryKey: ['education-stages'], queryFn: ({ signal }) => reference.educationStages(signal),
    staleTime: 0, retry: false })
  const selectedId = value.educationStageId
  const selected = stages.data?.find(stage => stage.id === selectedId)
  const legacy = selectedId == null && value.stage !== 'general'
  const valid = selectedId == null || !!selected
  useEffect(() => { onValidityChange?.(valid) }, [valid, onValidityChange])
  const missing = selectedId != null && stages.isSuccess && !selected
  const general = ar ? 'تعلّم عام — بدون مرحلة محددة' : 'General learning — no specific stage'

  return <fieldset className={styles.picker} disabled={disabled}>
    <legend>{ar ? 'مرحلتك التعليمية' : 'Your learning stage'}</legend>
    <Select id={id} aria-label={ar ? 'المرحلة التعليمية' : 'Education stage'}
      aria-describedby={`${id}-hint`} aria-invalid={missing || undefined} dir={ar ? 'rtl' : 'ltr'}
      disabled={disabled || stages.isPending} searchable value={selectedId != null ? String(selectedId) : legacy ? 'legacy' : ''}
      onValueChange={next => {
        if (next === 'legacy') return
        onChange({ stage: 'general', grade: null, educationStageId: next ? Number(next) : null })
      }}>
      <option value="">{general}</option>
      {legacy && <option value="legacy">{learningLabel(value, ar ? 'ar' : 'en')} ({ar ? 'اختيارك الحالي' : 'current preference'})</option>}
      {selectedId != null && !selected && <option value={String(selectedId)} disabled>
        {stages.isPending ? (ar ? 'جارٍ تحميل مرحلتك…' : 'Loading your stage…') : (ar ? 'أعد تحميل المراحل أو اختر مرحلة أخرى' : 'Reload stages or choose another stage')}
      </option>}
      {stages.data?.map(stage => <option key={stage.id} value={String(stage.id)} data-search-text={`${stage.name_en} ${stage.name_ar}`}>
        {ar ? stage.name_ar : stage.name_en}
      </option>)}
    </Select>
    {stages.isPending && <LoadingIndicator layout="inline" label={ar ? 'جارٍ تحميل المراحل التعليمية…' : 'Loading education stages…'} />}
    {(stages.isError || missing) && <div role="alert">
      <p className={styles.error}>{missing
        ? (ar ? 'لم تعد مرحلتك السابقة متاحة. اختر مرحلة أخرى أو تعلّمًا عامًا.' : 'Your previous stage is no longer available. Choose another stage or general learning.')
        : (ar ? 'تعذّر تحميل المراحل التعليمية. حاول مجددًا أو اختر تعلّمًا عامًا.' : 'Education stages could not load. Try again or choose general learning.')}</p>
      <button type="button" className={styles.secondary} disabled={disabled || stages.isFetching} onClick={() => void stages.refetch()}>
        {ar ? 'إعادة المحاولة' : 'Try again'}
      </button>
    </div>}
    {stages.isSuccess && stages.data.length === 0 && <p role="status" className={styles.hint}>
      {ar ? 'لا توجد مراحل متاحة الآن. يمكنك المتابعة بتعلّم عام.' : 'No stages are available yet. You can continue with general learning.'}
    </p>}
    <p id={`${id}-hint`} className={styles.hint}>{ar ? 'يمكنك تغيير اختيارك لاحقًا. لا نطلب تاريخ ميلادك.' : 'You can change this later. We do not ask for your date of birth.'}</p>
  </fieldset>
}
