import {useEffect,useRef,useState} from 'react'
import QRCode from 'qrcode'
import {Check,Copy,ExternalLink,Share2,X} from 'lucide-react'
import styles from './JoinShareDialog.module.css'

/**
 * The join code, as a sheet anyone in the room can open while the class runs.
 *
 * WHY EVERY ROLE. The PIN and QR used to live in the lobby only, and only for
 * the teacher's screen — once the first question opened, the way in vanished.
 * A latecomer then needed the teacher to stop and go back. The server already
 * sends `pin` in every audience's snapshot, so students can hand the code to a
 * friend themselves; nothing here widens what the server discloses.
 */
export function JoinShareDialog({pin,ar,onClose}:{pin:string;ar:boolean;onClose:()=>void}) {
  const t=(a:string,e:string)=>ar?a:e
  const url=`${location.origin}/join?pin=${pin}`
  const [qr,setQr]=useState('')
  const [copied,setCopied]=useState(false)
  const card=useRef<HTMLDivElement>(null)
  const [canShare]=useState(()=>typeof navigator!=='undefined'&&typeof navigator.share==='function')
  useEffect(()=>{let live=true;void QRCode.toDataURL(url,{width:440,margin:1,errorCorrectionLevel:'M'}).then(code=>{if(live)setQr(code)}).catch(()=>{if(live)setQr('')});return()=>{live=false}},[url])
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.stopPropagation();onClose()}}
    document.addEventListener('keydown',key)
    card.current?.focus()
    return()=>document.removeEventListener('keydown',key)
  },[onClose])
  useEffect(()=>{if(!copied)return;const timer=window.setTimeout(()=>setCopied(false),2200);return()=>window.clearTimeout(timer)},[copied])
  /* clipboard.writeText is unavailable over plain http, which is exactly how a
     school laptop reaches a classroom server — so the old execCommand path stays
     as the fallback rather than leaving the button silently dead. */
  const copy=async()=>{
    try{await navigator.clipboard.writeText(url);setCopied(true);return}catch{/* fall through */}
    const field=document.createElement('textarea')
    field.value=url;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0'
    document.body.appendChild(field);field.select()
    try{setCopied(document.execCommand('copy'))}catch{setCopied(false)}
    document.body.removeChild(field)
  }
  const share=()=>{void navigator.share?.({title:t('انضم إلى الحصة','Join the class'),text:t(`رمز الحصة ${pin}`,`Class PIN ${pin}`),url}).catch(()=>{})}
  return <div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <div ref={card} className={styles.dialog} role="dialog" aria-modal="true" aria-label={t('رابط الانضمام','Join link')} tabIndex={-1}>
      <button type="button" className={styles.close} onClick={onClose} aria-label={t('إغلاق','Close')}><X size={20} aria-hidden="true"/></button>
      <h2 className={styles.title}>{t('انضموا إلى الحصة','Join this class')}</h2>
      <p className={styles.hint}>{t('امسح الرمز أو شارك الرابط مع من يريد الانضمام','Scan the code, or share the link with anyone joining')}</p>
      <div className={styles.qrCard}>{qr?<img src={qr} alt={t(`رمز الانضمام للحصة ${pin}`,`Join QR code for PIN ${pin}`)}/>:<span>{t('جارٍ تجهيز الرمز…','Preparing the code…')}</span>}</div>
      <div className={styles.pinCard}><span className={styles.pinLabel}>{t('رمز الحصة','Class PIN')}</span><strong className={styles.pin} dir="ltr">{pin}</strong></div>
      <div className={styles.linkRow}>
        <code dir="ltr">{url.replace(/^https?:\/\//,'')}</code>
        <button type="button" className={styles.copy} data-done={copied} onClick={()=>void copy()}>{copied?<Check size={16} aria-hidden="true"/>:<Copy size={16} aria-hidden="true"/>}{copied?t('تم النسخ','Copied'):t('انسخ','Copy')}</button>
      </div>
      <div className={styles.actions}>
        {canShare&&<button type="button" onClick={share}><Share2 size={18} aria-hidden="true"/>{t('مشاركة','Share')}</button>}
        <a href={`/join?pin=${pin}`} target="_blank" rel="noreferrer"><ExternalLink size={18} aria-hidden="true"/>{t('افتح صفحة الانضمام','Open join page')}</a>
      </div>
      <p className={styles.status} role="status">{copied?t('نُسخ الرابط','Link copied'):''}</p>
    </div>
  </div>
}
