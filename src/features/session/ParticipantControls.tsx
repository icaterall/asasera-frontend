import {useEffect,useId,useRef,useState} from 'react'
import {Button,Field} from '@/design'
import type {ParticipantCommand,SessionSnapshot} from '@/shared/session'
import type {LiveWheelCommand,LiveWheelRound} from '@/shared/live-wheel'
import {wheelIsSpinning,type WheelState} from '@/shared/wheel'
import styles from './ParticipantControls.module.css'

export function ParticipantControls({participants,ar,disabled,onCommand}:{participants:SessionSnapshot['participants'];ar:boolean;disabled:boolean;onCommand:(id:string,command:ParticipantCommand)=>Promise<unknown>}){
 const t=(a:string,e:string)=>ar?a:e
 const [editing,setEditing]=useState<string|null>(null),[name,setName]=useState(''),[removing,setRemoving]=useState<SessionSnapshot['participants'][number]|null>(null)
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null)
 const [focusTarget,setFocusTarget]=useState<{id:string;action:string}|'summary'|null>(null)
 const root=useRef<HTMLDetailsElement>(null)
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),summary=useRef<HTMLElement>(null),nameForm=useRef<HTMLFormElement>(null),titleId=useId()
 const removingVisible=removing&&participants.some(p=>p.id===removing.id)?removing:null
 useEffect(()=>{if(removingVisible)dialog.current?.showModal();else{dialog.current?.close();if(removing)summary.current?.focus()}},[removingVisible,removing])
 useEffect(()=>{if(editing)nameForm.current?.querySelector('input')?.focus()},[editing])
 useEffect(()=>{if(!focusTarget||busy||editing||removing)return;const target=focusTarget==='summary'?summary.current:Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button[data-participant-action]')??[]).find(button=>button.dataset.participantId===focusTarget.id&&button.dataset.participantAction===focusTarget.action);(target??summary.current)?.focus();setFocusTarget(null)},[focusTarget,busy,editing,removing,participants])
 function close(){if(busy)return;if(removing)setFocusTarget({id:removing.id,action:'remove'});setRemoving(null);setError(null)}
 async function run(id:string,command:ParticipantCommand){
  setBusy(true);setError(null)
  try{await onCommand(id,command);setEditing(null);setRemoving(null);setFocusTarget(command.action==='remove'?'summary':{id,action:command.action})}
  catch(e){setError(e instanceof Error?e.message:t('تعذّر الحفظ. أعد المحاولة.','Could not save. Retry.'))}
  finally{setBusy(false)}
 }
 return <details ref={root} className={styles.controls}>
  <summary ref={summary}>{t(`إدارة المشاركين (${participants.length})`,`Manage participants (${participants.length})`)}</summary>
  <p className={styles.hint}>{t('الاستبعاد من العجلة لا يمنع الإجابة. لا تُعرض هذه الأدوات للطلاب أو شاشة العرض.','Excluding someone from the wheel does not stop their answers. These controls are private to the host.')}</p>
  {!participants.length?<p className={styles.hint}>{t('لم ينضم أحد بعد.','No one has joined yet.')}</p>:<ul className={styles.roster}>{participants.map(p=><li key={p.id}>
   <div className={styles.identity}><b dir="auto">{p.name}</b><span>{!p.connected&&t('غير متصل','Offline')}{!p.connected&&p.wheelExcluded?' · ':''}{p.wheelExcluded&&t('مستبعد من العجلة','Excluded from wheel')}</span></div>
   {editing===p.id?<form ref={nameForm} className={styles.rename} onSubmit={event=>{event.preventDefault();void run(p.id,{action:'rename',name:name.trim()})}}>
    <Field label={t('الاسم في الحصة','Display name')} value={name} onChange={event=>setName(event.target.value)} maxLength={40} required disabled={busy||disabled} dir="auto"/>
    <Button type="submit" disabled={busy||disabled||!name.trim()}>{t('احفظ الاسم','Save name')}</Button><Button variant="quiet" disabled={busy} onClick={()=>{setEditing(null);setFocusTarget({id:p.id,action:'rename'})}}>{t('إلغاء','Cancel')}</Button>
   </form>:<div className={styles.actions}>
    <Button data-participant-id={p.id} data-participant-action="rename" variant="secondary" disabled={disabled||busy} aria-label={t(`تغيير اسم ${p.name}`,`Rename ${p.name}`)} onClick={event=>{opener.current=event.currentTarget;setName(p.name);setEditing(p.id);setError(null)}}>{t('تغيير الاسم','Rename')}</Button>
    <Button data-participant-id={p.id} data-participant-action="exclude" variant="secondary" disabled={disabled||busy} aria-label={p.wheelExcluded?t(`إدراج ${p.name} في العجلة`,`Include ${p.name} in wheel`):t(`استبعاد ${p.name} من العجلة`,`Exclude ${p.name} from wheel`)} onClick={()=>void run(p.id,{action:'exclude',excluded:!p.wheelExcluded})}>{p.wheelExcluded?t('أدرج في العجلة','Include in wheel'):t('استبعد من العجلة','Exclude from wheel')}</Button>
    <Button data-participant-id={p.id} data-participant-action="remove" variant="danger" disabled={disabled||busy} aria-label={t(`إزالة ${p.name}`,`Remove ${p.name}`)} onClick={event=>{opener.current=event.currentTarget;setRemoving(p);setError(null)}}>{t('إزالة','Remove')}</Button>
   </div>}
  </li>)}</ul>}
  {error&&!removing&&<p className={styles.error} role="alert">{error}</p>}
  <dialog ref={dialog} className={styles.confirm} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();close()}}>
   <h2 id={titleId}>{t('إزالة ','Remove ')}<bdi>{removing?.name??''}</bdi>{t('؟','?')}</h2>
   <p>{t('سيُفصل المشارك ولن يتمكن من استئناف هذا المقعد. تبقى الإجابات المحفوظة والنقاط المكتسبة في التقرير.','This participant will be disconnected and cannot resume this seat. Saved answers and earned points stay in the report.')}</p>
   {error&&<p className={styles.error} role="alert">{error}</p>}
   <div className={styles.actions}><Button autoFocus variant="secondary" disabled={busy} onClick={close}>{t('إلغاء','Cancel')}</Button><Button variant="danger" loading={busy} disabled={disabled||busy} onClick={()=>{if(removing)void run(removing.id,{action:'remove'})}}>{t('إزالة المشارك','Remove participant')}</Button></div>
  </dialog>
 </details>
}

