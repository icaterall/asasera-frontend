import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {AudioLines,CirclePlay,Film,ImageIcon,Link2,Mic,Plus,Sparkles,Upload,X} from 'lucide-react'
import {teaching} from '@/lib/api'
import {ImageUpload,useImage} from './ImageUpload'
import mediaIcons from '@/assets/images/media-icons.svg'
import styles from './MediaPicker.module.css'

type Panel='upload'|'create'|'youtube'|'videoUpload'|'audioUpload'|'readAloud'
type Voice='female'|'male'

/**
 * The question's image, chosen through one picker rather than a bare file input.
 * Upload runs through the existing media pipeline untouched; Image Creator is laid
 * out but cannot run until the generation endpoint exists, so its button stays off
 * rather than calling a route that would 404.
 */
export function MediaField({imageKey,onImage,onRemove,onBusyChange,label}:{
  imageKey:string|null
  onImage:(key:string)=>void
  onRemove:()=>void
  onBusyChange?:(busy:boolean)=>void
  label:string
}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const [open,setOpen]=useState(false),[over,setOver]=useState(false),[dropped,setDropped]=useState<File|null>(null)
  const url=useImage(imageKey)
  return <div className={styles.field} data-question-image="">
    {imageKey&&url
      ? <div className={styles.preview}>
          <img src={url} alt={t('الصورة المرفقة','Attached image')}/>
          <div className={styles.previewActions}>
            <button type="button" onClick={()=>setOpen(true)}>{t('استبدل الصورة','Replace image')}</button>
            <button type="button" onClick={onRemove}>{t('إزالة الصورة','Remove image')}</button>
          </div>
        </div>
      : <button type="button" className={styles.zone} aria-label={label}
          onClick={()=>{setDropped(null);setOpen(true)}}
          onDragOver={event=>{event.preventDefault();setOver(true)}}
          onDragLeave={()=>setOver(false)}
          onDrop={event=>{event.preventDefault();setOver(false);const file=event.dataTransfer.files?.[0];if(file){setDropped(file);setOpen(true)}}}
          data-over={over||undefined}>
          <img src={mediaIcons} alt="" aria-hidden="true"/>
          <span className={styles.plus}><Plus size={26} aria-hidden="true"/></span>
          <span className={styles.zoneTitle}>{t('ابحث عن وسائط وأدرجها (اختياري)','Find and insert media (Optional)')}</span>
          <span className={styles.zoneHint}>{t('ارفع ملفًا أو اسحبه إلى هنا','Upload file or drag here to upload')}</span>
        </button>}
    {open&&<MediaPickerDialog dropped={dropped} onClose={()=>{setOpen(false);setDropped(null)}} onImage={key=>{onImage(key);setOpen(false);setDropped(null)}} onBusyChange={onBusyChange}/>}
  </div>
}

