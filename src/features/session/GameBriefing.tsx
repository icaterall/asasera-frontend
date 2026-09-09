import {ArrowDownToLine, ArrowLeftRight, BookOpen, ChevronDown, Gamepad2, Gem, Trophy} from 'lucide-react'
import type {ArcadeMode} from '@/shared/arcade'
import {ThemeThumbnail} from '../activity-themes/ActivityStage'
import {gameInfo} from '../games/catalog'
import styles from './SessionChrome.module.css'

export function GameBriefing({mode,ar}:{mode:ArcadeMode;ar:boolean}) {
  const game=gameInfo(mode),t=(a:string,e:string)=>ar?a:e
  return <details className={styles.briefing}>
    <summary><ThemeThumbnail theme={game.theme} className={styles.briefingPicture}/><span><strong>{ar?game.ar:game.en}</strong><span>{t('كيف نلعب؟ تعرّف على مهمتك','How to play · Discover your mission')}</span></span><ChevronDown size={22} aria-hidden="true"/></summary>
    <ol>
      <li><BookOpen aria-hidden="true"/><div><h3>{t('أجب وتعلّم','Answer and learn')}</h3><p>{t('أجب عن السؤال ثم راجع الإجابة مع المعلّم.','Answer the question, then review it with your teacher.')}</p><p>{ar?game.reward.ar:game.reward.en}</p></div></li>
      <li><Gamepad2 aria-hidden="true"/><div><h3>{t('انطلق في المغامرة','Play your round')}</h3><p>{ar?game.instructions.ar:game.instructions.en}</p><span className={styles.controlsHint}>{mode==='tower'?<ArrowDownToLine size={18}/>:<ArrowLeftRight size={18}/>} {mode==='tower'?t('زر الإسقاط أو مفتاح المسافة','Drop button or Space key'):t('أزرار الاتجاهات أو أسهم لوحة المفاتيح','Direction buttons or arrow keys')}</span>{mode==='runner'&&<p>{t('للقفز: زر «اقفز» أو السهم للأعلى أو مفتاح المسافة.','To jump: use Jump, the Up arrow or Space.')}</p>}</div></li>
      <li><Trophy aria-hidden="true"/><div><h3>{t('تابع تقدّمك','See your progress')}</h3><p>{t('تظهر نقاط اللعب في نهاية الجولة، ثم نعود إلى السؤال التالي.','See your game points after each round, then return to the next question.')}</p><span className={styles.controlsHint}><Gem size={18}/>{t('نقاط اللعب مستقلة عن درجات التعلّم.','Game points are separate from learning marks.')}</span></div></li>
    </ol>
  </details>
}
