import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/design'
import { ApiError } from '@/lib/api'
import { community } from './api'
import styles from './Community.module.css'

export function QuestionComment({activityId,questionId,versionId,initial,onSaved}: {
  activityId:number; questionId:number; versionId:number; initial?:string; onSaved:()=>void
}) {
  const {i18n}=useTranslation(), ar=i18n.language.startsWith('ar'), t=(a:string,e:string)=>ar?a:e
  const [note,setNote]=useState(initial??'')
  const save=useMutation({mutationFn:()=>community.comment(activityId,questionId,versionId,note.trim()),onSuccess:onSaved})
  const remove=useMutation({mutationFn:()=>community.withdrawComment(activityId,questionId),onSuccess:onSaved})
  const busy=save.isPending||remove.isPending
  return <details className={styles.questionComment} open={initial ? true : undefined}>
    <summary><MessageSquare size={18} aria-hidden="true" />{t('ملاحظة على هذا السؤال','Comment on this question')}</summary>
    <form onSubmit={e=>{e.preventDefault();if(note.trim()&&!busy)save.mutate()}}>
      <p className={styles.muted}>{t('تصل ملاحظتك إلى صاحب النشاط فقط. لا تغيّر السؤال الأصلي.','Only the activity owner receives your comment. It does not change the original question.')}</p>
      <label className={styles.field}>{t('ملاحظتك','Your comment')}<textarea dir="auto" rows={3} maxLength={1000} required disabled={busy} value={note} onChange={e=>setNote(e.target.value)}/></label>
      <div className={styles.actions}><Button type="submit" variant="primary" disabled={!note.trim()||busy} loading={save.isPending}>{initial?t('تحديث الملاحظة','Update comment'):t('إرسال الملاحظة','Send comment')}</Button>{initial&&<Button disabled={busy} onClick={()=>remove.mutate()}>{t('سحب الملاحظة','Withdraw comment')}</Button>}</div>
      {(save.error||remove.error)&&<p role="alert">{save.error instanceof ApiError&&save.error.code==='version_changed'?t('تغيّر النشاط. حدّث الصفحة وراجع السؤال قبل إرسال ملاحظتك.','The activity changed. Refresh and review the question before commenting.'):t('تعذّر حفظ التغيير. حاول مرة أخرى.','Could not save your change. Please try again.')}</p>}
    </form>
  </details>
}
