/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/wheel.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'

export const wheelEntrySchema=z.object({id:z.string().max(80),label:z.string().min(1).max(120)})
export type WheelEntry=z.infer<typeof wheelEntrySchema>
export const wheelSpinSchema=z.object({
 id:z.string().max(80),entries:z.array(wheelEntrySchema).min(1).max(500),winnerIndex:z.number().int().nonnegative(),
 startedAt:z.number(),durationMs:z.number().min(0).max(6000),fromRotation:z.number(),toRotation:z.number(),
})
export type WheelSpin=z.infer<typeof wheelSpinSchema>
export const wheelStateSchema=z.object({
 visible:z.boolean(),source:z.enum(['participants','custom']),entries:z.array(wheelEntrySchema).max(500),
 avoidRepeats:z.boolean(),pickedIds:z.array(z.string()).max(500),spin:wheelSpinSchema.nullable(),
})
export type WheelState=z.infer<typeof wheelStateSchema>
export const wheelCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('open')}).strict(),z.object({action:z.literal('close')}).strict(),z.object({action:z.literal('reset')}).strict(),
 z.object({action:z.literal('spin'),animate:z.boolean().default(true)}).strict(),
 z.object({action:z.literal('configure'),source:z.enum(['participants','custom']),labels:z.array(z.string().trim().min(1).max(120)).max(100).default([]),avoidRepeats:z.boolean()}).strict(),
])
export type WheelCommand=z.input<typeof wheelCommandSchema>
export function newWheel(source:WheelState['source']='participants'):WheelState{return {visible:false,source,entries:[],avoidRepeats:true,pickedIds:[],spin:null}}
export function eligibleWheelEntries(wheel:WheelState){return wheel.entries.filter(entry=>!wheel.avoidRepeats||!wheel.pickedIds.includes(entry.id))}
export function wheelIsSpinning(wheel:WheelState,now:number){return !!wheel.spin&&now<wheel.spin.startedAt+wheel.spin.durationMs}
const mod=(n:number)=>((n%360)+360)%360
/** The pointer sits at twelve o'clock. Slice zero starts there and extends clockwise. */
export function makeWheelSpin(entries:WheelEntry[],winnerIndex:number,previousRotation:number,now:number,id:string,animate=true):WheelSpin{
 if(!entries.length||winnerIndex<0||winnerIndex>=entries.length||!Number.isInteger(winnerIndex))throw Error('Choose a valid wheel entry.')
 const fromRotation=mod(previousRotation),target=mod(-(winnerIndex+.5)*360/entries.length)
 return {id,entries:structuredClone(entries),winnerIndex,startedAt:now+(animate?250:0),durationMs:animate?4800:0,fromRotation,toRotation:fromRotation+(animate?1800:0)+mod(target-fromRotation)}
}
/** Unbiased choice; callers supply the platform's cryptographic random word. */
export function randomWheelIndex(count:number,word:()=>number):number{
 if(!Number.isInteger(count)||count<1||count>500)throw Error('Add between 1 and 500 entries.')
 const limit=2**32-(2**32%count)
 let value:number
 do{value=word();if(!Number.isInteger(value)||value<0||value>=2**32)throw Error('Invalid random source.')}while(value>=limit)
 return value%count
}
