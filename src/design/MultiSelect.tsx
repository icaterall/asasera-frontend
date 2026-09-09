import {useId,useMemo,useRef,useState,type ReactNode} from 'react'
import {Combobox} from '@base-ui/react/combobox'
import {DirectionProvider} from '@base-ui/react/direction-provider'
import {Check,ChevronDown,Search,X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {filterSelectOptions,groupSelectOptions,selectOptions,type SelectOption} from './selectOptions'
import styles from './Dropdown.module.css'

export function MultiSelect({children,value,onValueChange,label,placeholder,required=false,disabled=false,hint,id:providedId}:{
  children:ReactNode;value:string[];onValueChange:(value:string[])=>void;label:string;placeholder:string;required?:boolean;disabled?:boolean;hint?:string;id?:string
}) {
  const generatedId=useId(),id=providedId??generatedId,{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),direction=ar?'rtl':'ltr'
  const options=useMemo(()=>selectOptions(children),[children])
  const selected=options.filter(option=>value.includes(option.value))
  const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[container,setContainer]=useState<HTMLElement|null>(null)
  const trigger=useRef<HTMLButtonElement>(null),search=useRef<HTMLInputElement>(null)
  const unavailable=disabled||!options.length
  if(unavailable&&open){setOpen(false);setQuery('')}
  const groups=groupSelectOptions(filterSelectOptions(options,query))
  function toggle(next:boolean){
    if(next&&unavailable)return
    if(next)setContainer(trigger.current?.closest('dialog')??(document.fullscreenElement instanceof HTMLElement?document.fullscreenElement:null))
    else setQuery('')
    setOpen(next)
  }
  const change=(next:SelectOption[])=>{if(!unavailable)onValueChange(next.filter(option=>!option.disabled).map(option=>option.value))}
  return <div className={styles.multiField} dir={direction}>
    <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
    <DirectionProvider direction={direction}>
      <Combobox.Root<SelectOption,true> multiple items={filterSelectOptions(options,query)} filter={null} value={selected} onValueChange={change}
        open={open} onOpenChange={toggle} inputValue={query} onInputValueChange={setQuery} required={required} disabled={unavailable}
        itemToStringLabel={option=>option.label} itemToStringValue={option=>option.value} isItemEqualToValue={(a,b)=>a.value===b.value}>
        <Combobox.Trigger id={id} ref={trigger} data-select-trigger="" className={styles.trigger} aria-label={label} aria-describedby={hint?`${id}-hint`:undefined} data-placeholder={!value.length}>
          <span className={styles.value}>{value.length?(ar?`تم اختيار ${value.length}`:`${value.length} selected`):placeholder}</span><ChevronDown size={18} className={styles.chevron} aria-hidden="true"/>
        </Combobox.Trigger>
        <Combobox.Portal container={container??undefined}>
          <Combobox.Positioner sideOffset={8} align="start" collisionPadding={12} className={styles.positioner} dir={direction}>
            <Combobox.Popup className={styles.popup} initialFocus={search} onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation()}}>
              <div className={styles.search}><Search size={18} aria-hidden="true"/><Combobox.Input ref={search} aria-label={ar?'ابحث في الخيارات':'Search options'} placeholder={ar?'ابحث في القائمة…':'Search options…'} autoComplete="off"/></div>
              <Combobox.Empty className={styles.empty}>{ar?'لا توجد نتائج. جرّب كلمة أخرى.':'No matches. Try another word.'}</Combobox.Empty>
              <Combobox.List className={styles.list} aria-label={label}>
                {groups.map((group,index)=><Combobox.Group key={index}>
                  {group.label&&<Combobox.GroupLabel className={styles.groupLabel}>{group.label}</Combobox.GroupLabel>}
                  {group.options.map(option=><Combobox.Item key={option.value} value={option} disabled={option.disabled} data-option-value={option.value} className={styles.item}>
                    <span className={styles.itemText} dir="auto">{option.label}</span><span className={styles.checkbox}><Combobox.ItemIndicator><Check size={16} aria-hidden="true"/></Combobox.ItemIndicator></span>
                  </Combobox.Item>)}
                </Combobox.Group>)}
              </Combobox.List>
              <div className={styles.multiActions}><button type="button" disabled={!value.length} onClick={()=>onValueChange([])}>{ar?'مسح الاختيارات':'Clear selections'}</button><button type="button" onClick={()=>toggle(false)}>{ar?'تم':'Done'}</button></div>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </DirectionProvider>
    {selected.length>0&&<ul className={styles.chips} aria-label={ar?'الاختيارات الحالية':'Current selections'}>{selected.map(option=><li key={option.value}><span dir="auto">{option.label}</span><button type="button" disabled={disabled} aria-label={`${ar?'إزالة':'Remove'} ${option.label}`} onClick={()=>onValueChange(value.filter(id=>id!==option.value))}><X size={16} aria-hidden="true"/></button></li>)}</ul>}
    {hint&&<p id={`${id}-hint`} className={styles.fieldHint}>{hint}</p>}
  </div>
}
