import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor,within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {createElement,Fragment,useState,type ReactNode} from 'react'
import {Select} from '../src/design/Select'
import {filterSelectOptions,selectOptions} from '../src/design/selectOptions'

const language=createInstance()
beforeAll(async()=>{
  await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}})
  Element.prototype.scrollIntoView=vi.fn()
  vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
})
afterEach(()=>{cleanup();void language.changeLanguage('en')})
const show=(ui:ReactNode)=>render(<I18nextProvider i18n={language}>{ui}</I18nextProvider>)
function Subject({searchable=false,disabled=false}:{searchable?:boolean;disabled?:boolean}){
  const [value,setValue]=useState('')
  return <form aria-label="Activity"><label>Subject<Select name="subject" required value={value} onValueChange={setValue} searchable={searchable} disabled={disabled}>
    <option value="">Choose a subject</option><option value="0">General learning</option>
    <option value="11" data-search-text="Mathematics الرياضيات">Mathematics</option>
    <option value="12" data-search-text="Physics الفيزياء">Physics</option><option disabled value="13">Unavailable subject</option>
  </Select></label><button type="submit">Continue</button><button type="button">Outside</button></form>
}

describe('shared dropdown interaction with synthetic fields',()=>{
  it('keeps wrapping labels, string identifiers and genuine form values',async()=>{
    const user=userEvent.setup();show(<Subject/>)
    const trigger=screen.getByRole('combobox',{name:'Subject'})
    await user.click(trigger);await user.click(await screen.findByRole('option',{name:'Physics'}))
    expect(trigger.textContent).toContain('Physics')
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('12')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
  it('selects with the keyboard and does not select a disabled row',async()=>{
    const user=userEvent.setup();show(<Subject/>)
    const trigger=screen.getByRole('combobox',{name:'Subject'})
    trigger.focus();await user.keyboard('{ArrowDown}')
    await waitFor(()=>expect(document.activeElement?.getAttribute('role')).toBe('option'))
    await user.keyboard('{End}')
    await waitFor(()=>expect(document.activeElement?.getAttribute('aria-disabled')).toBe('true'))
    await user.keyboard('{Enter}')
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('')
    await user.keyboard('{ArrowUp}{Enter}')
    await waitFor(()=>expect(trigger.textContent).toContain('Physics'))
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('12')
  })
  it('Escape closes without committing and returns focus to the field',async()=>{
    const user=userEvent.setup();show(<Subject/>)
    const trigger=screen.getByRole('combobox',{name:'Subject'})
    await user.click(trigger);await user.keyboard('{ArrowDown}{Escape}')
    await waitFor(()=>expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(trigger.textContent).toContain('Choose a subject')
    expect(document.activeElement).toBe(trigger)
  })
  it('supports a searchable list, cross-language lookup, no results and recovery',async()=>{
    const user=userEvent.setup();show(<Subject searchable/>)
    const trigger=screen.getByRole('combobox',{name:'Subject'})
    await user.click(trigger)
    const search=await screen.findByRole('combobox',{name:'Search options'})
    await user.type(search,'unfindable');expect(await screen.findByText('No matches. Try another word.')).toBeTruthy()
    await user.clear(search);await user.type(search,'فِيزْياء')
    await user.click(await screen.findByRole('option',{name:'Physics'}))
    expect(trigger.textContent).toContain('Physics')
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('12')
    await user.click(trigger);expect((await screen.findByRole('combobox',{name:'Search options'}) as HTMLInputElement).value).toBe('')
  })
  it('an outside click dismisses without changing the current value',async()=>{
    const user=userEvent.setup();show(<Subject/>)
    const trigger=screen.getByRole('combobox',{name:'Subject'})
    await user.click(trigger)
    // Opening mounts a portal and then moves focus into it. Wait for that
    // observable ready state before starting a separate outside gesture.
    await screen.findByRole('listbox')
    await waitFor(()=>expect(document.activeElement?.getAttribute('role')).toBe('option'))
    await user.click(screen.getByRole('button',{name:'Outside'}))
    await waitFor(()=>expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(trigger.textContent).toContain('Choose a subject')
  })
  it('disabled controls cannot open and required empty values remain invalid',async()=>{
    const user=userEvent.setup();const {unmount}=show(<Subject disabled/>)
    const disabled=screen.getByRole('combobox',{name:'Subject'}) as HTMLButtonElement
    expect(disabled.disabled).toBe(true);await user.click(disabled);expect(screen.queryByRole('listbox')).toBeNull()
    unmount();show(<Subject/>)
    expect((screen.getByRole('form') as HTMLFormElement).checkValidity()).toBe(false)
    await user.click(screen.getByRole('combobox',{name:'Subject'}));await user.click(await screen.findByRole('option',{name:'General learning'}))
    expect((screen.getByRole('form') as HTMLFormElement).checkValidity()).toBe(true)
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('0')
  })
  it('required searchable fields keep validation and zero-valued identifiers',async()=>{
    const user=userEvent.setup();show(<Subject searchable/>)
    const form=screen.getByRole('form') as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.click(screen.getByRole('combobox',{name:'Subject'}))
    await user.click(await screen.findByRole('option',{name:'General learning'}))
    expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).get('subject')).toBe('0')
  })
  it.each([false,true])('disabling an open %s searchable field dismisses its popup',async(searchable)=>{
    const user=userEvent.setup(),{rerender}=show(<Subject searchable={searchable}/>)
    await user.click(screen.getByRole('combobox',{name:'Subject'}))
    expect(await screen.findByRole('option',{name:'Physics'})).toBeTruthy()
    rerender(<I18nextProvider i18n={language}><Subject searchable={searchable} disabled/></I18nextProvider>)
    await waitFor(()=>expect(screen.queryByRole('listbox')).toBeNull())
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBeNull()
  })
  it.each([false,true])('Tab leaves the %s searchable field and notifies form validation',async(searchable)=>{
    const user=userEvent.setup(),blur=vi.fn()
    show(<><label>Stage<Select searchable={searchable} onBlur={blur}><option value="">Choose a stage</option><option value="school">School</option></Select></label><button type="button">Next field</button></>)
    const trigger=screen.getByRole('combobox',{name:'Stage'})
    await user.click(trigger)
    if(searchable)await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('combobox',{name:'Search options'})))
    else await waitFor(()=>expect(document.activeElement?.getAttribute('role')).toBe('option'))
    await user.keyboard('{Tab}')
    await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('button',{name:'Next field'})))
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(blur).toHaveBeenCalled()
  })
  it('keeps grouped choices and the popup within its native dialog',async()=>{
    const user=userEvent.setup();show(<dialog open aria-label="Copy"><label htmlFor="destination">Destination</label><Select id="destination" defaultValue="" name="destination">
      <option value="">Choose a destination</option><optgroup label="Curriculum"><option value="unit:3">Fractions</option></optgroup><optgroup label="Teaching purpose"><option value="purpose:2">Practice</option></optgroup>
    </Select></dialog>)
    await user.click(screen.getByRole('combobox',{name:'Destination'}))
    const dialog=screen.getByRole('dialog',{name:'Copy'})
    expect(await within(dialog).findByRole('option',{name:'Practice'})).toBeTruthy()
    expect(within(dialog).getByRole('group',{name:'Curriculum'})).toBeTruthy()
  })
  it('keeps Arabic direction in a portaled searchable list',async()=>{
    await language.changeLanguage('ar');const user=userEvent.setup();show(<Subject searchable/>)
    await user.click(screen.getByRole('combobox',{name:'Subject'}))
    const input=await screen.findByRole('combobox',{name:'ابحث في الخيارات'})
    expect(input.closest('[dir]')?.getAttribute('dir')).toBe('rtl')
    await user.type(input,'رياض');await user.keyboard('{ArrowDown}{Enter}')
    await waitFor(()=>expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('subject')).toBe('11'))
  })
})

describe('option migration and search',()=>{
  it('preserves fragments, numerical zero, nested labels and disabled groups',()=>{
    const options=selectOptions(createElement(Fragment,null,
      createElement('option',{value:0},'Level ',0),
      createElement('optgroup',{label:'Unavailable',disabled:true},createElement('option',{value:7},'Level seven')),
      createElement('option',{value:'purpose:2','data-search-text':'Practice تدريب'},'Practice'),
    ))
    expect(options.map(option=>option.value)).toEqual(['0','7','purpose:2'])
    expect(options[0].label).toBe('Level 0');expect(options[1].disabled).toBe(true)
    expect(filterSelectOptions(options,'تدرِيب').map(option=>option.value)).toEqual(['purpose:2'])
  })
})
