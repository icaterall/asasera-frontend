import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {AudioLines,CirclePlay,Clock,Film,ImageIcon,Info,Mic,Plus,Search,Sparkles,Trash2,Upload,X} from 'lucide-react'
import {api,ApiError} from '@/lib/api'
import {ImageRemoveButton,ImageUpload,useImage} from './ImageUpload'
import {ImageCreator,useImageCreation,useImageQualityChoices,type MediaCapabilityReport} from './ImageCreator'
import {QuestionVideo} from '@/components/QuestionVideo'
import {VideoClipEditor} from './VideoClipEditor'
import {useVideoDetails} from './useVideoDetails'
import {formatVideoDuration,formatVideoTime} from './video-time'
import mediaIcons from '@/assets/images/media-icons.svg'
import styles from './MediaPicker.module.css'

type Panel='upload'|'create'|'youtube'|'videoUpload'|'audioUpload'|'readAloud'
type VideoHit={videoId:string;title:string;channel:string;description:string;thumbnail:string|null;durationSeconds?:number|null}

/*
 * Accepts what a teacher actually pastes: a watch URL, a youtu.be short link, a
 * /embed/ or /shorts/ URL, or the bare eleven-character id. Anything else is
 * refused rather than guessed at — a wrong id renders a player for the wrong
 * video, which is worse than saying the link was not understood.
 */
export function youTubeVideoId(input:string):string|null{
  const text=input.trim()
  if(/^[\w-]{11}$/.test(text))return text
  let url:URL
  try{url=new URL(text)}catch{return null}
  const host=url.hostname.replace(/^www\./,'')
  if(host==='youtu.be'){const id=url.pathname.slice(1);return /^[\w-]{11}$/.test(id)?id:null}
  if(host!=='youtube.com'&&host!=='youtube-nocookie.com'&&host!=='m.youtube.com')return null
  const direct=url.searchParams.get('v')
  if(direct&&/^[\w-]{11}$/.test(direct))return direct
  const path=url.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{11})/)
  return path?path[1]!:null
}
type Voice='female'|'male'

