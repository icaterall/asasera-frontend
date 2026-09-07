/** A synchronized wall-clock sample plus monotonic elapsed time; changing Date.now cannot extend a question. */
export class ServerClock {
  private serverAt=0
  private monoAt=0
  private bestRtt=Infinity
  sync(serverNow:number,sent=performance.now(),received=performance.now(),force=false) {
    const rtt=Math.max(0,received-sent)
    if(force||rtt<=this.bestRtt*1.5){this.serverAt=serverNow+Math.min(rtt/2,400);this.monoAt=received;this.bestRtt=rtt}
  }
  now(){return this.serverAt+performance.now()-this.monoAt}
  reset(){this.bestRtt=Infinity}
}
