import {Howl,Howler} from 'howler'
import {buildDrySoundSprite,type SoundEvent} from './dry-sounds.ts'
export type {SoundEvent} from './dry-sounds.ts'
let cached:{url:string;sprite:Record<string,[number,number]>}|undefined
/** Dry mechanical PCM effects; Howler owns playback and Web Audio unlock. */
function soundSprite(){
 if(cached)return cached
 const {bytes,sprite}=buildDrySoundSprite()
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
 cached={url:`data:audio/wav;base64,${btoa(binary)}`,sprite};return cached
}
/** One player per document; construction creates no audio context. */
export class SessionAudio {
 private sound:Howl|null=null
 private lobbySound:number|null=null
 private lobbyParticipants:number|null=null
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
 lobby(participants:number){
  if(this.lobbyParticipants!==null&&participants>this.lobbyParticipants&&!document.hidden)this.play('lobby')
  this.lobbyParticipants=participants
 }
 stopLoop(){if(this.lobbySound!==null)this.sound?.stop(this.lobbySound);this.lobbySound=null}
 dispose(){this.stopLoop();this.lobbyParticipants=null;this.sound?.unload();this.sound=null}
}