function MediaPickerDialog({dropped,onClose,onImage,onBusyChange}:{dropped:File|null;onClose:()=>void;onImage:(key:string)=>void;onBusyChange?:(busy:boolean)=>void}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const dialog=useRef<HTMLDialogElement>(null),titleId=useId()
  const [panel,setPanel]=useState<Panel>('upload'),[prompt,setPrompt]=useState('')
  const [link,setLink]=useState(''),[speech,setSpeech]=useState(''),[voice,setVoice]=useState<Voice>('female')
  const wallet=useQuery({queryKey:['teaching-wallet'],queryFn:()=>teaching.wallet(),staleTime:60_000})
  useEffect(()=>{
    const previous=document.activeElement,element=dialog.current,overflow=document.body.style.overflow
    element?.showModal();document.body.style.overflow='hidden'
    return()=>{element?.close();document.body.style.overflow=overflow;if(previous instanceof HTMLElement&&previous.isConnected)previous.focus()}
  },[])
  /* A file dropped on the closed box starts uploading straight away: hand it to the
     upload panel's own file input so the existing pipeline runs unchanged. */
  useEffect(()=>{
    if(!dropped)return
    const input=dialog.current?.querySelector<HTMLInputElement>('input[type=file]')
    if(!input)return
    const transfer=new DataTransfer();transfer.items.add(dropped)
    input.files=transfer.files
    input.dispatchEvent(new Event('change',{bubbles:true}))
  },[dropped])
  const groups=[
    {heading:t('صور','Images'),Heading:ImageIcon,items:[
      {id:'upload' as const,Icon:Upload,label:t('رفع صورة','Upload image'),ready:true},
      {id:'create' as const,Icon:Sparkles,label:t('منشئ الصور','Image Creator'),ready:false},
    ]},
    {heading:t('فيديو','Video'),Heading:Film,items:[
      {id:'youtube' as const,Icon:CirclePlay,label:t('يوتيوب','YouTube'),ready:false},
      {id:'videoUpload' as const,Icon:Upload,label:t('رفع فيديو','Upload video'),ready:false},
    ]},
    {heading:t('صوت','Audio'),Heading:AudioLines,items:[
      {id:'audioUpload' as const,Icon:Upload,label:t('رفع ملف صوتي','Upload audio'),ready:false},
      {id:'readAloud' as const,Icon:Mic,label:t('تحويل نص إلى صوت','Text to speech'),ready:false},
    ]},
  ]
  const spendable=wallet.data?wallet.data.spendableMillicents/100000:null
  return createPortal(<dialog ref={dialog} className={`asas ${styles.dialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={titleId}
    onCancel={event=>{event.preventDefault();onClose()}} onKeyDown={event=>event.stopPropagation()}>
    <header className={styles.header}>
      <h2 id={titleId}>{t('أضف صورة','Add an image')}</h2>
      <button type="button" aria-label={t('إغلاق','Close')} onClick={onClose}><X size={20}/></button>
    </header>
    <div className={styles.body}>
      <nav className={styles.nav} aria-label={t('مصادر الوسائط','Media sources')}>
        {groups.map(({heading,Heading,items})=><div key={heading}>
          <p className={styles.navGroup}><Heading size={16} aria-hidden="true"/>{heading}</p>
          {items.map(({id,Icon,label,ready})=><button key={id} type="button" aria-current={panel===id} onClick={()=>setPanel(id)}>
            <Icon size={16} aria-hidden="true"/>{label}
            {!ready&&<span className={styles.soon}>{t('قريبًا','Soon')}</span>}
          </button>)}
        </div>)}
      </nav>
      {panel==='youtube'
        ? <section className={styles.panel} aria-label={t('يوتيوب','YouTube')}>
            <p className={styles.panelHead}>{t('الصق رابط يوتيوب، أو ابحث عن مقطع يناسب سؤالك.','Paste a YouTube link, or search for a clip that fits your question.')}</p>
            <div className={styles.linkRow}>
              <input value={link} onChange={event=>setLink(event.target.value)} dir="ltr" inputMode="url" maxLength={200}
                aria-label={t('رابط يوتيوب','YouTube link')} placeholder={t('ابحث أو الصق رابط يوتيوب','Search or paste a YouTube link')}/>
              <button type="button" className={styles.create} disabled title={t('غير متاح بعد','Not available yet')}>
                <Link2 size={17} aria-hidden="true"/>{t('أضف','Add')}
              </button>
            </div>
            <p className={styles.suggestHead}><CirclePlay size={16} aria-hidden="true"/>{t('مقترحات من عنوان سؤالك ونشاطك','Suggestions from your question and activity title')}</p>
            <p className={styles.pending}>{t('البحث في يوتيوب والاقتراح التلقائي قيد الإعداد. حتى ذلك الحين يمكنك حفظ الرابط يدويًا بعد تفعيل الميزة.','YouTube search and automatic suggestions are being set up. Until then, links cannot be saved.')}</p>
          </section>
        : panel==='videoUpload'
        ? <section className={styles.panel} aria-label={t('رفع فيديو','Upload video')}>
            <p className={styles.panelHead}>{t('ارفع مقطع فيديو من جهازك ليظهر مع السؤال.','Upload a video clip from your device to show with the question.')}</p>
            <p className={styles.pending}>{t('رفع الفيديو قيد الإعداد: مسار الرفع الحالي يقبل الصور فقط.','Video upload is being set up: the current upload pipeline accepts images only.')}</p>
          </section>
        : panel==='audioUpload'
        ? <section className={styles.panel} aria-label={t('رفع ملف صوتي','Upload audio')}>
            <p className={styles.panelHead}>{t('ارفع ملفًا صوتيًا ليُشغَّل مع السؤال.','Upload an audio file to play with the question.')}</p>
            <p className={styles.pending}>{t('رفع الصوت قيد الإعداد: مسار الرفع الحالي يقبل الصور فقط.','Audio upload is being set up: the current upload pipeline accepts images only.')}</p>
          </section>
        : panel==='readAloud'
        ? <section className={styles.panel} aria-label={t('تحويل نص إلى صوت','Text to speech')}>
            <p className={styles.panelHead}>{t('اكتب نصًا وسيُقرأ بصوت آلي مع السؤال.','Enter text and it will be read aloud by an automated voice with the question.')}</p>
            <label className={styles.fieldLabel} htmlFor={`${titleId}-speech`}>{t('النص المراد قراءته','Text to be read aloud')}</label>
            <textarea id={`${titleId}-speech`} value={speech} onChange={event=>setSpeech(event.target.value)}
              maxLength={300} rows={3} dir="auto" style={{width:'100%',minHeight:74,padding:'11px 13px',border:'1px solid var(--line)',borderRadius:7,background:'var(--surface)',color:'var(--ink)',font:'inherit',fontSize:14,lineHeight:1.6,resize:'vertical'}}
              placeholder={t('اكتب النص هنا','Enter your text here')}/>
            <p className={styles.counter} dir="ltr">{speech.length} / 300</p>
            <span className={styles.fieldLabel}>{t('الصوت','Voice')}</span>
            <div className={styles.voices} role="group" aria-label={t('اختر الصوت','Choose a voice')}>
              {([['female',t('صوت أنثوي','Female voice')],['male',t('صوت ذكوري','Male voice')]] as const).map(([id,label])=>
                <button key={id} type="button" aria-pressed={voice===id} onClick={()=>setVoice(id)}><AudioLines size={16} aria-hidden="true"/>{label}</button>)}
            </div>
            <p className={styles.pending}>{t('تحويل النص إلى صوت قيد الإعداد. سيُخصم كل تحويل من رصيدك عند تفعيله.','Text to speech is being set up. Each conversion will be charged to your credit once it is switched on.')}</p>
          </section>
        : panel==='upload'
        ? <section className={styles.panel} aria-label={t('رفع صورة','Upload image')}>
            <p className={styles.panelHead}>{t('اختر صورة من جهازك. نتحقق منها قبل إضافتها إلى السؤال.','Choose an image from your device. We check it before adding it to the question.')}</p>
            <ImageUpload imageKey={null} onImage={onImage} onBusyChange={onBusyChange}/>
          </section>
        : <section className={styles.panel} aria-label={t('منشئ الصور','Image Creator')}>
            <p className={styles.panelHead}>{t('صف الصورة التي تريدها، وسننشئها لك.','Describe the image you want and we will create it for you.')}</p>
            <div className={styles.promptRow}>
              <textarea value={prompt} onChange={event=>setPrompt(event.target.value)} maxLength={500} dir="auto"
                aria-label={t('وصف الصورة','Describe the image')}
                placeholder={t('صف الصورة التي تريد إنشاءها','Describe the image you want to create')}/>
              <button type="button" className={styles.create} disabled title={t('غير متاح بعد','Not available yet')}>
                <Sparkles size={17} aria-hidden="true"/>{t('أنشئ','Create')}
              </button>
            </div>
            <p className={styles.credits}>
              {wallet.isPending
                ? t('جارٍ قراءة رصيدك…','Reading your balance…')
                : spendable===null
                  ? t('تعذّر قراءة رصيدك.','Your balance could not be read.')
                  : <>{t('رصيدك المتاح:','Available credit:')} <strong dir="ltr">${spendable.toFixed(2)}</strong></>}
            </p>
            <p className={styles.pending}>{t('إنشاء الصور بالذكاء الاصطناعي قيد الإعداد. سيُخصم كل إنشاء من رصيدك عند تفعيله.','AI image creation is being set up. Each creation will be charged to your credit once it is switched on.')}</p>
            <p className={styles.note}>{t('لا تضع بيانات شخصية في الوصف.','Do not put personal data in the description.')}</p>
          </section>}
    </div>
  </dialog>,document.body)
}
