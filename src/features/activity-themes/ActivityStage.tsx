import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getActivityTheme, themeImage } from './catalog'
import { useActivityMotion } from './useActivityMotion'
import styles from './ActivityThemes.module.css'

type StageProps = HTMLAttributes<HTMLElement> & { theme?: string | null; as?: 'div'|'main'|'section'; variant?: 'live'|'preview'|'editor'; phase?: string }
export function ActivityStage({ theme, as:Tag='div', variant='live', phase='lobby', className='', children, style, ...props }: StageProps) {
  const world = getActivityTheme(theme), motion = useActivityMotion()
  const root = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true), [documentVisible, setDocumentVisible] = useState(!document.hidden)
  const moving = motion.enabled && visible && documentVisible && variant !== 'editor'
  useEffect(() => {
    const target = root.current
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? true))
    if (target) observer?.observe(target)
    const visibility = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  return <Tag {...props} ref={root} className={`${styles.stage} ${className}`} data-activity-theme={world.id} data-motion={moving ? 'on' : 'off'} data-variant={variant} data-phase={phase}
    style={{ ...style, '--world-color':world.color, '--world-accent':world.accent } as CSSProperties}>
    <Backdrop key={world.id} id={world.id} ambience={world.ambience} />
    {children}
  </Tag>
}
function Backdrop({id, ambience}: {id:string; ambience:string}) {
  const [failed, setFailed] = useState(false), [loaded, setLoaded] = useState(false)
  const src = themeImage(id)
  return <div className={styles.backdrop} aria-hidden="true" data-ambience={ambience}>
    {src && !failed && <picture className={styles.scenery} data-loaded={loaded}>
      <source media="(max-width:700px)" srcSet={themeImage(id,'mobile')} />
      <img src={src} alt="" decoding="async" width="1672" height="941" onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)} />
    </picture>}
    <div className={styles.veil} />
    {src && !failed && <div className={styles.atmosphere}>{Array.from({length:12},(_,i)=><i key={i} style={{'--particle':i, '--x':`${(i*29+7)%100}%`, '--duration':`${14+i%5*3}s`, '--delay':`${-i*2.7}s`} as CSSProperties}/>)}</div>}
  </div>
}
export function MotionControl({className=''}: {className?:string}) {
  const {i18n}=useTranslation(), ar=i18n.language.startsWith('ar'), {enabled,reduced,toggle}=useActivityMotion()
  const label = reduced ? (ar?'حركة مخفّضة':'Reduced motion') : enabled ? (ar?'إيقاف الحركة':'Pause motion') : (ar?'تشغيل الحركة':'Resume motion')
  return <button type="button" data-motion-control="" className={`${styles.motionControl} ${className}`} onClick={toggle} disabled={reduced} aria-label={label} title={reduced ? (ar?'حسب إعدادات تقليل الحركة في جهازك':'Following your device’s reduced-motion preference') : label}>
    {enabled?<Pause size={17} aria-hidden="true"/>:<Play size={17} aria-hidden="true"/>}<span>{label}</span>
  </button>
}
export function ThemeThumbnail({theme,className=''}:{theme:string;className?:string}) {
  const world=getActivityTheme(theme), [failed,setFailed]=useState(false),src=themeImage(theme,'thumb')
  return <span className={`${styles.thumbnail} ${className}`} style={{backgroundColor:world.color}} aria-hidden="true">{src&&!failed?<img src={src} alt="" loading="lazy" width="480" height="270" onError={()=>setFailed(true)}/>:<span className={styles.classicShapes}><i/><i/><i/></span>}</span>
}
