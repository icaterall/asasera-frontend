/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/arcade.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'

export const gameModeSchema=z.enum(['quiz','runner','tower','treasure'])
export type GameMode=z.infer<typeof gameModeSchema>
export type ArcadeMode=Exclude<GameMode,'quiz'>
export const arcadeActionSchema=z.enum(['left','right','up','down','jump','drop'])
export type ArcadeAction=z.infer<typeof arcadeActionSchema>
const blockSchema=z.object({x:z.number(),z:z.number(),w:z.number(),d:z.number()})
export const arcadeStateSchema=z.object({
 mode:z.enum(['runner','tower','treasure']),round:z.number().int(),seed:z.number().int(),
 startedAt:z.number(),endsAt:z.number(),finished:z.boolean(),sequence:z.number().int(),lastInputAt:z.number(),
 points:z.number().int().nonnegative(),power:z.number().int().nonnegative(),boosted:z.boolean(),
 x:z.number(),z:z.number(),jumpAt:z.number(),lastRow:z.number().int(),hits:z.number().int(),
 collected:z.array(z.number().int()),blocks:z.array(blockSchema),
 event:z.enum(['ready','move','jump','gem','shield','hit','blocked','placed','perfect','miss','chest','finished']),eventAt:z.number(),
})
export type ArcadeState=z.infer<typeof arcadeStateSchema>
export const arcadeInputSchema=z.object({round:z.number().int().nonnegative(),sequence:z.number().int().positive(),action:arcadeActionSchema}).strict()
export type ArcadeInput=z.infer<typeof arcadeInputSchema>
export const gameStandingSchema=z.object({id:z.string(),name:z.string(),points:z.number(),correctCount:z.number(),connected:z.boolean()})
export const arcadeViewSchema=z.object({mode:gameModeSchema,round:z.number(),startedAt:z.number(),endsAt:z.number(),self:arcadeStateSchema.nullable(),leaders:z.array(gameStandingSchema),watch:arcadeStateSchema.nullable(),watchName:z.string(),totalPlayers:z.number()})
export type ArcadeView=z.infer<typeof arcadeViewSchema>
export const ARCADE_DURATION_MS=24_000
export const ARCADE_COUNTDOWN_MS=3_000
export const RUNNER_ROW_MS=1000
export const RUNNER_ROWS=20
export function seeded(seed:number,index:number){let n=(Math.imul(seed+1,1664525)+Math.imul(index+7,1013904223))|0;n^=n>>>16;n=Math.imul(n,0x45d9f3b);n^=n>>>16;return (n>>>0)/4294967296}
export function runnerRow(seed:number,row:number){return {lane:Math.floor(seeded(seed,row)*3),kind:(row%3===2?'obstacle':'gem') as 'obstacle'|'gem'}}
export const TREASURE_WALLS=[9,10,16,25,32,33,39]
export const TREASURE_MINES=[11,17,31,40]
export function treasureGems(seed:number){return [2,5,8,13,18,22,26,29,36].sort((a,b)=>seeded(seed,a)-seeded(seed,b)).slice(0,7)}
export function movingBlock(state:ArcadeState,now:number):{x:number;z:number;w:number;d:number;axis:'x'|'z'}{
 const previous=state.blocks.at(-1)!,axis=state.blocks.length%2===1?'x':'z'
 const cycle=((Math.max(0,now-state.startedAt)/1900)%2),offset=(cycle<=1?cycle:2-cycle)*6-3
 return {...previous,[axis]:offset,axis}
}
export function createArcade(mode:ArcadeMode,round:number,seed:number,correct:boolean,now:number):ArcadeState{
 const startedAt=now+ARCADE_COUNTDOWN_MS
 return {mode,round,seed,startedAt,endsAt:startedAt+ARCADE_DURATION_MS,finished:false,sequence:0,lastInputAt:0,points:0,power:mode==='runner'?(correct?2:0):mode==='tower'?(correct?4:2):(correct?24:16),boosted:correct,x:mode==='runner'?1:3,z:6,jumpAt:0,lastRow:-1,hits:0,collected:[],blocks:[{x:0,z:0,w:2.8,d:2.8}],event:'ready',eventAt:now}
}
function event(s:ArcadeState,value:ArcadeState['event'],now:number){s.event=value;s.eventAt=now}
/** All scoring uses server time and discrete inputs. Clients never submit positions or scores. */
export function advanceArcade(prior:ArcadeState,now:number):ArcadeState{
 const s=structuredClone(prior)
 if(s.finished||now<s.startedAt)return s
 if(s.mode==='runner'){
  const last=Math.min(RUNNER_ROWS-1,Math.floor((Math.min(now,s.endsAt)-s.startedAt)/RUNNER_ROW_MS)-2)
  for(let row=s.lastRow+1;row<=last;row++){
   const item=runnerRow(s.seed,row),impact=s.startedAt+(row+2)*RUNNER_ROW_MS
   if(item.lane===s.x){
    if(item.kind==='gem'){s.points+=100;s.collected.push(row);event(s,'gem',impact)}
    else if(!(s.jumpAt<=impact&&s.jumpAt+850>impact)){
     if(s.power>0){s.power--;event(s,'shield',impact)}else{s.hits++;s.points=Math.max(0,s.points-25);event(s,'hit',impact)}
    }
   }
   s.lastRow=row
  }
 }
 if(now>=s.endsAt){s.finished=true;event(s,'finished',s.endsAt)}
 return s
}
export function inputArcade(prior:ArcadeState,input:ArcadeInput,now:number):ArcadeState{
 const s=advanceArcade(prior,now)
 if(input.round!==s.round)throw Error('This game round has ended. Reconnect to continue.')
 if(input.sequence<=s.sequence)return s
 if(input.sequence!==s.sequence+1)throw Error('Game controls are synchronizing. Try again.')
 if(s.finished||now<s.startedAt)return s
 s.sequence=input.sequence
 if(now-s.lastInputAt<120)return s
 s.lastInputAt=now
 if(s.mode==='runner'){
  if(input.action==='left'||input.action==='right'){s.x=Math.max(0,Math.min(2,s.x+(input.action==='left'?-1:1)));event(s,'move',now)}
  if(input.action==='jump'&&now-s.jumpAt>=1050){s.jumpAt=now;event(s,'jump',now)}
 }else if(s.mode==='tower'&&input.action==='drop'&&s.power>0){
  const moving=movingBlock(s,now),previous=s.blocks.at(-1)!,axis=moving.axis,dimension=axis==='x'?'w':'d'
  const offset=moving[axis]-previous[axis],perfect=Math.abs(offset)<.18,overlap=previous[dimension]-Math.abs(offset)
  s.power--
  if(overlap<=.15){s.hits++;event(s,'miss',now)}
  else{
   s.blocks.push({...previous,[axis]:perfect?previous[axis]:(moving[axis]+previous[axis])/2,[dimension]:perfect?previous[dimension]:overlap})
   s.points+=perfect?150:100;event(s,perfect?'perfect':'placed',now)
  }
  if(s.power===0)s.finished=true
 }else if(s.mode==='treasure'&&s.power>0){
  const delta:Partial<Record<ArcadeAction,[number,number]>>={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]},d=delta[input.action]
  if(d){
   const x=s.x+d[0],z=s.z+d[1],tile=z*7+x
   if(x<0||x>6||z<0||z>6||TREASURE_WALLS.includes(tile)){event(s,'blocked',now);return s}
   s.x=x;s.z=z;s.power--;event(s,'move',now)
   if(treasureGems(s.seed).includes(tile)&&!s.collected.includes(tile)){s.collected.push(tile);s.points+=100;s.power+=2;event(s,'gem',now)}
   if(TREASURE_MINES.includes(tile)){s.hits++;s.power=Math.max(0,s.power-2);event(s,'hit',now)}
   if(tile===3&&s.collected.length>=3){s.points+=300;s.finished=true;event(s,'chest',now)}
   if(s.power===0)s.finished=true
  }
 }
 return s
}
export function finishArcade(state:ArcadeState,now:number){const s=advanceArcade(state,now);s.finished=true;return s}
