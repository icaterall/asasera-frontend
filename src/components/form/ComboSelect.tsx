import {useId} from 'react'
import {Select} from '@/design'
import {useAuthCopy} from '@/copy/useAuthCopy'
import type {ReferenceOption} from '@/lib/api'

type ComboSelectProps={
  label:string;placeholder:string;value:string;error?:string;disabled?:boolean;name:string;
  options:ReferenceOption[];loading:boolean;failed:boolean;onRetry:()=>void;
  onChange:(value:string)=>void;onBlur:()=>void;
}

/** Registration uses the same searchable control and preserves bilingual API lookup. */
export function ComboSelect({label,placeholder,value,error,disabled,name,options,loading,failed,onRetry,onChange,onBlur}:ComboSelectProps){
  const id=useId(),{c,lang}=useAuthCopy(),empty=!loading&&!failed&&options.length===0
  const status=loading?c.common.loading:failed?c.common.loadError:empty?c.common.unavailable:placeholder
  return <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold" style={{color:'var(--ink)'}}>{label}</label>
    <Select id={id} name={name} searchable value={value} onValueChange={onChange} onBlur={onBlur} disabled={disabled||loading||failed||empty} aria-invalid={error?true:undefined} aria-describedby={error?`${id}-error`:undefined}>
      <option value="">{status}</option>
      {options.map(option=><option key={option.id} value={option.id} data-search-text={`${option.name_ar} ${option.name_en}`}>{lang==='ar'?option.name_ar:option.name_en}</option>)}
    </Select>
    {failed&&<button type="button" onClick={onRetry} className="self-start text-xs font-semibold underline" style={{color:'var(--brand-blue)'}}>{c.common.retry}</button>}
    {error&&<p id={`${id}-error`} role="alert" className="text-xs font-medium leading-relaxed" style={{color:'var(--danger)'}}>{error}</p>}
  </div>
}
