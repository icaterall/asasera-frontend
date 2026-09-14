import type {CommandInput,Reply} from '@/shared/session'

export class SessionCommandError extends Error {
  readonly code:string
  constructor(code:string,message:string){super(message);this.code=code}
}
type HostEvent='host:wheel'|'host:participant'|'host:presentation'
type Pending={event:HostEvent;input:CommandInput<HostEvent>;key:string}
type Send=(event:HostEvent,input:CommandInput<HostEvent>)=>Promise<Extract<Reply,{ok:true}>>

/** One uncertain operation at a time. A newer snapshot cannot change its identity. */
export class DurableHostCommands {
  pending:Pending|null=null
  private inFlight:Promise<Extract<Reply,{ok:true}>>|null=null
  async run<K extends HostEvent>(event:K,input:Omit<CommandInput<K>,'requestId'>,send:Send){
    const {expectedRevision:_,...intent}=input as Omit<CommandInput<'host:wheel'>,'requestId'>
    const key=JSON.stringify([event,intent])
    if(this.pending&&this.pending.key!==key)throw new Error('Retry the pending action first. / أعد محاولة العملية المعلّقة أولًا.')
    this.pending??={event,input:{...input,requestId:crypto.randomUUID()} as CommandInput<HostEvent>,key}
    return this.retry(send)
  }
  async retry(send:Send){
    if(this.inFlight)return this.inFlight
    const pending=this.pending
    if(!pending)throw new Error('No pending action.')
    this.inFlight=(async()=>{
      try{const reply=await send(pending.event,pending.input);this.pending=null;return reply}
      catch(error){
        // Unknown transport/storage outcomes retain the same request. Definite
        // validation/CAS refusals can start again from a freshly synced view.
        if(error instanceof SessionCommandError&&!['internal','internal_error','request_failed','persistence_failed','unavailable','participant_updating','host_disconnected'].includes(error.code))this.pending=null
        throw error
      }finally{this.inFlight=null}
    })()
    return this.inFlight
  }
}
