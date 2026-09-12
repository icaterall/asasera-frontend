import {expect,test} from 'vitest'
import {DEFAULT_LANGUAGE,languageFromBrowser,resolveLanguage} from '../src/i18n/languages'

test('uses Arabic and RTL for Arabic browser or device locales',()=>{
 for(const locale of ['ar','ar-OM','AR-eg']){
  expect(languageFromBrowser(locale)).toMatchObject({code:'ar',dir:'rtl'})
 }
})

test('uses English and LTR for every other browser or device locale',()=>{
 for(const locale of [undefined,'en-US','fr-FR','de']){
  expect(languageFromBrowser(locale)).toMatchObject({code:'en',dir:'ltr'})
 }
 expect(DEFAULT_LANGUAGE).toBe('en')
 expect(resolveLanguage('unknown')).toMatchObject({code:'en',dir:'ltr'})
})
