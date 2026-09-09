import {Children, Fragment, isValidElement, type ReactNode} from 'react'

export interface SelectOption {
  value:string
  label:string
  disabled:boolean
  group?:string
  searchText:string
}
type OptionProps={children?:ReactNode;value?:string|number;label?:string;disabled?:boolean;'data-search-text'?:string}
function textOf(children:ReactNode):string {
  return Children.toArray(children).map(child=>isValidElement<{children?:ReactNode}>(child)?textOf(child.props.children):String(child)).join('')
}

/** Keep the existing option declarations as data, including API values and disabled groups. */
export function selectOptions(children:ReactNode,group?:string,groupDisabled=false):SelectOption[] {
  return Children.toArray(children).flatMap(child=>{
    if(!isValidElement<OptionProps>(child))return []
    const p=child.props
    if(child.type===Fragment)return selectOptions(p.children,group,groupDisabled)
    if(child.type==='optgroup')return selectOptions(p.children,p.label,groupDisabled||!!p.disabled)
    if(child.type!=='option')return []
    const label=p.label??textOf(p.children)
    return [{value:String(p.value??label),label,disabled:groupDisabled||!!p.disabled,group,searchText:p['data-search-text']??label}]
  })
}

const normalize=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').replace(/ـ/g,'').toLocaleLowerCase().trim()
export function filterSelectOptions(options:SelectOption[],query:string):SelectOption[] {
  const words=normalize(query).split(/\s+/).filter(Boolean)
  return words.length?options.filter(option=>words.every(word=>normalize(`${option.label} ${option.searchText} ${option.group??''}`).includes(word))):options
}

export function groupSelectOptions(options:SelectOption[]) {
  const groups:{label?:string;options:SelectOption[]}[]=[]
  for(const option of options){
    const last=groups.at(-1)
    if(last&&last.label===option.group)last.options.push(option)
    else groups.push({label:option.group,options:[option]})
  }
  return groups
}
