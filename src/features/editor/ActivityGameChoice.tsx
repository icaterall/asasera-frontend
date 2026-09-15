import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Check,Disc3,Gift,Zap,Trophy,Layers,Shuffle,Link2,Brain,Group,ListOrdered,TextCursorInput,MessageCircle,Blocks,Search,Grid3x3,Sparkles} from 'lucide-react'
import {GAME_CHOICES,gameNeeds} from '@/features/presentations/catalog'
import type {PresentationId} from '@/shared/presentation'
import styles from './ActivityGameChoice.module.css'

const ICONS:Record<string,typeof Disc3>={
 'question-wheel':Disc3,'open-box':Gift,'challenge-cards':Zap,'class-competition':Trophy,
 flashcards:Layers,'random-cards':Shuffle,'match-up':Link2,memory:Brain,'group-sort':Group,
 sequence:ListOrdered,'sentence-completion':TextCursorInput,'speaking-cards':MessageCircle,
 'word-builder':Blocks,'word-search':Search,crossword:Grid3x3,
}
const FIRST=6

/**
 * THE GAME, CHOSEN BEFORE THE QUESTIONS ARE WRITTEN.
 *
 * A game used to be picked at launch, over questions that already existed —
 * the wrong order for every game that needs its own kind of content. A teacher
 * who wrote twenty multiple-choice questions and then chose "Sequence" was
 * told, at the last moment in front of a class, that none of them could be
 * played.
 *
 * So the choice is offered here, where it costs nothing, and it is honest
 * about what it commits to: pick a game and the activity accepts only the
 * question kinds that game plays. "Any game" stays the default, and stays a
 * real answer — most teachers should take it.
 *
 * Six games are shown; the rest are one press away. A wall of fifteen tiles
 * on the create form would make a small optional decision look like the main
 * event.
 */
export function ActivityGameChoice({value,onChange,disabled}:{value:PresentationId|null;onChange:(value:PresentationId|null)=>void;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [expanded,setExpanded]=useState(false)
 const shown=expanded?GAME_CHOICES:GAME_CHOICES.slice(0,FIRST)
 const chosen=GAME_CHOICES.find(game=>game.id===value)??null
 return <section className={styles.section} aria-labelledby="activity-game-heading">
  <div className={styles.head}>
   <h2 id="activity-game-heading">{ar?'نوع اللعبة':'Game type'} <span className={styles.optional}>{ar?'اختياري':'optional'}</span></h2>
   <p>{ar?'اختر لعبة الآن لتُكتب الأسئلة على مقاسها، أو اتركها مفتوحة واختر عند التشغيل.':'Pick a game now and the questions are written to fit it — or leave it open and choose when you play.'}</p>
  </div>
  <div className={styles.grid} role="radiogroup" aria-label={ar?'نوع اللعبة':'Game type'}>
   <button type="button" role="radio" aria-checked={value===null} disabled={disabled} className={styles.card} data-any="" onClick={()=>onChange(null)}>
    <span className={styles.icon}><Sparkles size={22} aria-hidden="true"/></span>
    <span className={styles.label}>
     <strong>{ar?'أي لعبة':'Any game'}</strong>
     <small>{ar?'اكتب ما تشاء من الأسئلة، واختر اللعبة عند التشغيل.':'Write any questions you like and choose the game at play time.'}</small>
    </span>
    {value===null&&<Check className={styles.tick} size={18} aria-hidden="true"/>}
   </button>
   {shown.map(game=>{
    const Icon=ICONS[game.id]??Sparkles
    return <button key={game.id} type="button" role="radio" aria-checked={value===game.id} disabled={disabled} className={styles.card} onClick={()=>onChange(game.id)}>
     <span className={styles.icon}><Icon size={22} aria-hidden="true"/></span>
     <span className={styles.label}>
      <strong>{ar?game.ar:game.en}</strong>
      <small>{ar?game.blurbAr:game.blurbEn}</small>
      <em>{ar?'يحتاج: ':'Needs: '}{gameNeeds(game.id,ar)}</em>
     </span>
     {value===game.id&&<Check className={styles.tick} size={18} aria-hidden="true"/>}
    </button>
   })}
  </div>
  {GAME_CHOICES.length>FIRST&&<button type="button" className={styles.more} onClick={()=>setExpanded(open=>!open)}>
   {expanded?(ar?'عرض أقل':'Show fewer'):(ar?`عرض كل الألعاب (${GAME_CHOICES.length})`:`Show all games (${GAME_CHOICES.length})`)}
  </button>}
  {/* The commitment, said plainly at the moment it is made — not discovered
      later when a question type is refused. */}
  {chosen&&<p className={styles.commitment} role="status">
   {ar
    ?`ستقبل أسئلة هذا النشاط نوع: ${gameNeeds(chosen.id,true)} فقط. يمكنك تغيير اللعبة من إعدادات النشاط ما دامت الأسئلة تناسبها.`
    :`This activity will only accept ${gameNeeds(chosen.id,false)} questions. You can change the game from activity settings while its questions still fit.`}
  </p>}
 </section>
}
