import { useEffect,useRef,useState } from 'react'
import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'
import { getAccessToken,refreshSession } from '@/lib/api'
import { snapshotSchema, type SessionSnapshot,type ServerEvents,type ClientEvents,type CommandName,type CommandInput,type Reply } from '@/shared/session'
import { ServerClock } from './clock'
import type {GameMode} from '@/shared/arcade'

/** Storage says the run already ended while this client was away (v5 §19 honest interruption, reply code 'session_interrupted'). */
export interface InterruptedRun {runId:number;endReason:string|null}
interface LiveState {snapshot:SessionSnapshot|null;connected:boolean;error:string|null;interrupted:InterruptedRun|null;set:(patch:Partial<LiveState>)=>void}
export const useLiveState=create<LiveState>(set=>({snapshot:null,connected:false,error:null,interrupted:null,set:patch=>set(patch)}))
class SessionInterrupted extends Error {constructor(){super('session_interrupted')}}
export const PARTICIPANT_STORAGE='asasera:participant'
export function storedSeat():{runId:number;resumeToken:string}|null {
  try{const s=JSON.parse(sessionStorage.getItem(PARTICIPANT_STORAGE)??'null');return s&&typeof s.runId==='number'&&typeof s.resumeToken==='string'?s:null}catch{return null}
}
export function useSession(options:{role:'host'|'projector'|'player';runId?:number;activityId?:number;requestId?:string;gameMode?:GameMode;projectorToken?:string;onCreated?:(id:number)=>void}) {
  const socketRef=useRef<Socket<ServerEvents,ClientEvents>|null>(null)
  const [clock]=useState(()=>new ServerClock())
  const state=useLiveState()
  const createdRef=useRef(options.onCreated);createdRef.current=options.onCreated
  async function send<K extends CommandName>(event:K,input:CommandInput<K>):Promise<Extract<Reply,{ok:true}>> {
    const socket=socketRef.current
    if(!socket?.connected)throw new Error('Connection lost. Reconnecting… / انقطع الاتصال، جارٍ الاتصال…')
    if(event.startsWith('host:')){
      const token=getAccessToken();let expired=true
      try{expired=!token||JSON.parse(atob(token.split('.')[1]!.replace(/-/g,'+').replace(/_/g,'/'))).exp*1000<Date.now()+60000}catch{/* Refresh unreadable tokens. */}
      if(expired&&!(await refreshSession()))throw new Error('Sign in again to control this class.')
      const accessToken=getAccessToken();if(accessToken)await send('auth:refresh',{accessToken})
    }
    const emitCommand=()=>new Promise<Reply>((resolve,reject)=>{
      const emitter=socket.timeout(10_000)
      const emit=emitter.emit.bind(emitter) as (event:CommandName,input:unknown,ack:(error:Error|null,reply:Reply)=>void)=>void
      emit(event,input,(error,r)=>error?reject(Error('No response. Retry safely. / لم يصل رد، أعد المحاولة.')):resolve(r))
    })
    let reply=await emitCommand()
    // Socket.IO can flush a buffered answer before its reconnect callback has
    // restored the seat (including after a device wall-clock jump). Restore
    // the capability, then retry the identical idempotent answer once.
    if(!reply.ok&&reply.code==='forbidden'&&(event==='player:answer'||event==='player:game')){
      const seat=storedSeat()
      if(seat){await send('player:resume',seat);reply=await emitCommand()}
    }
    if(!reply.ok&&reply.code==='session_interrupted'){
      // Not a connection problem: the class ended without us. Show the ending, drop the seat, no reload banner.
      const runId=typeof input==='object'&&input!==null&&'runId'in input&&typeof input.runId==='number'?input.runId:(options.runId??0)
      sessionStorage.removeItem(PARTICIPANT_STORAGE)
      useLiveState.getState().set({interrupted:{runId,endReason:reply.endReason??null},error:null})
      throw new SessionInterrupted()
    }
    if(!reply.ok)throw new Error(reply.message)
    if(reply.snapshot)accept(reply.snapshot)
    return reply
  }
  function accept(raw:SessionSnapshot) {
    const parsed=snapshotSchema.safeParse(raw)
    if(!parsed.success){useLiveState.getState().set({error:'Invalid session response. Reconnect.'});return}
    const current=useLiveState.getState().snapshot
    if(current?.runId===parsed.data.runId&&current.revision>parsed.data.revision)return
    if(!current)clock.sync(parsed.data.serverNow,performance.now(),performance.now(),true)
    useLiveState.getState().set({snapshot:parsed.data,error:null})
    if(parsed.data.state==='ended')sessionStorage.removeItem(PARTICIPANT_STORAGE)
  }
  useEffect(()=>{
    useLiveState.getState().set({snapshot:null,error:null,connected:false,interrupted:null})
    const socket=io(import.meta.env.VITE_API_URL||undefined,{autoConnect:false,auth:{accessToken:getAccessToken()},withCredentials:true})
    socketRef.current=socket
    let alive=true
    const fail=(error:unknown)=>{if(alive&&!(error instanceof SessionInterrupted))useLiveState.getState().set({error:error instanceof Error?error.message:'Connection failed.'})}
    const synchronize=async()=>{
      clock.reset()
      for(let i=0;i<3&&alive;i++){const sent=performance.now();const reply=await send('clock:sync',{});if(reply.serverNow)clock.sync(reply.serverNow,sent,performance.now())}
    }
    socket.on('connect',()=>{
      useLiveState.getState().set({connected:true,error:null})
      void(async()=>{
        if(options.role==='host') {
          if(options.runId)await send('host:resume',{runId:options.runId})
          else if(options.activityId){const r=await send('host:create',{activityId:options.activityId,requestId:options.requestId??crypto.randomUUID(),gameMode:options.gameMode??'quiz'});if(alive&&r.snapshot)createdRef.current?.(r.snapshot.runId)}
        }else if(options.role==='projector'&&options.runId&&options.projectorToken)await send('projector:join',{runId:options.runId,token:options.projectorToken})
        else if(options.role==='player'){const seat=storedSeat();if(seat)await send('player:resume',seat)}
        await synchronize()
      })().catch(fail)
    })
    socket.on('session:snapshot',accept)
    socket.on('clock:probe',ack=>ack())
    socket.on('disconnect',()=>useLiveState.getState().set({connected:false}))
    socket.on('connect_error',()=>fail(Error('Cannot connect. Retry / تعذّر الاتصال. أعد المحاولة')))
    const visibility=()=>{if(!document.hidden&&socket.connected)void(async()=>{await synchronize();if(useLiveState.getState().snapshot)await send('session:sync',{})})().catch(fail)}
    document.addEventListener('visibilitychange',visibility)
    socket.connect()
    return()=>{alive=false;document.removeEventListener('visibilitychange',visibility);socket.removeAllListeners();socket.disconnect();socketRef.current=null}
    // Session identity, not render-time callbacks, determines connection lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[options.role,options.runId,options.activityId,options.requestId,options.projectorToken,options.gameMode])
  return {...state,send,clock,exit:()=>{sessionStorage.removeItem(PARTICIPANT_STORAGE);useLiveState.getState().set({snapshot:null,error:null,interrupted:null});socketRef.current?.disconnect()}}
}
