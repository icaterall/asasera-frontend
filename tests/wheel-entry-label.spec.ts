import {expect,it} from 'vitest'
import {wheelEntryLabel} from '../src/features/wheel/entryLabel'
it('keeps duplicate names distinguishable using the full roster rather than remaining sectors',()=>{
 const entries=[{id:'a',label:'Sara'},{id:'b',label:'Sara'},{id:'c',label:'Nora'}]
 expect(wheelEntryLabel(entries[0]!,entries,false)).toBe('Sara (Entry 1)')
 expect(wheelEntryLabel(entries[1]!,entries,false)).toBe('Sara (Entry 2)')
 expect(wheelEntryLabel(entries[2]!,entries,false)).toBe('Nora')
 expect(wheelEntryLabel(entries[1]!,[...entries,...entries],true)).toBe('Sara (الخيار 2)')
})
