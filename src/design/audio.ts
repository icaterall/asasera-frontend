import {Howl,Howler} from 'howler'
export type SoundEvent='lobby'|'question'|'tick'|'select'|'lock'|'correct'|'incorrect'|'podium'
const cues:Record<SoundEvent,{ms:number;notes:number[]}>= {
 lobby:{ms:1050,notes:[196,247,294]},question:{ms:300,notes:[330,440,660]},
 tick:{ms:45,notes:[880]},select:{ms:80,notes:[620]},lock:{ms:250,notes:[440,220]},
 correct:{ms:600,notes:[392,494,587]},incorrect:{ms:400,notes:[330,262]},podium:{ms:1500,notes:[262,330,392,523,659]},
}
let cached:{url:string;sprite:Record<string,[number,number]>}|undefined
/** An original synthesized PCM sprite; Howler owns playback and Web Audio unlock. */
function soundSprite(){
 if(cached)return cached
 const rate=22050,sprite:Record<string,[number,number]>={};let duration=0
 for(const [name,cue] of Object.entries(cues)){sprite[name]=[duration,cue.ms];duration+=cue.ms+50}
 const samples=Math.ceil(duration*rate/1000),buffer=new ArrayBuffer(44+samples*2),view=new DataView(buffer)
 const word=(at:number,s:string)=>[...s].forEach((c,i)=>view.setUint8(at+i,c.charCodeAt(0)))
 word(0,'RIFF');view.setUint32(4,36+samples*2,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,samples*2,true)
 for(const [name,cue] of Object.entries(cues)){
  const start=Math.round(sprite[name]![0]*rate/1000),count=Math.floor(cue.ms*rate/1000),noteLength=cue.ms/cue.notes.length/1000
  for(let n=0;n<count;n++){
   const t=n/rate,index=Math.min(cue.notes.length-1,Math.floor(t/noteLength)),local=t-index*noteLength,envelope=Math.min(1,local/.008)*Math.max(0,1-local/noteLength)
   const wave=(2/Math.PI)*Math.asin(Math.sin(2*Math.PI*cue.notes[index]!*t))
   view.setInt16(44+(start+n)*2,Math.round(wave*envelope*16000),true)
  }
 }
 let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
 cached={url:`data:audio/wav;base64,${btoa(binary)}`,sprite};return cached
}
/** One player per document; construction creates no audio context. */
export class SessionAudio {
 private sound:Howl|null=null
 private loop:ReturnType<typeof setInterval>|null=null
 private lobbySound:number|null=null
 muted=localStorage.getItem('asasera:mute')==='true'
 unlock(){
  // The game remains playable when a browser cannot provide Web Audio.
  if(typeof AudioContext==='undefined')return false
  try{
   if(!this.sound){const {url,sprite}=soundSprite();this.sound=new Howl({src:[url],format:['wav'],sprite,html5:false,preload:true,volume:.24,mute:this.muted})}
   void Howler.ctx?.resume().catch(()=>{})
   return Howler.usingWebAudio
  }catch{return false}
 }
 setMuted(muted:boolean){this.muted=muted;localStorage.setItem('asasera:mute',String(muted));this.sound?.mute(muted)}
 play(event:SoundEvent){if(this.muted||!this.sound)return;const id=this.sound.play(event);if(event==='lobby')this.lobbySound=id}
 lobby(participants:number){this.stopLoop();this.loop=setInterval(()=>{if(!document.hidden)this.play('lobby')},Math.max(2200,4200-participants*30))}
 stopLoop(){if(this.loop)clearInterval(this.loop);this.loop=null;if(this.lobbySound!==null)this.sound?.stop(this.lobbySound);this.lobbySound=null}
 dispose(){this.stopLoop();this.sound?.unload();this.sound=null}
}