/**
 * The question's image, chosen through one picker rather than a bare file input.
 * Upload runs through the existing media pipeline untouched. Image Creator runs
 * the real generation flow when the editor has put a question in context (see
 * ImageCreationProvider); without that context there is no question to charge
 * against, so the entry stays off rather than calling a route that would fail.
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
  const [editVideo,setEditVideo]=useState(false)
  const url=useImage(imageKey)
  const creation=useImageCreation()
  const [videoInfo,setVideoInfo]=useState(false),videoInfoId=useId()
  useEffect(()=>setVideoInfo(false),[creation?.videoId])
  const videoDetails=useVideoDetails(creation?.activityId,creation?.videoId)
  const totalSeconds=videoDetails.data?.durationSeconds
  const duration=formatVideoDuration(totalSeconds,i18n.language)
  const clipStart=creation?.videoStartS??0,clipEnd=creation?.videoEndS??totalSeconds
  const clipped=clipStart>0||creation?.videoEndS!=null
  const clipDuration=clipped&&clipEnd!=null?formatVideoDuration(Math.min(clipEnd,totalSeconds??clipEnd)-clipStart,i18n.language):null
  return <div className={styles.field} data-question-image="">
    {creation?.videoId&&<div className={styles.attachedVideo}>
      <QuestionVideo videoId={creation.videoId} start={creation.videoStartS} end={creation.videoEndS} showLink={false}/>
      <div className={styles.videoTools}>
        <div className={styles.videoDuration} data-video-duration="" aria-live="polite">
          <Clock aria-hidden="true"/>
          <div><span>{t('مدة الفيديو','Video length')}</span>
            <strong>{duration??(videoDetails.isFetching?t('جارٍ التحميل…','Loading…'):t('المدة غير متاحة','Length unavailable'))}</strong>
            {clipDuration&&<small>{t('المقطع المحدد:','Selected clip:')} {clipDuration}</small>}
          </div>
        </div>
        <button type="button" aria-label={t('تعديل التوقيت','Edit timeframe')} title={t('تعديل التوقيت','Edit timeframe')} onClick={()=>{setEditVideo(true);setOpen(true)}}><Film aria-hidden="true"/></button>
        <button type="button" aria-label={t('معلومات الفيديو','Video information')} title={t('معلومات الفيديو','Video information')} aria-expanded={videoInfo} aria-controls={videoInfoId} onClick={()=>setVideoInfo(value=>!value)}><Info aria-hidden="true"/></button>
        <button type="button" aria-label={t('إزالة الفيديو','Remove video')} title={t('إزالة الفيديو','Remove video')} onClick={()=>creation.onVideo?.(null)}><Trash2 aria-hidden="true"/></button>
      </div>
      <div id={videoInfoId} className={styles.videoInfo} hidden={!videoInfo}>
        <p dir="auto">{t('وقت الفيديو:','Video timeframe:')} <bdi>{formatVideoTime(creation.videoStartS??0)} — {creation.videoEndS==null?t('نهاية الفيديو','End of video'):formatVideoTime(creation.videoEndS)}</bdi></p>
        <a href={`https://www.youtube.com/watch?v=${creation.videoId}`} target="_blank" rel="noopener noreferrer">{t('افتح في يوتيوب','Open on YouTube')}</a>
        <button type="button" onClick={()=>{setEditVideo(false);setOpen(true)}}>{t('استبدال الفيديو','Replace video')}</button>
      </div>
    </div>}
    {imageKey&&url
      ? /*
         * The picture, and nothing framing it. The image itself is the replace
         * control and the bin sits on it, the same two gestures a choice's
         * picture already has — a row of worded buttons under a box said the
         * same thing at three times the size.
         */
        <div className={styles.preview}>
          <button type="button" className={styles.previewImage} onClick={()=>setOpen(true)}
            aria-label={t('استبدل الصورة','Replace image')} title={t('استبدل الصورة','Replace image')}>
            <img src={url} alt={t('الصورة المرفقة','Attached image')}/>
          </button>
          <ImageRemoveButton className={styles.previewRemove} onRemove={onRemove} label={t('إزالة الصورة','Remove image')}/>
        </div>
      : !creation?.videoId?<button type="button" className={styles.zone} aria-label={label}
          onClick={()=>{setDropped(null);setOpen(true)}}
          onDragOver={event=>{event.preventDefault();setOver(true)}}
          onDragLeave={()=>setOver(false)}
          onDrop={event=>{event.preventDefault();setOver(false);const file=event.dataTransfer.files?.[0];if(file){setDropped(file);setOpen(true)}}}
          data-over={over||undefined}>
          <img src={mediaIcons} alt="" aria-hidden="true"/>
          <span className={styles.plus}><Plus size={26} aria-hidden="true"/></span>
          <span className={styles.zoneTitle}>{t('ابحث عن وسائط وأدرجها (اختياري)','Find and insert media (Optional)')}</span>
          <span className={styles.zoneHint}>{t('ارفع ملفًا أو اسحبه إلى هنا','Upload file or drag here to upload')}</span>
        </button>:null}
    {open&&<MediaPickerDialog editVideo={editVideo} dropped={dropped} onClose={()=>{setOpen(false);setEditVideo(false);setDropped(null)}} onImage={key=>{onImage(key);setOpen(false);setEditVideo(false);setDropped(null)}} onBusyChange={onBusyChange}/>}
  </div>
}

