import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render} from '@testing-library/react'
import {PlacementFeedback} from '../src/features/presentations/PlacementFeedback'
import {interactiveMotion} from '../src/shared/interactive-motion'
const motion=vi.hoisted(()=>({enabled:true}))
vi.mock('../src/features/activity-themes/useActivityMotion',()=>({useActivityMotion:()=>motion}))
afterEach(()=>{cleanup();vi.restoreAllMocks();motion.enabled=true})
it('animates only changed placement, cancels on replacement/unmount, and never on initial display',()=>{
 const cancel=vi.fn(),animate=vi.fn().mockReturnValue({cancel})
 Object.defineProperty(HTMLElement.prototype,'animate',{value:animate,configurable:true})
 const view=render(<PlacementFeedback value="">Place here</PlacementFeedback>)
 expect(animate).not.toHaveBeenCalled()
 view.rerender(<PlacementFeedback value="one">First item</PlacementFeedback>)
 expect(animate).toHaveBeenCalledWith(expect.any(Array),{duration:interactiveMotion.duration.placement,easing:interactiveMotion.easing.enter})
 view.rerender(<PlacementFeedback value="one">First item</PlacementFeedback>)
 expect(animate).toHaveBeenCalledTimes(1)
 view.rerender(<PlacementFeedback value="two">Second item</PlacementFeedback>)
 expect(cancel).toHaveBeenCalledTimes(1)
 view.unmount();expect(cancel).toHaveBeenCalledTimes(2)
})
it('keeps identical readable content with reduced motion or missing animation support',()=>{
 motion.enabled=false
 const animate=vi.fn();Object.defineProperty(HTMLElement.prototype,'animate',{value:animate,configurable:true})
 const view=render(<PlacementFeedback value="">Place here</PlacementFeedback>)
 view.rerender(<PlacementFeedback value="one">First item</PlacementFeedback>)
 expect(animate).not.toHaveBeenCalled();expect(view.container.textContent).toBe('First item')
 motion.enabled=true;Object.defineProperty(HTMLElement.prototype,'animate',{value:undefined,configurable:true})
 view.rerender(<PlacementFeedback value="two">Second item</PlacementFeedback>)
 expect(view.container.textContent).toBe('Second item')
})
