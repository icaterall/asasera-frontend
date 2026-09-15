import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {MemoryRouter} from 'react-router-dom'
import {SessionToolbar} from '../src/features/session/SessionToolbar'

vi.mock('qrcode',()=>({default:{toDataURL:vi.fn().mockResolvedValue('data:image/png;base64,QR')}}))

const language=createInstance()
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{brand:{name:'Asasera'}}}}})})
afterEach(cleanup)

const toolbar=(role:'host'|'projector'|'player')=><I18nextProvider i18n={language}><MemoryRouter><SessionToolbar role={role} pin="482915" participants={3} connected ar={false}
 muted={false} enabled full={false} busy={false} canWheel canEnd
 onSound={vi.fn()} onFullscreen={vi.fn()} onLanguage={vi.fn()} onLeave={vi.fn()} onProjector={vi.fn()} onWheel={vi.fn()} onEnd={vi.fn()}/></MemoryRouter></I18nextProvider>

/* A latecomer arrives after the first question opens, when the lobby — the only
   place that ever showed the code — is long gone. Every role reaches it. */
it.each(['host','player'] as const)('opens the join code from the toolbar for the %s',async role=>{
 render(toolbar(role))
 expect(screen.queryByRole('dialog')).toBeNull()
 fireEvent.click(screen.getByRole('button',{name:/Class PIN 482915/}))
 const dialog=await screen.findByRole('dialog',{name:'Join link'})
 expect(within(dialog).getByText('482915')).toBeTruthy()
 expect(within(dialog).getByText(`${location.host}/join?pin=482915`)).toBeTruthy()
 await waitFor(()=>expect(within(dialog).getByRole('img',{name:/Join QR code for PIN 482915/})).toBeTruthy())
 fireEvent.keyDown(document,{key:'Escape'})
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull())
})

it('copies the join link a student can pass on',async()=>{
 const writeText=vi.fn().mockResolvedValue(undefined)
 Object.defineProperty(navigator,'clipboard',{value:{writeText},configurable:true})
 render(toolbar('player'))
 fireEvent.click(screen.getByRole('button',{name:/Class PIN 482915/}))
 fireEvent.click(await screen.findByRole('button',{name:'Copy'}))
 await waitFor(()=>expect(writeText).toHaveBeenCalledWith(`${location.origin}/join?pin=482915`))
 expect(await screen.findByRole('button',{name:'Copied'})).toBeTruthy()
})

it('offers the same code from the session menu',async()=>{
 render(toolbar('player'))
 fireEvent.click(screen.getByRole('button',{name:'Join link and QR code'}))
 expect(await screen.findByRole('dialog',{name:'Join link'})).toBeTruthy()
})
