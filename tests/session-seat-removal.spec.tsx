import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {act,cleanup,renderHook,waitFor} from '@testing-library/react'
const boundary=vi.hoisted(()=>({handlers:new Map<string,Function>(),commands:[] as string[],resumeRemoved:false,disconnect:vi.fn(),connected:false}))
vi.mock('socket.io-client',()=>({io:()=>({
 get connected(){return boundary.connected},
 on(event:string,fn:Function){boundary.handlers.set(event,fn)},
 connect(){boundary.connected=true;boundary.handlers.get('connect')?.()},
 disconnect(){boundary.connected=false;boundary.disconnect();boundary.handlers.get('disconnect')?.()},
 removeAllListeners(){boundary.handlers.clear()},
 timeout(){return {emit(event:string,_input:unknown,ack:Function){boundary.commands.push(event);ack(null,event==='player:resume'&&boundary.resumeRemoved?{ok:false,code:'participant_removed',message:'Removed'}:{ok:true,serverNow:1000})}}},
})}))
vi.mock('../src/lib/api',()=>({getAccessToken:()=>null,refreshSession:vi.fn()}))
import {PARTICIPANT_STORAGE,useLiveState,useSession} from '../src/features/session/useSession'

beforeEach(()=>{boundary.handlers.clear();boundary.commands=[];boundary.resumeRemoved=false;boundary.disconnect.mockClear();sessionStorage.clear()})
afterEach(cleanup)

it('drops the revoked seat and stops reconnection when the removal event arrives',async()=>{
 sessionStorage.setItem(PARTICIPANT_STORAGE,JSON.stringify({runId:3,resumeToken:'seat-token'}))
 const {result}=renderHook(()=>useSession({role:'player'}))
 await waitFor(()=>expect(boundary.commands).toContain('player:resume'))
 act(()=>boundary.handlers.get('participant:removed')?.({runId:3,participantId:'a'}))
 expect(sessionStorage.getItem(PARTICIPANT_STORAGE)).toBeNull()
 expect(result.current.removed).toBe(true)
 expect(result.current.snapshot).toBeNull()
 expect(result.current.connected).toBe(false)
 expect(boundary.disconnect).toHaveBeenCalledOnce()
 act(()=>boundary.handlers.get('session:snapshot')?.({runId:3}))
 expect(useLiveState.getState().error).toBeNull()
 expect(result.current.snapshot).toBeNull()
})

it('treats a rejected revoked-seat resume as removal, not a retryable outage',async()=>{
 boundary.resumeRemoved=true
 sessionStorage.setItem(PARTICIPANT_STORAGE,JSON.stringify({runId:3,resumeToken:'seat-token'}))
 const {result}=renderHook(()=>useSession({role:'player'}))
 await waitFor(()=>expect(result.current.removed).toBe(true))
 expect(sessionStorage.getItem(PARTICIPANT_STORAGE)).toBeNull()
 expect(result.current.error).toBeNull()
 expect(boundary.commands.filter(name=>name==='player:resume')).toHaveLength(1)
})

it('does not react to a learner removal event on a host connection',async()=>{
 const {result}=renderHook(()=>useSession({role:'host'}))
 await waitFor(()=>expect(result.current.connected).toBe(true))
 act(()=>boundary.handlers.get('participant:removed')?.({runId:3,participantId:'a'}))
 expect(result.current.removed).toBe(false)
 expect(boundary.disconnect).not.toHaveBeenCalled()
})
