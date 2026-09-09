import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Star, ThumbsUp, Send } from 'lucide-react'
import { Button } from '@/design'
import { ApiError } from '@/lib/api'
import { community, type Feedback } from './api'
import styles from './Community.module.css'

export function FeedbackForm({ activityId, versionId, initial, onSaved }: { activityId: number; versionId: number; initial: Feedback | null; onSaved: () => void }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const fieldId = useId()
  const [rating, setRating] = useState(initial?.rating ?? 0), [recommend, setRecommend] = useState(initial?.recommend ?? false)
  const [strengths, setStrengths] = useState(initial?.strengths ?? ''), [suggestion, setSuggestion] = useState(initial?.suggestion ?? '')
  const save = useMutation({ mutationFn: () => community.save(activityId, { versionId, rating, recommend, strengths, suggestion }), onSuccess: onSaved })
  const withdraw = useMutation({ mutationFn: () => community.withdraw(activityId), onSuccess: onSaved })
  const busy = save.isPending || withdraw.isPending
  return <form className={styles.feedbackForm} onSubmit={e => { e.preventDefault(); if (rating && !busy) save.mutate() }}>
    <h2>{initial ? t('عدّل ملاحظاتك', 'Your feedback') : t('ساعد هذا النشاط على التحسّن', 'Help make this activity better')}</h2>
    <p className={styles.muted}>{t('ملاحظاتك وردّ المعلّم بينكما فقط. يظهر للزوار مجموع التقييمات والتوصيات.', 'Your comments and the creator’s reply stay between you. Visitors see only rating and recommendation totals.')}</p>
    {initial && initial.versionId !== versionId && <p className={styles.notice}>{t('حدّث المؤلّف النشاط منذ تقييمك. عاين النسخة الحالية قبل تحديث ملاحظاتك.', 'The creator updated this activity since your review. Preview the current version before updating your feedback.')}</p>}
    <fieldset disabled={busy} className={styles.formFields}>
      <legend>{t('تقييمك للنشاط', 'Your activity rating')}</legend>
      <div className={styles.rating}>{[1, 2, 3, 4, 5].map(value => <label key={value} data-selected={value <= rating}>
        <input type="radio" name={`${fieldId}-rating`} value={value} checked={value === rating} onChange={() => setRating(value)} required aria-label={t(`${value} من 5`, `${value} out of 5`)} />
        <Star size={24} aria-hidden="true" /><span>{value}</span>
      </label>)}</div>
      <label className={styles.check}><input type="checkbox" checked={recommend} onChange={e => setRecommend(e.target.checked)} /><ThumbsUp size={20} aria-hidden="true" />{t('أوصي بهذا النشاط للمعلّمين', 'I recommend this activity to other teachers')}</label>
      <label className={styles.field}>{t('ما الذي أعجبك؟ (اختياري)', 'What worked well? (optional)')}<textarea dir="auto" rows={3} maxLength={2000} value={strengths} onChange={e => setStrengths(e.target.value)} /></label>
      <label className={styles.field}>{t('ما الذي يمكن تحسينه؟ (اختياري)', 'What could be improved? (optional)')}<textarea dir="auto" rows={3} maxLength={2000} value={suggestion} onChange={e => setSuggestion(e.target.value)} placeholder={t('مثلًا: أضف مثالًا محلولًا قبل السؤال الثالث.', 'For example: Add a worked example before the third question.')} /></label>
    </fieldset>
    <div className={styles.actions}><Button type="submit" variant="primary" disabled={!rating || busy} loading={save.isPending}><Send size={18} aria-hidden="true" />{initial ? t('تحديث الملاحظات', 'Update feedback') : t('إرسال الملاحظات', 'Send feedback')}</Button>{initial && <Button variant="quiet" disabled={busy} loading={withdraw.isPending} onClick={() => withdraw.mutate()}>{t('سحب ملاحظاتي', 'Withdraw my feedback')}</Button>}</div>
    {(save.error || withdraw.error) && <p role="alert">{(save.error ?? withdraw.error)?.message}</p>}
    {save.error instanceof ApiError && save.error.code === 'version_changed' && <Button onClick={onSaved}>{t('تحديث النشاط للمراجعة', 'Refresh activity to review')}</Button>}
    {initial?.response && <div className={styles.reply}><h3>{t('ردّ صاحب النشاط', 'The creator’s reply')}</h3><p dir="auto">{initial.response}</p></div>}
  </form>
}
