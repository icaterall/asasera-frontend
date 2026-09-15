import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Blocks,Search,Grid3x3} from 'lucide-react'
import {GAME_CHOICES,gameNeeds,acceptedKinds} from '@/features/presentations/catalog'
import {presentationArtwork,presentationPurpose,presentationTones} from '@/features/presentations/presentation-art'
import type {PresentationId} from '@/shared/presentation'
import styles from '@/features/presentations/Presentations.module.css'
import local from './ActivityGameChoice.module.css'

/* Three word games have no artwork yet; they get the icon cell the picker's
   own stylesheet already defines, rather than a blank square. */
const FALLBACK_ICONS:Record<string,typeof Blocks>={'word-builder':Blocks,'word-search':Search,crossword:Grid3x3}
const FIRST=8

/**
 * THE GAMES, CHOSEN BEFORE THE QUESTIONS ARE WRITTEN.
 *
 * A game used to be picked at launch, over questions that already existed —
 * the wrong order for every game that needs its own kind of content. A teacher
 * who wrote twenty multiple-choice questions and then chose "Sequence" was
 * told, at the last moment in front of a class, that none of them could be
 * played.
 *
 * SEVERAL may be chosen, because that is how a lesson is actually taught: the
 * same material runs as a wheel on Sunday and as matching pairs on Wednesday.
 * The set accepts the UNION of what its games play — two games with no kind in
 * common is a normal choice, not a contradiction — and every card says what it
 * needs, so the commitment is legible before it is made rather than discovered
 * later as a refusal. Choosing nothing is the default and a real answer.
 *
 * The cards are the LAUNCH PICKER'S cards: same stylesheet, same artwork, same
 * accent tones, same status pill. A teacher meets these twelve tiles twice —
 * here and at launch — and two drawings of one product is one too many.
 */
export function ActivityGameChoice({value,onChange,disabled}:{value:readonly PresentationId[];onChange:(value:PresentationId[])=>void;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [expanded,setExpanded]=useState(()=>GAME_CHOICES.some((game,index)=>index>=FIRST&&value.includes(game.id)))
 const shown=expanded?GAME_CHOICES:GAME_CHOICES.slice(0,FIRST)
 const toggle=(id:PresentationId)=>onChange(value.includes(id)?value.filter(item=>item!==id):[...value,id])
 return <div className={local.wrap}>
  <div className={styles.choices}>
   {shown.map(game=>{
    const picked=value.includes(game.id)
    const art=presentationArtwork[game.id]
    const Icon=FALLBACK_ICONS[game.id]
    const [arabicPurpose,englishPurpose]=presentationPurpose[game.id]??[game.blurbAr,game.blurbEn]
    return <label key={game.id} className={styles.choice} data-tone={presentationTones[game.id]} data-selected={picked}>
     <input type="checkbox" aria-label={ar?game.ar:game.en} checked={picked} disabled={disabled} onChange={()=>toggle(game.id)}/>
     {art
      ?<span className={styles.choiceArtwork}><img src={art} alt="" width="256" height="256" loading="lazy" draggable="false"/></span>
      :<span className={styles.choiceIcon}>{Icon?<Icon size={22} aria-hidden="true"/>:null}</span>}
     <span className={styles.choiceCopy}><strong>{ar?game.ar:game.en}</strong><small>{ar?arabicPurpose:englishPurpose}</small></span>
     <small className={styles.choiceMeta}>{ar?'يحتاج: ':'Needs: '}{gameNeeds(game.id,ar)}</small>
     <span className={styles.choiceMark} aria-hidden="true"/>
    </label>
   })}
  </div>
  <div className={local.tools}>
   {GAME_CHOICES.length>FIRST&&<button type="button" className={local.more} onClick={()=>setExpanded(open=>!open)}>
    {expanded?(ar?'عرض أقل':'Show fewer'):(ar?`عرض كل الألعاب (${GAME_CHOICES.length})`:`Show all games (${GAME_CHOICES.length})`)}
   </button>}
   {value.length>0&&<button type="button" className={local.more} disabled={disabled} onClick={()=>onChange([])}>{ar?'امسح الاختيار':'Clear selection'}</button>}
  </div>
  {/* The commitment, said plainly at the moment it is made — and said as a
      union, because that is what the server will enforce. */}
  <p className={local.commitment} role="status" data-empty={value.length===0}>
   {value.length===0
    ?(ar?'لم تختر لعبة — وهذا اختيار صحيح. سيقبل النشاط كل أنواع الأسئلة، وتختار اللعبة عند التشغيل.':'No game chosen — which is a valid answer. The activity accepts every question type, and you choose the game at play time.')
    :ar
     ?`اخترت ${value.length} ${value.length===1?'لعبة':'ألعاب'}. سيقبل هذا النشاط أسئلة من نوع: ${acceptedKinds(value,true)} فقط. كل سؤال يظهر في الألعاب التي تقبل نوعه، ويمكنك تغيير الاختيار من إعدادات النشاط ما دامت الأسئلة تناسبه.`
     :`${value.length} game${value.length===1?'':'s'} chosen. This activity will accept ${acceptedKinds(value,false)} questions only. Each question appears in the games that accept its type, and you can change the choice in activity settings while its questions still fit.`}
  </p>
 </div>
}
