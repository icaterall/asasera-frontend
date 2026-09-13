/** Accept seconds, minutes:seconds, or hours:minutes:seconds, including Arabic digits. */
export function parseVideoTime(value:string):number|null{
 const text=value.trim().replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776))
 if(!text)return null
 if(!/^\d+(?::\d{1,2}){0,2}$/.test(text))return NaN
 const parts=text.split(':').map(Number)
 if(parts.slice(1).some(n=>n>=60))return NaN
 const seconds=parts.reduce((sum,n)=>sum*60+n,0)
 return Number.isSafeInteger(seconds)&&seconds<=86400?seconds:NaN
}
export function formatVideoTime(seconds:number):string{
 const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60
 return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
