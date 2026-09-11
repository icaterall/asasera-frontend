import {useEffect, useRef} from 'react'
import {Link} from 'react-router-dom'
import {Disc3, Globe2, LogOut, Maximize, Minimize, Monitor, QrCode, Settings2, Users, Volume2, VolumeX} from 'lucide-react'
import {MotionControl} from '../activity-themes/ActivityStage'
import styles from './SessionChrome.module.css'
import {Logo} from '@/components/ui/Logo'

export function SessionToolbar({role,pin,participants,connected,ar,muted,enabled,full,busy,canWheel,canEnd,onSound,onFullscreen,onLanguage,onLeave,onProjector,onWheel,onEnd}: {
  role:'host'|'projector'|'player';pin?:string;participants:number;connected:boolean;ar:boolean;
  muted:boolean;enabled:boolean;full:boolean;busy:boolean;canWheel:boolean;canEnd:boolean;
  onSound:()=>void;onFullscreen:()=>void;onLanguage:()=>void;onLeave:()=>void;onProjector:()=>void;onWheel:()=>void;onEnd:()=>void;
}) {
  const menu=useRef<HTMLDetailsElement>(null)
  const t=(a:string,e:string)=>ar?a:e
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(menu.current&&!menu.current.contains(event.target as Node))menu.current.open=false}
    document.addEventListener('pointerdown',outside)
    return()=>document.removeEventListener('pointerdown',outside)
  },[])
  const choose=(action:()=>void)=>{if(menu.current)menu.current.open=false;action()}
  return <header className={styles.toolbar}>
    <div className={styles.joinAddress}>
      {pin?<a href={`/join?pin=${pin}`} target="_blank" rel="noreferrer" aria-label={t(`انضم برمز ${pin}`,`Join with PIN ${pin}`)}>
        <QrCode size={24} aria-hidden="true"/><span><span className={styles.joinLabel}>{t('انضم عبر','Join at')} <b dir="ltr">{location.host}/join</b></span><strong dir="ltr">{pin}</strong></span>
      </a>:<span>{t('هيا نلعب ونتعلّم','Let’s play and learn')}</span>}
    </div>
    <Link to={role==='player'?'/join':'/teacher/activities'} className={styles.brand}><Logo onDark /></Link>
    <div className={styles.tools}>
      {pin&&<span className={styles.participants} aria-label={t(`${participants} مشاركًا`,`${participants} participants`)}><Users size={20} aria-hidden="true"/>{participants}</span>}
      <span className={styles.connection} data-connected={connected} role="status" title={connected?t('متصل','Connected'):t('جارٍ الاتصال…','Reconnecting…')}><span className={styles.srOnly}>{connected?t('متصل','Connected'):t('جارٍ الاتصال…','Reconnecting…')}</span></span>
      <button type="button" onClick={onSound} aria-label={!enabled||muted?t('تشغيل الصوت','Turn sound on'):t('كتم الصوت','Mute')} title={!enabled||muted?t('تشغيل الصوت','Turn sound on'):t('كتم الصوت','Mute')}>{!enabled||muted?<VolumeX/>:<Volume2/>}</button>
      <button type="button" className={styles.fullscreen} onClick={onFullscreen} aria-label={full?t('إنهاء ملء الشاشة','Exit fullscreen'):t('ملء الشاشة','Fullscreen')}>{full?<Minimize/>:<Maximize/>}</button>
      <details ref={menu} className={styles.settings} onKeyDown={event=>{if(event.key==='Escape'&&menu.current){menu.current.open=false;menu.current.querySelector('summary')?.focus()}}} onBlur={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget))event.currentTarget.open=false}}>
        <summary aria-label={t('خيارات الحصة','Session options')} title={t('خيارات الحصة','Session options')}><Settings2 aria-hidden="true"/></summary>
        <div className={styles.menu}>
          <p>{t('خيارات الحصة','Session options')}</p>
          <MotionControl/>
          <button type="button" onClick={()=>choose(onLanguage)}><Globe2 size={20} aria-hidden="true"/>{ar?'English':'العربية'}</button>
          {role==='host'&&<button type="button" disabled={busy||!connected} onClick={()=>choose(onProjector)}><Monitor size={20} aria-hidden="true"/>{t('افتح شاشة العرض','Open projector')}</button>}
          {role==='host'&&canWheel&&<button type="button" disabled={busy||!connected} onClick={()=>choose(onWheel)}><Disc3 size={20} aria-hidden="true"/>{t('العجلة العشوائية','Random wheel')}</button>}
          {role==='host'&&canEnd&&<button type="button" disabled={busy||!connected} onClick={()=>choose(onEnd)}>{t('إنهاء الحصة مبكرًا','End class early')}</button>}
          <button type="button" onClick={()=>choose(onLeave)}><LogOut size={20} aria-hidden="true"/>{t('مغادرة الحصة','Leave class')}</button>
        </div>
      </details>
    </div>
  </header>
}
