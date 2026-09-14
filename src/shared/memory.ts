/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/memory.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {type MatchPayload} from './questions.ts'
import {markMatch} from './scoring.ts'

const cardId=z.string().regex(/^[a-f0-9]{32}$/)
/** Private durable state. Never send this schema to a student or projector. */
export const memoryBoardSchema=z.object({
 cards:z.array(z.object({id:cardId,side:z.enum(['card','target']),key:z.string(),text:z.string()}).strict()).min(2).max(16),
 revealed:z.array(cardId).max(2),matched:z.array(cardId).max(16),moves:z.number().int().nonnegative(),
}).strict()
export type MemoryBoard=z.infer<typeof memoryBoardSchema>
export const memoryProgressSchema=z.object({totalPairs:z.number().int().min(1).max(8),pairsFound:z.number().int().min(0).max(8),moves:z.number().int().nonnegative(),complete:z.boolean()}).strict()
export const memoryViewSchema=memoryProgressSchema.extend({cards:z.array(z.object({id:cardId,state:z.enum(['hidden','revealed','matched']),text:z.string().optional()}).strict()).min(2).max(16),turn:z.enum(['first','second','mismatch','complete'])}).strict()
export type MemoryView=z.infer<typeof memoryViewSchema>
export type MemoryCommand={action:'flip';cardId:string}|{action:'continue'}
export class MemoryError extends Error{
 readonly code:'memory_turn'|'memory_card'
 constructor(code:'memory_turn'|'memory_card',message:string){super(message);this.name='MemoryError';this.code=code}
}

/** Caller validates approved native-memory compatibility and supplies server randomness. */
export function createMemoryBoard(payload:MatchPayload,random:{id:()=>string;integer:(exclusiveMax:number)=>number}):MemoryBoard{
 const cards=[...payload.cards.map(card=>({id:random.id(),side:'card' as const,key:card.key,text:card.text})),...payload.targets.map(target=>({id:random.id(),side:'target' as const,key:target.key,text:target.text}))]
 for(let i=cards.length-1;i>0;i--){const j=random.integer(i+1);[cards[i],cards[j]]=[cards[j]!,cards[i]!]}
 return memoryBoardSchema.parse({cards,revealed:[],matched:[],moves:0})
}

/** One authoritative transition for independent practice and teacher-led boards. */
export function updateMemoryBoard(previous:MemoryBoard,payload:MatchPayload,command:MemoryCommand):MemoryBoard{
 const board=structuredClone(previous)
 if(command.action==='continue'){
  if(board.revealed.length!==2)throw new MemoryError('memory_turn','There is no unmatched pair to close.')
  board.revealed=[]
  return board
 }
 if(board.revealed.length>=2)throw new MemoryError('memory_turn','Read both cards, then continue before another flip.')
 const card=board.cards.find(card=>card.id===command.cardId)
 if(!card||board.matched.includes(card.id)||board.revealed.includes(card.id))throw new MemoryError('memory_card','That card is not available to flip.')
 board.revealed.push(card.id)
 if(board.revealed.length===2){
  board.moves++
  const first=board.cards.find(card=>card.id===board.revealed[0])!
  if(first.side!==card.side){
   const source=first.side==='card'?first:card,target=first.side==='target'?first:card
   // Preserve native reviewed truth and declared equivalence; never invent pair facts.
   const evaluated=markMatch(payload,{kind:'match',pairs:Object.entries({...payload.map,[source.key]:target.key})})
   if(evaluated.correct){board.matched.push(...board.revealed);board.revealed=[]}
  }
 }
 return board
}
export function memoryProgress(board:MemoryBoard){return {totalPairs:board.cards.length/2,pairsFound:board.matched.length/2,moves:board.moves,complete:board.matched.length===board.cards.length}}
/** Only revealed/matched text leaves the server; side/key/native map never do. */
export function projectMemoryBoard(board:MemoryBoard):MemoryView{
 return { ...memoryProgress(board),turn:board.matched.length===board.cards.length?'complete':board.revealed.length===2?'mismatch':board.revealed.length===1?'second':'first',cards:board.cards.map(card=>{
  const state=board.matched.includes(card.id)?'matched':board.revealed.includes(card.id)?'revealed':'hidden'
  return {id:card.id,state,...(state==='hidden'?{}:{text:card.text})}
 })}
}
