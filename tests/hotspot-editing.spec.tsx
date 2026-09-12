import {expect,test} from 'vitest'
import {addAnswerZone,removeAnswerZone,transformZone} from '../src/features/editor/hotspot-editing'
import {parsePayload,type HotspotPayload,type ImageZone} from '../src/shared/questions'
const zone:ImageZone={key:'a',x:.1,y:.1,w:.3,h:.3,shape:'rect'}
const draft:HotspotPayload={mode:'card_to_zone',imageKey:'approved.png',zones:[zone],cards:[{key:'old',text:'Stem'}],map:{old:'a'}}
test('adding a target creates an empty answer mapped to only that target',()=>{
 const next=addAnswerZone(draft,{...zone,key:'b'})
 expect(next.mode).toBe('card_to_zone');if(next.mode!=='card_to_zone')return
 expect(next.cards[0]).toEqual(draft.cards[0]);expect(next.cards[1]?.text).toBe('');expect(next.map[next.cards[1]!.key]).toBe('b')
 expect(parsePayload('hotspot',next).success).toBe(true)
})
test('deleting a target deletes its associated labels and keeps the remaining answers valid',()=>{
 const next=removeAnswerZone(addAnswerZone(draft,{...zone,key:'b'}),'a')
 if(next.mode!=='card_to_zone')throw Error('Wrong mode')
 expect(next.cards.some(c=>c.key==='old')).toBe(false);expect(next.map.old).toBeUndefined()
 expect(parsePayload('hotspot',next).success).toBe(true);expect(removeAnswerZone(next,'b')).toBe(next)
})
test('polygon points move and resize with their bounds and stay on the image',()=>{
 const p:ImageZone={...zone,shape:'polygon',points:[{x:.1,y:.1},{x:.4,y:.1},{x:.4,y:.4}]}
 const moved=transformZone(p,{x:.8,w:.6,y:-1})
 expect(moved.x).toBe(.8);expect(moved.y).toBe(0);expect(moved.w).toBeCloseTo(.2)
 expect(moved.points![2]!.x).toBeCloseTo(1);expect(moved.points![2]!.y).toBeCloseTo(.3)
 expect(parsePayload('hotspot',{...draft,zones:[moved]}).success).toBe(true)
})
test('a full canvas cannot add a thirteenth target or answer',()=>{
 let current:HotspotPayload=draft
 for(let i=1;i<12;i++)current=addAnswerZone(current,{...zone,key:`zone_${i}`})
 expect(current.zones).toHaveLength(12);expect(addAnswerZone(current,{...zone,key:'overflow'})).toBe(current)
})
