import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react'

export type SaveState = {status:'idle'}|{status:'dirty'}|{status:'saving'}|{status:'saved';at:number}|{status:'failed';error:string;retry:()=>void}
export interface UseAutosaveOptions<T>{save:(value:T)=>Promise<void>;delayMs?:number}

/** Serializes complete values. Explicit flush waits for every queued change and rejects on failure. */
export function useAutosave<T>({save,delayMs=900}:UseAutosaveOptions<T>){
  const [state,setState]=useState<SaveState>({status:'idle'})
  const pending=useRef<{value:T;version:number}|null>(null),version=useRef(0)
  const inFlight=useRef<Promise<void>|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const saveRef=useRef(save);useLayoutEffect(()=>{saveRef.current=save},[save])
  const flushRef=useRef<()=>Promise<void>>(async()=>{})
  const flush=useCallback(():Promise<void>=>{
    if(inFlight.current)return inFlight.current
    if(!pending.current)return Promise.resolve()
    const work=async()=>{
      while(pending.current){
        const next=pending.current;pending.current=null;setState({status:'saving'})
        try{await saveRef.current(next.value)}catch(error){
          pending.current??=next
          setState({status:'failed',error:error instanceof Error?error.message:'تعذّر الحفظ',retry:()=>{void flushRef.current().catch(()=>{})}})
          throw error
        }
      }
      setState({status:'saved',at:Date.now()})
    }
    inFlight.current=work().finally(()=>{inFlight.current=null})
    return inFlight.current
  },[])
  useLayoutEffect(()=>{flushRef.current=flush},[flush])
  const change=useCallback((value:T)=>{
    pending.current={value,version:++version.current};setState({status:'dirty'})
    if(timer.current)clearTimeout(timer.current)
    timer.current=setTimeout(()=>{void flush().catch(()=>{})},delayMs)
  },[delayMs,flush])
  const flushNow=useCallback(async()=>{if(timer.current)clearTimeout(timer.current);await flush()},[flush])
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[])
  const unsaved=['dirty','saving','failed'].includes(state.status)
  useEffect(()=>{if(!unsaved)return;const warn=(event:BeforeUnloadEvent)=>event.preventDefault();window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[unsaved])
  return {state,change,flushNow,unsaved}
}
