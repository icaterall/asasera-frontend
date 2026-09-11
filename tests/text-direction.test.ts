import {describe,expect,it} from 'vitest'
import {authoringDirection,firstStrongDirection} from '../src/lib/textDirection'

describe('authoring direction',()=>{
 it('follows the interface language while the field is still empty',()=>{
  expect(authoringDirection('',true)).toBe('rtl')
  expect(authoringDirection('',false)).toBe('ltr')
 })
 it('keeps an Arabic placeholder on the right even in the English interface',()=>{
  expect(authoringDirection('   ',true)).toBe('rtl')
  expect(authoringDirection('؟',true)).toBe('rtl')
 })
 it('follows the first strong letter the author typed',()=>{
  expect(authoringDirection('ما هي حماية البيانات؟',false)).toBe('rtl')
  expect(authoringDirection('What is data protection?',true)).toBe('ltr')
 })
 it('ignores digits and inline authoring syntax',()=>{
  expect(firstStrongDirection('123')).toBeNull()
  expect(authoringDirection('١٢٣ طالبًا',false)).toBe('rtl')
  expect(authoringDirection('\\(x^2+1\\) تساوي',false)).toBe('rtl')
  expect(authoringDirection('~{a}',true)).toBe('ltr')
 })
})