/** Host-only dispositions; the ordinary wheel renderer never receives private history. */
export function LiveWheelRoundControls({wheel,round,participants,ar,disabled,clock,onCommand}:{wheel:WheelState;round:LiveWheelRound;participants:SessionSnapshot['participants'];ar:boolean;disabled:boolean;clock:{now:()=>number};onCommand:(command:LiveWheelCommand)=>Promise<unknown>}){
 const t=(a:string,e:string)=>ar?a:e,summary=useRef<HTMLElement>(null)
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[,refresh]=useState(0)
 useEffect(()=>{const remaining=wheel.spin?wheel.spin.startedAt+wheel.spin.durationMs-clock.now():0;if(remaining<=0)return;const timer=setTimeout(()=>refresh(value=>value+1),remaining+20);return()=>clearTimeout(timer)},[wheel.spin,clock])
 const selected=wheel.source==='participants'&&wheel.spin?wheel.spin.entries[wheel.spin.winnerIndex]:null
 const passed=selected&&round.passedIds.includes(selected.id),blocked=disabled||busy||wheelIsSpinning(wheel,clock.now())
 async function run(command:LiveWheelCommand){setBusy(true);setError(null);try{await onCommand(command);summary.current?.focus()}catch(error){setError(error instanceof Error?error.message:t('تعذّر الحفظ. أعد المحاولة.','Could not save. Retry.'))}finally{setBusy(false)}}
 const labels={selected:t('اختير','Selected'),passed:t('تجاوز مؤقت لهذه الجولة','Passed for this round'),restored:t('أُعيد إلى الجولة','Restored to the round'),'new-round':t('بدأت جولة جديدة','New round started')}
 return <section className={`${styles.controls} ${styles.round}`} aria-label={t('اختيارات خاصة بالمعلّم','Private teacher selections')}>
  {selected&&<div className={styles.actions}><Button variant="secondary" disabled={blocked||!!passed} aria-label={t(`تجاوز ${selected.label} الآن`,`Pass ${selected.label} for now`)} onClick={()=>void run({action:'pass',participantId:selected.id,drawId:wheel.spin!.id})}>{t('تجاوز الآن','Pass for now')}</Button>{passed&&<span role="status">{t('تم التجاوز حتى الجولة التالية أو الإعادة الصريحة.','Passed until the next round or an explicit restore.')}</span>}</div>}
  <p className={styles.hint}>{t('ينتهي التجاوز عند الجولة التالية. يبقى الاستبعاد العادي حتى تعيد إدراج المشارك. لا تتغير الدرجات.','Passes end at the next round. Regular exclusions remain until you include the participant again. No scores change.')}</p>
  <Button variant="secondary" disabled={blocked||!round.history.some(event=>event.round===round.round&&event.action!=='new-round')} onClick={()=>void run({action:'reset'})}>{t('ابدأ الجولة التالية','Start next round')}</Button>
  {round.passedIds.length>0&&<ul className={styles.roster}>{round.passedIds.map(id=>{const participant=participants.find(person=>person.id===id);if(!participant)return null;return <li key={id}><bdi>{participant.name}</bdi><Button variant="secondary" disabled={blocked} aria-label={t(`إعادة ${participant.name} إلى هذه الجولة`,`Restore ${participant.name} to this round`)} onClick={()=>void run({action:'restore',participantId:id})}>{t('أعد إلى الجولة','Restore to round')}</Button></li>})}</ul>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  <details className={styles.history}><summary ref={summary}>{t(`سجل الاختيار · الجولة ${round.round}`,`Selection history · round ${round.round}`)}</summary>
   <p className={styles.hint}>{t('هذا السجل خاص بالمعلّم. التجاوز لا يعني إجابة خاطئة.','This history is private to the teacher. Passing is not an incorrect answer.')}{round.earlierEvents>0&&<> {t(`تُعرض أحدث ${round.history.length} أحداث؛ ${round.earlierEvents} أحداث أقدم محفوظة في سجل الأوامر.`,`Showing the latest ${round.history.length} events; ${round.earlierEvents} earlier events remain in saved command history.`)}</>}</p>
   {round.history.length?<ol className={styles.roster}>{[...round.history].reverse().map(event=><li key={event.id}><div className={styles.identity}><span>{t(`الجولة ${event.round}`,`Round ${event.round}`)} · {labels[event.action]}</span>{event.label&&<bdi>{event.label}</bdi>}<time dateTime={new Date(event.at).toISOString()}>{new Date(event.at).toLocaleTimeString(ar?'ar':'en')}</time></div></li>)}</ol>:<p className={styles.hint}>{t('لا اختيارات مسجلة بعد.','No selections recorded yet.')}</p>}
  </details>
 </section>
}
