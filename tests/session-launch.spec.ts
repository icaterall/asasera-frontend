import {afterEach,expect,it} from 'vitest'
import {retainLiveLaunch,clearLiveLaunch} from '../src/features/session/liveLaunch'
const selection={definitionId:'open-box',definitionVersion:1,adapterVersion:1,contentVersionId:8,selectedQuestionIds:[22],config:{context:'live',semantics:'scored',noRepeat:true,revealPolicy:'host'}}
afterEach(()=>sessionStorage.clear())
it('retains the validated approved launch for reload until creation is acknowledged and rejects a different activity',()=>{
 const first=retainLiveLaunch('request-123',7,{presentation:{selection,rules:{}}})
 expect(first?.selection.contentVersionId).toBe(8)
 expect(retainLiveLaunch('request-123',7,null)).toEqual(first)
 expect(()=>retainLiveLaunch('request-123',9,null)).toThrow(/activity/)
 clearLiveLaunch('request-123')
 expect(retainLiveLaunch('request-123',7,null)).toBeUndefined()
 expect(()=>retainLiveLaunch('request-123',7,{presentation:{bad:true}})).toThrow(/setup/)
})
