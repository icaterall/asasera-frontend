import {useId,useLayoutEffect,useMemo,useRef,useState,type AriaAttributes,type CSSProperties,type ReactNode} from 'react'
import {Select as BaseSelect} from '@base-ui/react/select'
import {Combobox} from '@base-ui/react/combobox'
import {DirectionProvider} from '@base-ui/react/direction-provider'
import {Check,ChevronDown,Search} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {filterSelectOptions,groupSelectOptions,selectOptions,type SelectOption} from './selectOptions'
import styles from './Dropdown.module.css'

export interface SelectProps extends AriaAttributes {
  optionDescriptions?:Record<string,string>
  children:ReactNode
  value?:string|number
  defaultValue?:string|number
  onValueChange?:(value:string)=>void
  onBlur?:()=>void
  id?:string
  name?:string
  form?:string
  autoComplete?:string
  required?:boolean
  disabled?:boolean
  autoFocus?:boolean
  className?:string
  style?:CSSProperties
  title?:string
  dir?:'ltr'|'rtl'|'auto'
  searchable?:boolean
}

/** One styled field for every selection; Base UI owns focus, navigation and dismissal. */
export function Select({children,optionDescriptions,value,defaultValue,onValueChange,onBlur,id:providedId,name,form,autoComplete,required,disabled,autoFocus,className='',style,title,dir,searchable,...aria}:SelectProps) {
  const generatedId=useId(),id=providedId??generatedId,{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const direction=dir==='ltr'||dir==='rtl'?dir:ar?'rtl':'ltr'
  const options=useMemo(()=>selectOptions(children),[children])
  const [localValue,setLocalValue]=useState(defaultValue===undefined?undefined:String(defaultValue))
  const selectedValue=value===undefined?localValue??options.find(option=>!option.disabled)?.value??'':String(value)
  const selected=options.find(option=>option.value===selectedValue)??null
  const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[label,setLabel]=useState<string>()
  const [container,setContainer]=useState<HTMLElement|null>(null)
  const trigger=useRef<HTMLButtonElement>(null),search=useRef<HTMLInputElement>(null)
  const filtered=useMemo(()=>filterSelectOptions(options,query),[options,query])
  const canSearch=searchable??options.length>=8
  const unavailable=disabled||options.length===0
  const placeholder=ar?'اختر من القائمة':'Choose an option'
  // A pending/disabled field must not leave interactive rows in its portal.
  if(unavailable&&open){setOpen(false);setQuery('')}

  // Preserve both wrapping labels and existing label[for] connections during migration.
  useLayoutEffect(()=>{
    const labels=trigger.current?.labels
    const text=Array.from(labels??[]).map(item=>{
      const copy=item.cloneNode(true) as HTMLLabelElement
      copy.querySelectorAll('button,input,select,[data-base-ui-portal]').forEach(node=>node.remove())
      return copy.textContent?.trim()??''
    }).filter(Boolean).join(' ')
    setLabel(text||undefined)
  },[children,i18n.language])
  function change(next:string){
    const option=options.find(option=>option.value===next)
    if(unavailable||!option||option.disabled)return
    setLocalValue(next);onValueChange?.(next)
  }
  function toggle(next:boolean){
    if(next){
      if(unavailable||trigger.current?.matches(':disabled'))return
      const dialog=trigger.current?.closest('dialog')
      setContainer(dialog??(document.fullscreenElement instanceof HTMLElement?document.fullscreenElement:null))
    }else {setQuery('');onBlur?.()}
    setOpen(next)
  }
  const triggerProps={
    ...aria,id,ref:trigger,autoFocus,title,style,'data-select-trigger':'','data-select-value':selectedValue,
    'aria-label':aria['aria-label']??label,'data-placeholder':selectedValue==='',
    className:`${className} ${styles.trigger}`,
    onBlur:()=>{if(!open)onBlur?.()},
  }
  const stopEscape=(event:React.KeyboardEvent)=>{if(event.key==='Escape')event.stopPropagation()}
  const common={id,name,form,autoComplete,required,disabled:unavailable,open,onOpenChange:toggle}
  const groups=groupSelectOptions(canSearch?filtered:options)
  const caption=selected?.label??placeholder
  const selectItem=(option:SelectOption)=><BaseSelect.Item key={option.value} value={option.value} label={option.label} data-option-value={option.value} disabled={option.disabled} className={`${styles.item} ${optionDescriptions?styles.descriptiveItem:''}`}>
    <BaseSelect.ItemText className={styles.itemText} dir="auto">{optionDescriptions?.[option.value]?<><strong>{option.label}</strong><small className={styles.description}>{optionDescriptions[option.value]}</small></>:option.label}</BaseSelect.ItemText><BaseSelect.ItemIndicator className={styles.check}><Check size={18} aria-hidden="true"/></BaseSelect.ItemIndicator>
  </BaseSelect.Item>
  const comboItem=(option:SelectOption)=><Combobox.Item key={option.value} value={option} data-option-value={option.value} disabled={option.disabled} className={`${styles.item} ${optionDescriptions?styles.descriptiveItem:''}`}>
    <span className={styles.itemText} dir="auto">{option.label}</span><Combobox.ItemIndicator className={styles.check}><Check size={18} aria-hidden="true"/></Combobox.ItemIndicator>
  </Combobox.Item>

  return <DirectionProvider direction={direction}>{canSearch?<Combobox.Root<SelectOption> {...common} items={filtered} filter={null} autoHighlight value={selected} onValueChange={option=>change(option?.value??'')} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={option=>option.label} itemToStringValue={option=>option.value} isItemEqualToValue={(a,b)=>a.value===b.value}>
    <Combobox.Trigger {...triggerProps}><span className={styles.value} dir="auto">{caption}</span><ChevronDown size={18} className={styles.chevron} aria-hidden="true"/></Combobox.Trigger>
    <Combobox.Portal container={container??undefined}>
      <Combobox.Positioner sideOffset={8} align="start" collisionPadding={12} className={styles.positioner} dir={direction}>
        <Combobox.Popup className={styles.popup} initialFocus={search} onKeyDown={stopEscape}>
          <div className={styles.search}><Search size={18} aria-hidden="true"/><Combobox.Input ref={search} placeholder={ar?'ابحث في القائمة…':'Search options…'} aria-label={ar?'ابحث في الخيارات':'Search options'} autoComplete="off"/></div>
          <Combobox.Empty className={styles.empty}>{ar?'لا توجد نتائج مطابقة. جرّب كلمة أخرى.':'No matches. Try another word.'}</Combobox.Empty>
          <Combobox.List className={styles.list} aria-label={aria['aria-label']??label??placeholder}>
            {groups.map((group,index)=>group.label?<Combobox.Group key={`${group.label}-${index}`}><Combobox.GroupLabel className={styles.groupLabel}>{group.label}</Combobox.GroupLabel>{group.options.map(comboItem)}</Combobox.Group>:group.options.map(comboItem))}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>:<BaseSelect.Root<string> {...common} modal={false} items={options} value={selectedValue} onValueChange={next=>change(next??'')}>
    <BaseSelect.Trigger {...triggerProps}><BaseSelect.Value className={styles.value} dir="auto">{caption}</BaseSelect.Value><BaseSelect.Icon className={styles.chevron}><ChevronDown size={18} aria-hidden="true"/></BaseSelect.Icon></BaseSelect.Trigger>
    <BaseSelect.Portal container={container??undefined}>
      <BaseSelect.Positioner sideOffset={8} align="start" alignItemWithTrigger={false} collisionPadding={12} className={styles.positioner} dir={direction}>
        <BaseSelect.Popup className={styles.popup} data-descriptive={!!optionDescriptions} onKeyDown={stopEscape}>
          <BaseSelect.List className={styles.list} aria-label={aria['aria-label']??label??placeholder}>
            {groups.map((group,index)=>group.label?<BaseSelect.Group key={`${group.label}-${index}`}><BaseSelect.GroupLabel className={styles.groupLabel}>{group.label}</BaseSelect.GroupLabel>{group.options.map(selectItem)}</BaseSelect.Group>:group.options.map(selectItem))}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  </BaseSelect.Root>}</DirectionProvider>
}
