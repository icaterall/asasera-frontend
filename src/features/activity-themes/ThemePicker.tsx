import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Palette, Trophy, X } from 'lucide-react'
import { activityThemes, getActivityTheme } from './catalog'
import { ActivityStage, MotionControl, ThemeThumbnail } from './ActivityStage'
import styles from './ActivityThemes.module.css'

export function ThemePicker({value,onApply,onClose,published=false}:{value:string;onApply:(theme:string)=>Promise<void>;onClose:()=>void;published?:boolean}) {
  const {i18n}=useTranslation(), ar=i18n.language.startsWith('ar'), id=useId()
  const [selected,setSelected]=useState(getActivityTheme(value).id), [busy,setBusy]=useState(false),[error,setError]=useState('')
  const [phase,setPhase]=useState<'lobby'|'question'|'podium'>('question'), [answer,setAnswer]=useState<number|null>(null)
  const dialog=useRef<HTMLDialogElement>(null),inFlight=useRef(false)
  const world=getActivityTheme(selected),t=(a:string,e:string)=>ar?a:e
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null
    const element=dialog.current
    element?.showModal()
    return()=>{element?.close();previous?.focus()}
  },[])
  async function apply(){
    if(inFlight.current)return
    inFlight.current=true;setBusy(true);setError('')
    try{await onApply(selected);onClose()}catch(e){setError(e instanceof Error?e.message:t('تعذّر حفظ المظهر. حاول مجددًا.','Could not save this theme. Try again.'));inFlight.current=false;setBusy(false)}
  }
  return <dialog ref={dialog} className={`asas ${styles.dialog}`} aria-labelledby={id} dir={ar?'rtl':'ltr'} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}>
    <header className={styles.dialogHeader}><div><Palette size={24} aria-hidden="true"/><h2 id={id}>{t('اختر عالم نشاطك','Choose your activity world')}</h2></div><button type="button" className={styles.close} aria-label={t('إغلاق المظاهر','Close themes')} disabled={busy} onClick={onClose}><X aria-hidden="true"/></button></header>
    <div className={styles.pickerBody}>
      <div className={styles.previewColumn}>
        <div className={styles.previewControls}><div role="group" aria-label={t('معاينة المظهر','Theme preview')}>
          {(['lobby','question','podium'] as const).map((step,i)=><button type="button" key={step} aria-pressed={phase===step} onClick={()=>{setPhase(step);setAnswer(null)}}>{[t('الانتظار','Lobby'),t('السؤال','Question'),t('المنصة','Podium')][i]}</button>)}
        </div><MotionControl/></div>
        <ActivityStage theme={selected} variant="preview" phase={phase} className={styles.previewStage}>
          <div className={styles.previewContent} key={`${selected}-${phase}`} data-question-surface="">
            {phase==='lobby'?<><h3>{t('لنبدأ المغامرة','Let the adventure begin')}</h3><p>{t('معاينة شاشة الانتظار','Lobby preview')}</p><div className={styles.previewPin} dir="ltr">123 456</div><p>{t('رمز تجريبي للمعاينة فقط','Example PIN · preview only')}</p></>
            :phase==='podium'?<><Trophy size={48} aria-hidden="true"/><h3>{t('كل إجابة خطوة للأمام','Every answer is a step forward')}</h3><p>{t('معاينة منصة النتائج','Podium preview')}</p><div className={styles.previewPodium} aria-hidden="true"><span>2</span><span>1</span><span>3</span></div></>
            :<><h3 className={styles.previewQuestion}>{t('أي كوكب يُعرف بالكوكب الأحمر؟','Which planet is known as the Red Planet?')}</h3><div className={styles.previewAnswers}>
              {[t('المريخ','Mars'),t('الزهرة','Venus'),t('زحل','Saturn'),t('المشتري','Jupiter')].map((label,i)=><button key={i} type="button" data-slot={i} aria-pressed={answer===i} aria-disabled={answer!==null} onClick={()=>{if(answer===null)setAnswer(i)}}><AnswerSymbol index={i}/><span>{label}</span>{answer!==null&&i===0&&<Check size={18} aria-label={t('صحيح','Correct')}/>}</button>)}
            </div><div className={styles.previewFeedback} aria-live="polite">{answer===null?t('سؤال تجريبي — جرّب الإجابة','Sample question — try an answer'):answer===0?t('أحسنت! المريخ هو الكوكب الأحمر.','You got it! Mars is the Red Planet.'):t('الإجابة هي المريخ. كل محاولة تعلّمك شيئًا.','The answer is Mars. Every attempt teaches you something.')}{answer!==null&&<button type="button" onClick={()=>setAnswer(null)}>{t('جرّب مجددًا','Try again')}</button>}</div></>}
          </div>
        </ActivityStage>
        <div className={styles.worldDescription}><h3>{ar?world.ar:world.en}</h3><p>{world.description[ar?'ar':'en']}</p><small>{selected==='classic'?t('مظهر أساسيرا الأصلي','Original Asasera theme'):t('صورة عالية الدقة مولّدة بالذكاء الاصطناعي','HD artwork generated with AI')}</small></div>
      </div>
      <fieldset className={styles.gallery} disabled={busy}><legend>{t('عوالم النشاط','Activity worlds')}</legend><div className={styles.themeGrid}>
        {activityThemes.map(theme=><label className={styles.themeOption} key={theme.id} data-selected={selected===theme.id}>
          <input type="radio" name={`${id}-theme`} value={theme.id} checked={selected===theme.id} onChange={()=>{setSelected(theme.id);setAnswer(null);setError('')}}/>
          <ThemeThumbnail theme={theme.id}/><span className={styles.themeName}>{ar?theme.ar:theme.en}{selected===theme.id&&<Check size={17} aria-hidden="true"/>}</span>
        </label>)}
      </div></fieldset>
    </div>
    <footer className={styles.dialogFooter}><div>{error?<p className={styles.error} role="alert">{error}</p>:<p>{published?t('احفظ المظهر ثم أعد نشر النشاط لتطبيقه على الحصص والروابط الجديدة.','Save your theme, then republish to use it in new games and assignment links.'):t('يُحفظ هذا المظهر مع نشاطك ويظهر للطلاب عند اللعب.','This theme is saved with your activity and appears when students play.')}</p>}</div><button type="button" className={styles.cancel} disabled={busy} onClick={onClose}>{t('إلغاء','Cancel')}</button><button type="button" className={styles.apply} disabled={busy} onClick={()=>void apply()}>{busy?t('جارٍ الحفظ…','Saving…'):t('استخدم هذا المظهر','Use this theme')}</button></footer>
  </dialog>
}
function AnswerSymbol({index}:{index:number}) {
  return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">{index===0?<path d="M12 2 23 22H1Z" fill="currentColor"/>:index===1?<path d="m12 0 12 12-12 12L0 12Z" fill="currentColor"/>:index===2?<circle cx="12" cy="12" r="11" fill="currentColor"/>:<rect x="2" y="2" width="20" height="20" fill="currentColor"/>}</svg>
}
