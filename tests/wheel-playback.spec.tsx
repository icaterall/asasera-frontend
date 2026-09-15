import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render} from '@testing-library/react'
import {WheelPlayback} from '../src/features/wheel/WheelPlayback'
import {wheelExitDuration,wheelRotationDuration,WHEEL_ZOOM_MS} from '../src/features/wheel/WheelDisc'
import {makeWheelSpin} from '../src/shared/wheel'

afterEach(()=>{cleanup();vi.unstubAllGlobals()})
const entries=[{id:'a',label:'Ali'},{id:'b',label:'Sara'}]
const spin=makeWheelSpin(entries,0,0,1000,'saved-spin',true)
const clock={now:()=>spin.startedAt+100}

it('fits rotation, zoom and a gradual exit inside the existing server window',()=>{
 expect(wheelRotationDuration(spin)+WHEEL_ZOOM_MS+wheelExitDuration(spin)).toBe(spin.durationMs)
 expect(wheelExitDuration(spin)).toBe(700)
})

it('slides right before fading and cancels animations when removed',()=>{
 const cancel=vi.fn(),calls:Keyframe[][]=[]
 const original=Element.prototype.animate
 Element.prototype.animate=vi.fn((frames)=>{calls.push(frames as Keyframe[]);return {cancel,currentTime:0} as unknown as Animation})
 try{
  const view=render(<div dir="rtl"><WheelPlayback entries={entries} spin={spin} clock={clock} animate/></div>)
  const camera=calls.find(frames=>frames.some(frame=>frame.opacity===0))!
  expect(camera).toBeDefined()
  expect(camera.at(-2)).toMatchObject({transform:'translateX(25%) scale(2.25)',opacity:1})
  expect(camera.at(-1)).toMatchObject({transform:'translateX(110%) scale(2.25)',opacity:0,offset:1})
  view.unmount();expect(cancel).toHaveBeenCalledTimes(2)
 }finally{Element.prototype.animate=original}
})

it('omits the exit movement and fade when motion is disabled',()=>{
 const animate=vi.fn(),original=Element.prototype.animate;Element.prototype.animate=animate
 try{
  const view=render(<WheelPlayback entries={entries} spin={spin} clock={clock} animate={false}/>)
  expect(animate).not.toHaveBeenCalled()
  expect((view.container.querySelector('[data-wheel-playback]>div') as HTMLElement).style.opacity).toBe('1')
 }finally{Element.prototype.animate=original}
})
