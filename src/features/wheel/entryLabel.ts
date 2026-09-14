import type {WheelEntry} from '@/shared/wheel'

/** Duplicate wording is not identity. Use the numbered roster, not the shrinking draw bag. */
export function wheelEntryLabel(entry:WheelEntry,roster:readonly WheelEntry[],ar:boolean):string{
 const identities=[...new Map(roster.map(item=>[item.id,item])).values()]
 if(identities.filter(item=>item.label===entry.label).length<2)return entry.label
 const position=identities.findIndex(item=>item.id===entry.id)+1
 return `${entry.label} (${ar?'الخيار':'Entry'} ${position})`
}
