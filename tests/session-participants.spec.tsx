import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react'
import {ParticipantControls} from '../src/features/session/ParticipantControls'

afterEach(cleanup)
const participants=[{id:'a',name:'Amal',connected:true,wheelExcluded:false,status:'active' as const}]

it('restores focus to the replacement rename button after cancellation and keeps eligibility focus',async()=>{
 render(<ParticipantControls participants={participants} ar={false} disabled={false} onCommand={vi.fn().mockResolvedValue(undefined)}/>)
 fireEvent.click(screen.getByText('Manage participants (1)'))
 fireEvent.click(screen.getByRole('button',{name:'Rename Amal'}))
 fireEvent.click(screen.getByRole('button',{name:'Cancel'}))
 await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('button',{name:'Rename Amal'})))
 fireEvent.click(screen.getByRole('button',{name:'Exclude Amal from wheel'}))
 await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('button',{name:'Exclude Amal from wheel'})))
})

it('renames a participant and changes only wheel eligibility explicitly',async()=>{
 const onCommand=vi.fn().mockResolvedValue(undefined)
 const view=render(<ParticipantControls participants={participants} ar={false} disabled={false} onCommand={onCommand}/>)
 fireEvent.click(screen.getByText('Manage participants (1)'))
 fireEvent.click(screen.getByRole('button',{name:'Rename Amal'}))
 fireEvent.change(screen.getByRole('textbox',{name:'Display name'}),{target:{value:'Amal Ali'}})
 fireEvent.click(screen.getByRole('button',{name:'Save name'}))
 await waitFor(()=>expect(onCommand).toHaveBeenCalledWith('a',{action:'rename',name:'Amal Ali'}))
 fireEvent.click(screen.getByRole('button',{name:'Exclude Amal from wheel'}))
 await waitFor(()=>expect(onCommand).toHaveBeenCalledWith('a',{action:'exclude',excluded:true}))
 view.rerender(<ParticipantControls participants={[{...participants[0]!,wheelExcluded:true}]} ar={false} disabled={false} onCommand={onCommand}/>)
 expect(screen.getByText('Excluded from wheel')).toBeTruthy()
 fireEvent.click(screen.getByRole('button',{name:'Include Amal in wheel'}))
 await waitFor(()=>expect(onCommand).toHaveBeenCalledWith('a',{action:'exclude',excluded:false}))
})

it('requires removal confirmation and preserves the dialog on failure',async()=>{
 const onCommand=vi.fn().mockRejectedValueOnce(Error('Save unavailable')).mockResolvedValue(undefined)
 render(<ParticipantControls participants={participants} ar={false} disabled={false} onCommand={onCommand}/>)
 fireEvent.click(screen.getByText('Manage participants (1)'))
 fireEvent.click(screen.getByRole('button',{name:'Remove Amal'}))
 const dialog=screen.getByRole('dialog',{name:'Remove Amal?'})
 expect(onCommand).not.toHaveBeenCalled()
 expect(within(dialog).getByText(/Saved answers and earned points stay/)).toBeTruthy()
 fireEvent.click(within(dialog).getByRole('button',{name:'Remove participant'}))
 await screen.findByText('Save unavailable')
 expect(dialog.hasAttribute('open')).toBe(true)
 fireEvent.click(within(dialog).getByRole('button',{name:'Remove participant'}))
 await waitFor(()=>expect(onCommand).toHaveBeenCalledTimes(2))
})

it('supports Arabic controls and keeps an empty roster truthful',()=>{
 render(<ParticipantControls participants={[]} ar disabled={false} onCommand={vi.fn()}/>)
 fireEvent.click(screen.getByText('إدارة المشاركين (0)'))
 expect(screen.getByText('لم ينضم أحد بعد.')).toBeTruthy()
 expect(screen.queryByRole('button',{name:/إزالة/})).toBeNull()
})
