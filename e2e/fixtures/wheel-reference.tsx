import {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import '@/index.css'
import '@/design/tokens.css'
import {RandomWheel} from '@/features/wheel/RandomWheel'
import {SessionAudio} from '@/design/audio'
import {eligibleWheelEntries,makeWheelSpin,newWheel,type WheelCommand,type WheelState} from '@/shared/wheel'
const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar'
document.documentElement.lang=ar?'ar':'en';document.documentElement.dir=ar?'rtl':'ltr'
document.documentElement.classList.toggle('dark',params.get('theme')==='dark')
if(params.has('fallback'))Object.defineProperty(HTMLElement.prototype,'requestFullscreen',{value:undefined,configurable:true})
const language=createInstance();await language.init({lng:ar?'ar':'en',resources:{en:{translation:{}},ar:{translation:{}}}})
const names=(ar?['أحمد','علي','يوسف']:['Ahmed','Ali','Yusuf']).map((label,i)=>({id:`student-${i}`,label}))
const questions=(ar?['ما أكبر كوكب؟','ما مصدر الضوء؟','ما عاصمة عُمان؟']:['Which is the largest planet?','What gives us daylight?','What is the capital of Oman?']).map((label,i)=>({id:`question-${i}`,label}))
const clock={now:()=>Date.now()}
const evidence:{ticks:number[];commands:WheelCommand[]}={ticks:[],commands:[]}
Object.assign(window,{wheelEvidence:evidence})
class ObservedAudio extends SessionAudio{override playWheelTick(){evidence.ticks.push(performance.now());super.playWheelTick()}}
function Fixture(){
 const [audio]=useState(()=>new ObservedAudio()),[sound,setSound]=useState(false)
 const [wheel,setWheel]=useState<WheelState>({...newWheel(),visible:true,entries:names})
 async function command(input:WheelCommand){
  evidence.commands.push(input)
  if(input.action==='configure')setWheel(prior=>({...newWheel(input.source),visible:true,entries:input.source==='questions'?questions:input.source==='custom'?(input.labels??[]).map((label,i)=>({id:`custom-${i}`,label})):names,avoidRepeats:input.avoidRepeats,pairQuestions:input.pairQuestions??prior.pairQuestions}))
  if(input.action==='reset')setWheel(prior=>({...prior,pickedIds:[],spin:null}))
  if(input.action==='spin')setWheel(prior=>{const entries=eligibleWheelEntries(prior),spin=makeWheelSpin(entries,Math.min(1,entries.length-1),prior.spin?.toRotation??0,clock.now(),crypto.randomUUID(),input.animate,prior.pairQuestions?questions[0]!:null);return {...prior,spin,pickedIds:[...prior.pickedIds,entries[spin.winnerIndex]!.id]}})
 }
 return <main className="teacher-scope"><RandomWheel wheel={wheel} clock={clock} allowQuestions onCommand={command} audio={audio} soundEnabled={sound} onSound={()=>void audio.unlock().then(ready=>{if(ready){audio.setMuted(sound);setSound(!sound)}})}/></main>
}
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={language}><Fixture/></I18nextProvider>)