function MediaPickerDialog({dropped,onClose,onImage,onBusyChange,editVideo=false}:{dropped:File|null;onClose:()=>void;onImage:(key:string)=>void;onBusyChange?:(busy:boolean)=>void;editVideo?:boolean}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const dialog=useRef<HTMLDialogElement>(null),titleId=useId()
  const creation=useImageCreation()
  const [chosenVideo,setChosenVideo]=useState<{videoId:string;title:string}|null>(()=>editVideo&&creation?.videoId?{videoId:creation.videoId,title:t('الفيديو المرفق','Attached video')}:null)
  const [panel,setPanel]=useState<Panel>(creation?.videoId?'youtube':'upload'),[creatorVisited,setCreatorVisited]=useState(false)
  const [link,setLink]=useState(''),[speech,setSpeech]=useState(''),[voice,setVoice]=useState<Voice>('female')
  /*
   * ONE FIELD, TWO COSTS. A pasted link is resolved with `videos.list` at one
   * quota unit; typed words are a `search.list` at a hundred. So a link resolves
   * as you paste it, and words wait for Enter — the expensive path is never
   * taken by accident.
   */
  const pastedId=youTubeVideoId(link)
  const [submitted,setSubmitted]=useState('')
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
  const creationRef=useRef(creation)
  creationRef.current=creation
  /*
   * ONE SEARCH PER ACTIVITY, FETCHED WHEN THE PICKER OPENS.
   *
   * The query is built from the activity — its title, category, and the terms
   * already read out of the uploaded material — never from the question, so
   * every question in the activity, including ones written tomorrow, asks the
   * same thing and gets the same shelf of clips. The server answers the second
   * and every later ask from a shared table, and `staleTime: Infinity` stops
   * this session asking again at all.
   *
   * Previewing suggestions does not attach anything or spend credit. Only the
   * explicit selection action below updates the question through autosave.
   */
  const suggestions=useQuery({
    queryKey:['video-suggestions',creation?.activityId,pastedId??'',submitted],
    queryFn:()=>{
      const base=`/api/v1/activity-media/video-suggestions?activityId=${creation!.activityId}`
      const scoped=pastedId?`${base}&videoId=${encodeURIComponent(pastedId)}`
        :submitted?`${base}&q=${encodeURIComponent(submitted)}`:base
      return api.get<{suggestions:VideoHit[];query:string;source:'cache'|'youtube'}>(scoped)
    },
    enabled:!!creation&&!chosenVideo,
    staleTime:Infinity,
    retry:false,
  })

  const preferences=useImageQualityChoices(true)
  /*
   * THE ADMIN PAGE DECIDES; THIS ONLY REPORTS.
   *
   * Every entry here used to be hardcoded, so enabling a route in the admin
   * settings changed nothing a teacher could see, and disabling one left the
   * interface still offering it. These flags now come from the server's reading
   * of the administrator's own media policy.
   */
  const capabilities=preferences.data?.capabilities
  const imageCreation=capabilities?.imageCreation
  const textToSpeech=capabilities?.textToSpeech
  const videoSuggestions=capabilities?.videoSuggestions
  /* Upload of video and audio is not an AI route at all — the intake pipeline
     accepts images only — so those two stay off regardless of AI settings. */
  const groups=[
    {heading:t('صور','Images'),Heading:ImageIcon,items:[
      {id:'upload' as const,Icon:Upload,label:t('رفع صورة','Upload image'),ready:true},
      {id:'create' as const,Icon:Sparkles,label:t('منشئ الصور','Image Creator'),ready:imageCreation?.state==='ready'&&!!creation},
    ]},
    {heading:t('فيديو','Video'),Heading:Film,items:[
      {id:'youtube' as const,Icon:CirclePlay,label:t('يوتيوب','YouTube'),ready:videoSuggestions?.state==='ready'},
      {id:'videoUpload' as const,Icon:Upload,label:t('رفع فيديو','Upload video'),ready:false},
    ]},
    {heading:t('صوت','Audio'),Heading:AudioLines,items:[
      {id:'audioUpload' as const,Icon:Upload,label:t('رفع ملف صوتي','Upload audio'),ready:false},
      {id:'readAloud' as const,Icon:Mic,label:t('تحويل نص إلى صوت','Text to speech'),ready:textToSpeech?.state==='ready'},
    ]},
  ]
  /* One sentence per state, so a teacher is told which of the three different
     situations they are in rather than a single word that fits none of them. */
  const capabilityNote=(report:MediaCapabilityReport|undefined,noun:string,nounEn:string)=>
    !report?null
    :report.state==='paused'?t(`أوقف المسؤول ${noun} مؤقتًا. رصيدك كما هو.`,`Your administrator has paused ${nounEn}. Your credit is unaffected.`)
    :report.state==='unconfigured'?t(`${noun} غير مهيّأ بعد: ينقص مفتاح المزوّد أو سعر النموذج. أبلغ المسؤول.`,`${nounEn} is not configured yet: a provider key or a model price is missing. Tell your administrator.`)
    :report.state==='pending'?t(`${noun} مُعدّ في لوحة الإدارة، لكن تنفيذه لم يُبنَ بعد. لن يُخصم من رصيدك شيء.`,`${nounEn} is set up in the admin panel, but its execution is not built yet. Nothing will be charged.`)
    :null
  return createPortal(<dialog ref={dialog} className={`asas ${styles.dialog}`} data-clipping={!!chosenVideo} dir={ar?'rtl':'ltr'} aria-labelledby={titleId}
    onCancel={event=>{event.preventDefault();onClose()}} onKeyDown={event=>event.stopPropagation()}>
    <header className={styles.header}>
      <h2 id={titleId}>{chosenVideo?t('توقيت الفيديو','Video timeframe'):t('الوسائط','Media')}</h2>
      <button type="button" aria-label={t('إغلاق','Close')} onClick={onClose}><X size={20}/></button>
    </header>
    {chosenVideo&&<div className={styles.clipPanel}><VideoClipEditor key={chosenVideo.videoId} videoId={chosenVideo.videoId} title={chosenVideo.title}
      activityId={creation?.activityId}
      editing={creation?.videoId===chosenVideo.videoId}
      start={creation?.videoId===chosenVideo.videoId?creation.videoStartS:null} end={creation?.videoId===chosenVideo.videoId?creation.videoEndS:null}
      onBack={()=>setChosenVideo(null)} onApply={(start,end)=>{creation?.onVideo?.(chosenVideo.videoId,start,end);onClose()}}/></div>}
    <div className={styles.body} hidden={!!chosenVideo}>
      <nav className={styles.nav} aria-label={t('مصادر الوسائط','Media sources')}>
        {groups.map(({heading,Heading,items})=><div key={heading} className={styles.navSection}>
          <p className={styles.navGroup}><Heading size={16} aria-hidden="true"/>{heading}</p>
          {items.map(({id,Icon,label,ready})=><button key={id} type="button" aria-current={panel===id} onClick={()=>{setPanel(id);if(id==='create')setCreatorVisited(true)}}>
            <Icon size={16} aria-hidden="true"/>{label}
            {!ready&&<span className={styles.soon}>{t('قريبًا','Soon')}</span>}
          </button>)}
        </div>)}
      </nav>
      {panel==='youtube'&&!chosenVideo
        ? <section className={styles.panel} aria-label={t('يوتيوب','YouTube')}>
            {/* One field for both jobs, because a teacher does not think of
                "paste a link" and "search" as two tools. */}
            <div className={styles.videoSearch}>
              <Search size={20} aria-hidden="true"/>
              <input value={link} dir="auto" maxLength={200}
                aria-label={t('ابحث أو الصق رابط يوتيوب','Search or paste a YouTube link')}
                placeholder={t('ابحث أو الصق رابط يوتيوب','Search or paste YouTube link')}
                onChange={event=>setLink(event.target.value)}
                onKeyDown={event=>{
                  if(event.key!=='Enter')return
                  event.preventDefault()
                  /* A link needs no Enter — it is already resolving. Words do,
                     because words cost a hundred times as much. */
                  if(!pastedId)setSubmitted(link.trim())
                }}/>
              {link&&<button type="button" aria-label={t('امسح','Clear')} onClick={()=>{setLink('');setSubmitted('')}}><X size={20}/></button>}
            </div>

            <div className={styles.videoHead}>
              <h3>{pastedId?t('الرابط الذي لصقته','The link you pasted'):submitted?t('نتائج البحث','Search results'):t('مقاطع مقترحة','Suggested videos')}</h3>
              {/* Attribution in words. YouTube's mark is theirs to draw, and it
                  is drawn inside every player below. */}
              <p>{t('المصدر: يوتيوب','Provided by YouTube')}</p>
            </div>

            {!creation&&<p className={styles.pending} role="status">{t('افتح سؤالاً لعرض مقترحات هذا النشاط.','Open a question to see this activity’s suggestions.')}</p>}
            {link.trim()&&!pastedId&&!submitted&&<p className={styles.searchedFor}>{t('اضغط Enter للبحث عن هذه الكلمات.','Press Enter to search for those words.')}</p>}
            {suggestions.isPending&&!!creation&&<p className={styles.pending} role="status">{t('جارٍ التحميل…','Loading…')}</p>}
            {suggestions.error&&<p className={styles.pending} role="alert">
              {suggestions.error instanceof ApiError?suggestions.error.message:t('تعذّر البحث. أعد المحاولة لاحقًا.','The search failed. Try again later.')}
            </p>}

            {suggestions.data&&(suggestions.data.suggestions.length===0
              ? <p className={styles.pending} role="status">{pastedId
                  ? t('لم نجد هذا المقطع. قد يكون خاصًّا أو محذوفًا.','That clip could not be found. It may be private or deleted.')
                  : t('لا مقاطع مناسبة. جرّب كلمات أخرى.','No suitable clips. Try different words.')}</p>
              : <ul className={styles.videoRows}>{suggestions.data.suggestions.map(video=>
                  <li key={video.videoId}>
                    {/*
                      YouTube's own player draws the poster, the red play button,
                      the duration and the wordmark. We neither redraw their mark
                      nor host their picture; `loading="lazy"` keeps the frames
                      off the network until they are scrolled to.
                    */}
                    <div className={styles.videoFrame}>
                      <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                        title={video.title||t('مقطع يوتيوب','YouTube clip')} loading="lazy" allowFullScreen
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"/>
                    </div>
                    <div className={styles.videoText}>
                      <strong dir="auto">{video.title}</strong>
                      <span dir="auto">{video.description||video.channel}</span>
                      <button type="button" className={styles.selectVideo} disabled={!creation?.onVideo}
                        onClick={()=>setChosenVideo(video)}>
                        {t('استخدم هذا الفيديو','Use this video')}
                      </button>
                    </div>
                  </li>)}
                </ul>)}

            <p className={styles.note}>{creation?.onVideo?t('اختر «استخدم هذا الفيديو»، وحدد التوقيت، ثم أضفه إلى السؤال.','Choose “Use this video”, set its timeframe, then add it to the question.')
              :t('افتح السؤال في المحرر لإرفاق فيديو.','Open the question in the editor to attach a video.')}</p>
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
            <p className={styles.pending}>{capabilityNote(textToSpeech,'تحويل النص إلى صوت','Text to speech')
              ??t('تحويل النص إلى صوت جاهز. سيُخصم كل تحويل من رصيدك.','Text to speech is ready. Each conversion is charged to your credit.')}</p>
          </section>
        : panel==='upload'
        ? <section className={styles.panel} aria-label={t('رفع صورة','Upload image')}>
            <p className={styles.panelHead}>{t('اختر صورة من جهازك. نتحقق منها قبل إضافتها إلى السؤال.','Choose an image from your device. We check it before adding it to the question.')}</p>
            <ImageUpload imageKey={null} onImage={onImage} onBusyChange={onBusyChange}/>
          </section>
        : null}
      {/* Retain the one real form across tab changes; never stack another dialog. */}
      <div className={styles.creatorPanel} hidden={panel!=='create'}>
        {creatorVisited&&creation&&imageCreation?.state==='ready'
          ? <ImageCreator embedded activityId={creation.activityId} questionId={creation.questionId}
              onPrepare={creation.onPrepare} onImage={onImage} onClose={onClose}/>
          : <section className={styles.panel}>
              <p role="status">{preferences.isPending?t('جارٍ قراءة خيارات الجودة…','Reading the quality options…')
                :capabilityNote(imageCreation,'إنشاء الصور','Image creation')
                ??(!creation?t('افتح سؤالاً لإنشاء صورة له.','Open a question to create an image for it.')
                :t('تعذّر تحميل إعدادات إنشاء الصور. أعد المحاولة.','Could not load image creation settings. Try again.'))}</p>
              {preferences.isError&&<button type="button" onClick={()=>void preferences.refetch()}>{t('أعد المحاولة','Try again')}</button>}
            </section>}
      </div>
    </div>
  </dialog>,document.body)
}
