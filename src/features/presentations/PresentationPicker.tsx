import {useEffect,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {LoadingState} from '@/design'
import type {PresentationCompatibility,PresentationSelection} from '@/shared/presentation'
import {PRESENTATION_CONTEXTS} from '@/shared/presentation'
import styles from './Presentations.module.css'
import {presentationArtwork as artwork,presentationPurpose as purpose,presentationTones as tones} from './presentation-art'
const explanations:Record<string,[string,string]>={
 'native-pairs-required':['أضف أزواج مطابقة معتمدة لاستخدام هذا العرض.','Add reviewed matching pairs to use this format.'],
 'ambiguous-labels':['عدّل التسميات المتشابهة أو حدّد البدائل المقبولة بوضوح.','Clarify duplicate labels or explicitly review accepted alternatives.'],
 'native-groups-required':['أضف عناصر ومجموعات مع تصنيفها الصحيح.','Add items and groups with reviewed classifications.'],
 'native-sequence-required':['أضف خطوات مع ترتيبها الصحيح.','Add steps with their reviewed order.'],
 'native-blanks-required':['أضف نصًا بفراغات وإجابات مقبولة.','Add a passage with blanks and accepted answers.'],
 'native-vocabulary-required':['أضف مفردات معتمدة لاستخدام أنشطة الكلمات.','Add reviewed vocabulary for word activities.'],
 'authored-board-required':['احفظ لوحة الكلمات وراجعها قبل اعتماد النشاط.','Save and review a word board before approving the activity.'],
 'reference-response-required':['أضف إجابة مرجعية أو محتوى مناسبًا للمناقشة.','Add a reference response or suitable discussion content.'],
 'incompatible-content':['هذا السؤال من نوع لا يعرضه هذا القالب. غيّر نوعه أو اختر قالبًا آخر.','This question is a type this format cannot show. Change its type or choose another format.'],
 'participant-content-required':['هذا القالب يعمل على أسماء المشاركين، لا على الأسئلة.','This format works on participant names, not on questions.'],
 'unsupported-context':['هذا القالب لا يعمل في طريقة التقديم التي اخترتها في الخطوة 1.','This format does not run in the delivery mode you chose in step 1.'],
 'no-compatible-content':['لا يوجد في هذا النشاط سؤال واحد يمكن لهذا القالب عرضه.','Not one question in this activity can be shown by this format.'],
 'unknown-question':['أحد الأسئلة المختارة لم يعد موجودًا في النسخة المعتمدة. راجع المحتوى واعتمده من جديد.','A selected question is no longer in the approved version. Review the content and approve it again.'],
}
/*
 * THE SAME REASON CODES, SHORT ENOUGH FOR A CARD.
 *
 * `explanations` above tells a teacher what to go and do; this tells them, on
 * the card itself, what the format is waiting for — so "Needs compatible
 * content" stops being a dead end they have to select to understand.
 */
const needs:Record<string,[string,string]>={
 'native-pairs-required':['أزواج مطابقة','matching pairs'],
 'native-groups-required':['عناصر ومجموعات','items and groups'],
 'native-sequence-required':['خطوات مرتّبة','ordered steps'],
 'native-blanks-required':['نصًّا بفراغات','a passage with blanks'],
 'native-vocabulary-required':['مفردات معتمدة','reviewed vocabulary'],
 'authored-board-required':['لوحة كلمات محفوظة','a saved word board'],
 'reference-response-required':['إجابة مرجعية','a reference response'],
 'ambiguous-labels':['تسميات أوضح','clearer labels'],
 /* Which kinds a format accepts differs per format, so this names the shortfall
    without promising a particular kind the teacher would then go and author. */
 'incompatible-content':['أسئلة من نوع آخر','questions of a different type'],
 'participant-content-required':['أسماء المشاركين','participant names'],
}
const missing=(p:PresentationCompatibility)=>[...(p.reasons??[]),...p.excludedItemRefs.map(item=>item.reason)].find(reason=>needs[reason])
/*
 * WHAT THE BADGE SAYS, AND WHY IT IS NOT A BARE FRACTION.
 *
 * "4 of 5 compatible" is a number with no verb: it does not tell a teacher
 * that a question will be dropped, that the choice is theirs, or that a
 * checkbox is waiting below the grid. Each state now names its own next step.
 */
function statusLabel(p:PresentationCompatibility|undefined,total:number,ar:boolean){
 if(!p)return ar?'غير متاح الآن':'Not available yet'
 if(p.status==='unavailable'){
  const reason=missing(p)
  return reason?ar?`يحتاج ${needs[reason]![0]}`:`Needs ${needs[reason]![1]}`:ar?'يحتاج محتوى مختلفًا':'Needs different content'
 }
 if(p.status==='requires-subset')return ar?`${p.compatibleItemRefs.length} من ${total} · يحتاج موافقتك`:`${p.compatibleItemRefs.length} of ${total} · needs your approval`
 return ar?`جاهز · كل الأسئلة (${p.compatibleItemRefs.length})`:`Ready · all ${p.compatibleItemRefs.length} questions`
}
/* Ready first, then the ones asking a question, then the ones that cannot run.
   A format the server does not report cannot be launched either — it is already
   unselectable — so it ranks with them rather than sitting in the open grid
   under a status that never resolves. */
const rank=(p:PresentationCompatibility|undefined)=>p&&p.status==='ready'?0:p&&p.status==='requires-subset'?1:2
const choices=[['flashcards','بطاقات المراجعة','Flashcards'],['question-wheel','عجلة الأسئلة','Question wheel'],['random-cards','بطاقات عشوائية','Random cards'],['open-box','افتح الصندوق','Open the box'],['challenge-cards','بطاقات التحدي','Challenge cards'],['class-competition','مسابقة الصف','Class competition'],['match-up','المطابقة','Match up'],['memory','الذاكرة','Memory'],['group-sort','تصنيف المجموعات','Group sort'],['sequence','الترتيب','Sequence'],['sentence-completion','إكمال الجملة','Complete the sentence'],['word-builder','بناء الكلمات','Word builder'],['word-search','البحث عن الكلمات','Word search'],['crossword','الكلمات المتقاطعة','Crossword']] as const
type CompatibilityView={contentVersionId:number;questionCount:number;presentations:PresentationCompatibility[];items?:{questionId:number;number:number;prompt:string}[]}
export function PresentationPicker({activityId,context='practice',disabled,onChange,onReadyChange}:{activityId:number;context?:'live'|'practice';disabled:boolean;onChange:(selection:PresentationSelection|null)=>void;onReadyChange:(ready:boolean)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [selected,setSelected]=useState('quiz'),[subset,setSubset]=useState(false),[showBlocked,setShowBlocked]=useState(false)
 const data=useQuery({queryKey:['presentation-compatibility',activityId,context],queryFn:()=>api.get<CompatibilityView>(`/api/v1/presentations/activities/${activityId}/compatibility?context=${context}`)})
 const collective=useQuery({queryKey:['presentation-compatibility',activityId,'teacher-led'],enabled:context==='live',queryFn:()=>api.get<CompatibilityView>(`/api/v1/presentations/activities/${activityId}/compatibility?context=teacher-led`)})
 const isCollective=(id:string)=>context==='live'&&['flashcards','speaking-cards','memory'].includes(id)
 const source=isCollective(selected)?collective:data
 const deliveryContext=isCollective(selected)?'teacher-led':context
 const match=source.data?.presentations.find(p=>p.definitionId===selected)
 /*
  * Twelve equal cards make the teacher read all twelve. The ones that can run
  * come first; the ones that need other content are counted and folded away,
  * so the ordinary decision is between the three or four that are ready.
  */
 const entries=(choices as readonly (readonly [string,string,string])[])
  .filter(([id])=>(PRESENTATION_CONTEXTS[id as keyof typeof PRESENTATION_CONTEXTS].includes(context)||isCollective(id))&&(context==='live'||id!=='challenge-cards'))
  .map(([id,arabic,english],index)=>{const result=isCollective(id)?collective:data;return {id,arabic,english,index,p:result.data?.presentations.find(item=>item.definitionId===id),total:result.data?.questionCount??0}})
 const ordered=[...entries].sort((a,b)=>rank(a.p)-rank(b.p)||a.index-b.index)
 const runnable=ordered.filter(entry=>rank(entry.p)<2),blocked=ordered.filter(entry=>rank(entry.p)===2)
 const card=(entry:typeof entries[number])=>{const [arabicPurpose,englishPurpose]=purpose[entry.id]!
  return <label className={styles.choice} key={entry.id} data-tone={tones[entry.id]} data-state={entry.p?.status??'unavailable'} data-selected={selected===entry.id}>
   <input aria-label={ar?entry.arabic:entry.english} type="radio" name="presentation" checked={selected===entry.id} disabled={!entry.p} onChange={()=>{setSelected(entry.id);setSubset(false)}}/>
   <span className={styles.choiceArtwork}><img src={artwork[entry.id]} alt="" width="256" height="256" loading="lazy" draggable="false"/></span>
   <span className={styles.choiceCopy}><strong>{ar?entry.arabic:entry.english}</strong><small>{ar?arabicPurpose:englishPurpose}</small></span>
   {/* The delivery mode is chosen in step 1, so repeating it on every card says
       nothing. It is kept only where it CONTRADICTS that choice: a collective
       format is paced by the teacher and records no individual marks. */}
   <small className={styles.choiceMeta}>{statusLabel(entry.p,entry.total,ar)}{isCollective(entry.id)?ar?' · بقيادة المعلم':' · Teacher-led':''}</small>
   <span className={styles.choiceMark} aria-hidden="true"/>
  </label>}
 useEffect(()=>{
  const ready=selected==='quiz'||!!match&&(match.status==='ready'||match.status==='requires-subset'&&subset)
  onReadyChange(ready)
  if(!match||match.status==='unavailable'||(match.status==='requires-subset'&&!subset)){onChange(null);return}
  const semantics=match.definitionId==='flashcards'?'self-rated':match.definitionId==='speaking-cards'?'discussion':['memory','word-search','crossword'].includes(match.definitionId)?'practice':'scored'
  onChange({definitionId:match.definitionId,definitionVersion:1,adapterVersion:1,contentVersionId:match.contentVersionId,selectedQuestionIds:match.compatibleItemRefs.map(ref=>ref.questionId),config:{context:deliveryContext,semantics,noRepeat:true,revealPolicy:context==='live'?'host':semantics==='scored'?'after-answer':'on-request'}})
 },[match,selected,subset,context,deliveryContext,onChange,onReadyChange])
 /*
  * NOTHING IS DRAWN UNTIL COMPATIBILITY IS KNOWN.
  *
  * Sorting the grid means a card can change container when the answer arrives,
  * and a moved card is a NEW DOM node: anything holding the old one loses it,
  * including the browser's focus if a teacher had already tabbed onto it. One
  * short wait costs less than a grid that rearranges under the pointer, and it
  * also removes a fourth badge state nobody needed to read.
  */
 if(!data.data||(context==='live'&&!collective.data))return <fieldset className={styles.picker} disabled={disabled}><legend><span aria-hidden="true">2</span><span>{ar?'طريقة عرض المحتوى':'Present your content'}</span></legend>
  <p className={styles.pickerIntro}>{ar?'نتحقق من الأسئلة المعتمدة…':'Checking your approved questions…'}</p>
  {source.error?<p role="alert">{source.error.message}</p>:<LoadingState/>}
 </fieldset>
 return <fieldset className={styles.picker} disabled={disabled}><legend><span aria-hidden="true">2</span><span>{ar?'طريقة عرض المحتوى':'Present your content'}</span></legend>
  <p className={styles.pickerIntro}>{ar?'استخدم الأسئلة المعتمدة دون إنشاء محتوى جديد أو استهلاك الرصيد.':'Reuse approved questions without creating new content or using AI credit.'}</p>
  <div className={styles.choices}>
   <label className={styles.choice} data-tone="blue" data-state="ready" data-selected={selected==='quiz'}><input aria-label={ar?'الأسئلة بالترتيب':'Questions in order'} type="radio" name="presentation" checked={selected==='quiz'} onChange={()=>{setSelected('quiz');setSubset(false);onChange(null)}}/><span className={styles.choiceArtwork}><img src={artwork.quiz} alt="" width="256" height="256" draggable="false"/></span><span className={styles.choiceCopy}><strong>{ar?'الأسئلة بالترتيب':'Questions in order'}</strong><small>{ar?'قدّم الأسئلة المعتمدة واحدًا بعد الآخر.':'Present approved questions one after another.'}</small></span><small className={styles.choiceMeta}>{ar?`جاهز · كل الأسئلة (${data.data.questionCount})`:`Ready · all ${data.data.questionCount} questions`}</small><span className={styles.choiceMark} aria-hidden="true"/></label>
   {runnable.map(card)}
  </div>
  {blocked.length>0&&<details className={styles.blocked} open={showBlocked||blocked.some(entry=>entry.id===selected)} onToggle={event=>setShowBlocked(event.currentTarget.open)}>
   <summary>{ar?`قوالب تحتاج محتوى من نوع آخر (${blocked.length})`:`Formats that need other content (${blocked.length})`}</summary>
   <div className={styles.choices}>{blocked.map(card)}</div>
  </details>}
  {match?.status==='unavailable'&&<div role="status"><p>{ar?'لا يمكن بدء هذا العرض بالمحتوى الحالي.':'This format cannot start with the current content.'}</p><ul>{[...new Set([...(match.reasons??[]),...match.excludedItemRefs.map(item=>item.reason)])].filter(reason=>explanations[reason]).map(reason=><li key={reason}>{explanations[reason]![ar?0:1]}</li>)}</ul><a href={`/teacher/activities/${activityId}`}>{ar?'تعديل محتوى النشاط':'Edit activity content'}</a><p>{ar?'احفظ التعديلات واعتمدها، ثم عد لاختيار العرض. أو اختر الأسئلة بالترتيب.':'Save and approve your changes, then return to choose the format. Or choose Questions in order.'}</p></div>}
  {match?.status==='requires-subset'&&<div><p>{ar?'لن تظهر الأسئلة التالية في هذا العرض:':'These questions will not appear in this presentation:'}</p><ul>{match.excludedItemRefs.map(ref=>{const item=source.data?.items?.find(item=>item.questionId===ref.questionId);return <li key={ref.questionId}><span dir="auto">{item?.prompt??`${ar?'السؤال':'Question'} ${ref.questionId}`}</span><small> — {explanations[ref.reason]?.[ar?0:1]??(ar?'يحتاج نوعًا مختلفًا من المحتوى.':'Requires a different content shape.')}</small></li>})}</ul><a href={`/teacher/activities/${activityId}`}>{ar?'مراجعة محتوى النشاط':'Review activity content'}</a><label className={styles.consent}><input type="checkbox" checked={subset} onChange={e=>setSubset(e.target.checked)}/>{ar?`استخدم ${match.compatibleItemRefs.length} أسئلة متوافقة فقط؛ ${match.excludedItemRefs.length} غير متوافقة.`:`Use only ${match.compatibleItemRefs.length} compatible questions; ${match.excludedItemRefs.length} cannot use this presentation.`}</label></div>}
  {selected==='flashcards'&&context==='practice'&&<p>{ar?'مراجعة ذاتية: يقيّم الطالب تذكّره، وليست درجة اختبار.':'Self-study: learners rate their recall. These are not test marks.'}</p>}
  {isCollective(selected)&&<p>{ar?'نشاط جماعي يقوده المعلم. يتابع الطلاب الشاشة دون تسجيل درجات فردية أو مكافآت.':'A shared activity paced by the teacher. Learners follow the screen; no individual grades or bonus points are recorded.'}</p>}
  {source.error&&<p role="alert">{source.error.message}</p>}
 </fieldset>
}
