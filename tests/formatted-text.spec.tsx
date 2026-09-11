import {afterEach,expect,it} from 'vitest'
import {cleanup,render} from '@testing-library/react'
import {FormattedText} from '../src/components/formatted-text/FormattedText'
import {readDocument,writeDocument} from '../src/features/editor/rich-document'
afterEach(cleanup)
it('renders text marks and accessible math while keeping HTML and URLs inert',()=>{
 const {container}=render(<FormattedText text={'**bold** *italic* H~{2}O x^{2} \\(\\frac{1}{2}\\) <img src=x onerror=alert(1)> \\(\\href{javascript:alert(1)}{click}\\)'}/> )
 expect(container.querySelector('strong')?.textContent).toBe('bold');expect(container.querySelector('em')?.textContent).toBe('italic');expect(container.querySelector('sub')?.textContent).toBe('2');expect(container.querySelector('sup')?.textContent).toBe('2');expect(container.querySelector('math')).not.toBeNull();expect(container.querySelector('img,a,script')).toBeNull()
})
it('leaves incomplete notation readable',()=>{const {container}=render(<FormattedText text={'**unfinished \\(invalid{'}/>);expect(container.textContent).toBe('**unfinished \\(invalid{')})
it.each(['H~{2}O','H^{2}O','**Water cycle**','***Both styles***','**H~{2}O**','الماء H~{2}O','Line one\nLine two','\\(\\frac{1}{2}\\)','<script>alert(1)</script>'])('keeps existing saved wording compatible: %s',value=>{
 const doc=readDocument(value)
 expect(writeDocument(doc)).toBe(value)
 expect(doc.content?.[0].type).toBe('paragraph')
})
it('renders combined bold and italic without showing stored delimiters',()=>{
 const {container}=render(<FormattedText text="***Both styles***"/>)
 expect(container.textContent).toBe('Both styles');expect(container.querySelector('strong em')?.textContent).toBe('Both styles')
})
it('converts saved notation into editable text and marks, not source text',()=>{
 const nodes=readDocument('H^{2}O').content?.[0].content
 expect(nodes?.map(n=>n.text).join('')).toBe('H2O')
 expect(nodes?.[1]).toEqual({type:'text',text:'2',marks:[{type:'superscript'}]})
})
