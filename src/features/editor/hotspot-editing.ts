import type {HotspotPayload,ImageZone} from '@/shared/questions'
export const elementKey=(prefix:string)=>`${prefix}_${crypto.randomUUID().replace(/-/g,'').slice(0,12)}`
export function transformZone(zone:ImageZone,patch:Partial<Pick<ImageZone,'x'|'y'|'w'|'h'>>):ImageZone{
 const x=Math.max(0,Math.min(.99,patch.x??zone.x)),y=Math.max(0,Math.min(.99,patch.y??zone.y))
 const w=Math.max(.01,Math.min(1-x,patch.w??zone.w)),h=Math.max(.01,Math.min(1-y,patch.h??zone.h))
 return {...zone,x,y,w,h,...(zone.shape==='polygon'&&zone.points?{points:zone.points.map(p=>({x:x+(p.x-zone.x)/zone.w*w,y:y+(p.y-zone.y)/zone.h*h}))}:{})}
}
export function addAnswerZone(p:HotspotPayload,zone:ImageZone):HotspotPayload{
 if(p.zones.length>=12||(p.mode==='card_to_zone'&&p.cards.length>=12))return p
 if(p.mode==='click_zone')return {...p,zones:[...p.zones,zone],correct:p.zones.length?p.correct:[zone.key]}
 const card={key:elementKey('card'),text:''}
 return {...p,zones:[...p.zones,zone],cards:[...p.cards,card],map:{...p.map,[card.key]:zone.key}}
}
export function removeAnswerZone(p:HotspotPayload,key:string):HotspotPayload{
 if(!p.zones.some(z=>z.key===key))return p
 const zones=p.zones.filter(z=>z.key!==key)
 if(p.mode==='click_zone')return {...p,zones,correct:p.correct.filter(k=>k!==key)}
 const removed=p.cards.filter(c=>p.map[c.key]===key),cards=p.cards.filter(c=>p.map[c.key]!==key)
 return {...p,zones,cards,map:Object.fromEntries(Object.entries(p.map).filter(([c])=>!removed.some(r=>r.key===c)))}
}
export function clearAnswerZones(p:HotspotPayload):HotspotPayload{
 return p.mode==='click_zone'?{...p,zones:[],correct:[]}:{...p,zones:[],cards:[],map:{}}
}
