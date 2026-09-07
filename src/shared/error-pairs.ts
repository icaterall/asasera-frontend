/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/error-pairs.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {parsePayload,type QuestionKind} from './questions.ts'
export interface ErrorPairSlot {elementKey:string;wrongTargetKey:string|null;label:string}
/** Valid observed mistakes, keyed exactly as server marking records them. */
export function errorPairSlots(kind:QuestionKind,payload:unknown):ErrorPairSlot[]{
  const parsed=parsePayload(kind,payload);if(!parsed.success)return []
  const p=parsed.data
  if('options'in p)return p.options.filter(o=>o.key!==p.correct).map(o=>({elementKey:o.key,wrongTargetKey:null,label:o.text||o.key}))
  if(kind==='tf'&&'correct'in p)return [{elementKey:p.correct?'false':'true',wrongTargetKey:null,label:p.correct?'False / خطأ':'True / صح'}]
  if('items'in p)return p.items.flatMap(item=>p.correct.flatMap((key,index)=>key!==item.key?[{elementKey:item.key,wrongTargetKey:String(index),label:`${item.text||item.key} → ${index+1}`}]:[]))
  if('cards'in p){const targets='targets'in p?p.targets:p.zones.map((z,i)=>({key:z.key,text:String(i+1)}));return p.cards.flatMap(card=>targets.filter(t=>t.key!==p.map[card.key]).map(t=>({elementKey:card.key,wrongTargetKey:t.key,label:`${card.text||card.key} → ${t.text}`})))}
  if('zones'in p&&'correct'in p)return p.zones.filter(z=>!p.correct.includes(z.key)).map(z=>({elementKey:z.key,wrongTargetKey:null,label:z.key}))
  return []
}
