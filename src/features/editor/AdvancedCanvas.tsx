import {useTranslation} from 'react-i18next'
import {Trash2} from 'lucide-react'
import {Button, Select } from '@/design'
import type {QuestionRecord,QuestionKindWire} from '@/lib/api'
import {parsePayload,type MatchPayload} from '@/shared/questions'
import {HotspotCanvas} from './HotspotCanvas'
import styles from './Editor.module.css'
const key=(prefix:string)=>`${prefix}_${crypto.randomUUID().replace(/-/g,'').slice(0,12)}`
export function defaultPayload(kind:QuestionKindWire,imageKey=''){
  if(kind==='mcq')return {options:['a','b','c','d'].map(k=>({key:`opt_${k}`,text:''})),correct:'opt_a'}
  if(kind==='tf')return {correct:true}
  if(kind==='order')return {items:[{key:'item_a',text:''},{key:'item_b',text:''},{key:'item_c',text:''}],correct:['item_a','item_b','item_c']}
  if(kind==='match')return {cards:[{key:'card_a',text:''},{key:'card_b',text:''}],targets:[{key:'target_a',text:''},{key:'target_b',text:''}],map:{card_a:'target_a',card_b:'target_b'}}
  return {mode:'card_to_zone',imageKey,zones:[{key:'zone_a',x:.35,y:.35,w:.25,h:.2,shape:'rect' as const}],cards:[{key:'card_a',text:''}],map:{card_a:'zone_a'}}
}
function MatchEditor({p,onChange}:{p:MatchPayload;onChange:(p:MatchPayload)=>void}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  return <section className={styles.advanced}><h2>{ar?'البطاقات وأهدافها الصحيحة':'Cards and their correct targets'}</h2><p>{ar?'يمكن أن يستقبل الهدف أكثر من بطاقة.':'A target can receive more than one card.'}</p>
    <div className={styles.matchEditor}><div><h3>{ar?'الأهداف':'Targets'}</h3>{p.targets.map((t,index)=><div className={styles.editRow} key={t.key}><input aria-label={`${ar?'الهدف':'Target'} ${index+1}`} value={t.text} onChange={e=>onChange({...p,targets:p.targets.map(x=>x.key===t.key?{...x,text:e.target.value}:x)})}/><Button variant="quiet" aria-label={ar?'احذف الهدف':'Delete target'} disabled={p.targets.length<=2} onClick={()=>{const targets=p.targets.filter(x=>x.key!==t.key);onChange({...p,targets,map:Object.fromEntries(Object.entries(p.map).map(([c,id])=>[c,id===t.key?targets[0]!.key:id]))})}}><Trash2 size={18}/></Button></div>)}
    <Button disabled={p.targets.length>=8} onClick={()=>onChange({...p,targets:[...p.targets,{key:key('target'),text:''}]})}>{ar?'أضف هدفًا':'Add target'}</Button></div>
    <div><h3>{ar?'البطاقات':'Cards'}</h3>{p.cards.map((c,index)=><div className={styles.cardEditor} key={c.key}><input aria-label={`${ar?'البطاقة':'Card'} ${index+1}`} value={c.text} onChange={e=>onChange({...p,cards:p.cards.map(x=>x.key===c.key?{...x,text:e.target.value}:x)})}/><Select aria-label={`${ar?'هدف البطاقة':'Target for card'} ${index+1}`} value={p.map[c.key]} onValueChange={e=>onChange({...p,map:{...p.map,[c.key]:e}})}>{p.targets.map((t,i)=><option key={t.key} value={t.key}>{t.text||`${ar?'الهدف':'Target'} ${i+1}`}</option>)}</Select><Button variant="quiet" aria-label={ar?'احذف البطاقة':'Delete card'} disabled={p.cards.length<=2} onClick={()=>onChange({...p,cards:p.cards.filter(x=>x.key!==c.key),map:Object.fromEntries(Object.entries(p.map).filter(([id])=>id!==c.key))})}><Trash2 size={18}/></Button></div>)}
    <Button disabled={p.cards.length>=8} onClick={()=>{const id=key('card');onChange({...p,cards:[...p.cards,{key:id,text:''}],map:{...p.map,[id]:p.targets[0]!.key}})}}>{ar?'أضف بطاقة':'Add card'}</Button></div></div>
  </section>
}
/* The wrong-answer reason used to live here as a collapsed section. It moved
   into the verification dialog, where the mistake it describes is chosen — the
   live engine needs a reason AND a link for the same mistake before it will
   offer to treat it, and writing them apart produced silent half-setups. */
export function AdvancedCanvas({activityId,question,onPatch,onPrepare,onApplied}:{activityId:number;question:QuestionRecord;onPatch:(patch:Record<string,unknown>)=>void;onPrepare:()=>Promise<QuestionRecord>;onApplied:()=>Promise<void>}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),parsed=parsePayload(question.kind,question.payload)
  if(!parsed.success)return <p role="alert">{ar?'تعذّر قراءة السؤال':'Could not read this question'}</p>
  const p=parsed.data
  return <>
    {'targets'in p&&<MatchEditor p={p} onChange={payload=>onPatch({payload})}/>}
    {'zones'in p&&<HotspotCanvas activityId={activityId} question={question} p={p} onChange={payload=>onPatch({payload,mediaKey:payload.imageKey})} onConfirm={()=>onPatch({confirmZones:true})} onPrepare={onPrepare} onApplied={onApplied}/>}
  </>
}
