import {useState} from 'react'
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import {useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {Button,LoadingState, Select } from '@/design'
import styles from '@/features/shelf/Workspace.module.css'
interface Item{activityId:number;title:string;versionId:number;questions:{id:number;prompt:string;slots:{elementKey:string;wrongTargetKey:string|null;label:string}[]}[]}
export default function VerificationLinks(){
  const cache=useQueryClient()
  const links=useQuery({queryKey:['verification-links'],queryFn:()=>api.get<{links:{id:number;sourceQuestionId:number;elementKey:string;targetPrompt:string}[]}>('/api/v1/discovery/verification/links')})
  const remove=useMutation({mutationFn:(id:number)=>api.del(`/api/v1/discovery/verification/links/${id}`),onSuccess:()=>cache.invalidateQueries({queryKey:['verification-links']})})
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[search]=useSearchParams()
  const [source,setSource]=useState(Number(search.get('question')??0)),[slot,setSlot]=useState(''),[target,setTarget]=useState(0)
  const data=useQuery({queryKey:['verification-options'],queryFn:()=>api.get<{activities:Item[]}>('/api/v1/discovery/verification/options')})
  const questions=data.data?.activities.flatMap(a=>a.questions.map(q=>({...q,title:a.title,versionId:a.versionId})))??[]
  const q=questions.find(q=>q.id===source),selected=q?.slots.find(s=>JSON.stringify([s.elementKey,s.wrongTargetKey])===slot),destination=questions.find(q=>q.id===target)
  const save=useMutation({mutationFn:()=>{if(!selected||!destination)throw Error(ar?'اختر الخطأ وسؤال التحقق':'Choose a mistake and verification question');return api.post('/api/v1/discovery/verification/links',{sourceQuestionId:source,elementKey:selected.elementKey,wrongTargetKey:selected.wrongTargetKey,versionId:destination.versionId,questionId:target})},onSuccess:()=>cache.invalidateQueries({queryKey:['verification-links']})})
  return <section className={`asas ${styles.workspace}`}><header className={styles.heading}><div><h1>{ar?'أسئلة التحقق':'Verification questions'}</h1><p>{ar?'اربط خطأ متوقعًا بسؤال معتمد. يظهر الاقتراح على جهازك عندما يتكرر هذا الخطأ في الحصة.':'Link a possible mistake to an approved question. Your private controls can suggest it when that mistake recurs in class.'}</p></div></header>
    {data.isPending?<LoadingState/>:data.error?<p role="alert">{data.error.message}</p>:<div className={styles.linkForm}>
      <label>{ar?'السؤال الأصلي المعتمد':'Approved source question'}<Select value={source} onValueChange={e=>{setSource(Number(e));setSlot('');save.reset()}}><option value={0}>{ar?'اختر سؤالًا':'Choose a question'}</option>{questions.map(q=><option value={q.id} key={`${q.versionId}:${q.id}`}>{q.title} · {q.prompt}</option>)}</Select></label>
      <label>{ar?'الخطأ المتوقع':'Possible mistake'}<Select value={slot} onValueChange={e=>{setSlot(e);save.reset()}}><option value="">{ar?'اختر إجابة أو موضعًا خاطئًا':'Choose a wrong answer or placement'}</option>{q?.slots.map(s=><option key={JSON.stringify([s.elementKey,s.wrongTargetKey])} value={JSON.stringify([s.elementKey,s.wrongTargetKey])}>{s.label}</option>)}</Select></label>
      <label>{ar?'سؤال التحقق المعتمد':'Approved verification question'}<Select value={target} onValueChange={e=>{setTarget(Number(e));save.reset()}}><option value={0}>{ar?'اختر سؤالًا آخر':'Choose another question'}</option>{questions.filter(q=>q.id!==source).map(q=><option key={`${q.versionId}:${q.id}`} value={q.id}>{q.title} · {q.prompt}</option>)}</Select></label>
      <Button variant="primary" disabled={!selected||!target||save.isPending} onClick={()=>save.mutate()}>{ar?'احفظ الربط':'Save link'}</Button>
      {save.isSuccess&&<p role="status">{ar?'حُفظ الربط للحصص الجديدة.':'Link saved for new classes.'}</p>}{save.error&&<p role="alert">{save.error.message}</p>}
      {!questions.length&&<p>{ar?'انشر سؤالين أولًا لربط أحدهما بالآخر.':'Approve two questions first to link one to the other.'}</p>}
    </div>}
    <section className={styles.questionReport}><h2>{ar?'الروابط المحفوظة':'Saved links'}</h2>{links.isPending?<LoadingState/>:links.error?<p role="alert">{links.error.message}</p>:!links.data?.links.length?<p>{ar?'لا توجد روابط محفوظة.':'No saved links yet.'}</p>:links.data.links.map(l=><div key={l.id}><p>{questions.find(q=>q.id===l.sourceQuestionId)?.prompt??(ar?'سؤال سابق':'Earlier question')} · {l.elementKey}</p><p>{l.targetPrompt}</p><Button disabled={remove.isPending} onClick={()=>remove.mutate(l.id)}>{ar?'أزل الربط':'Remove link'}</Button></div>)}{remove.error&&<p role="alert">{remove.error.message}</p>}</section>
  </section>
}
