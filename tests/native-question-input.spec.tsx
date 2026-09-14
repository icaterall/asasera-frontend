import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QuestionInput} from '../src/features/session/QuestionInput'
import {NativeQuestionInput} from '../src/features/session/NativeQuestionInput'
import type {PublicQuestion} from '../src/shared/session'
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'ar'}})}))
afterEach(cleanup)
const policy={version:1,language:'ar',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'} as const
it('uses accessible native blanks and submits the entered Arabic text without normalizing it in the browser',async()=>{
 const answer=vi.fn(),question:PublicQuestion={id:1,qIndex:0,prompt:'أكمل الجملة',timeLimitS:20,payload:{kind:'cloze',schemaVersion:1,segments:[{kind:'text',text:'نحتاج إلى '},{kind:'blank',blankId:'water'}],policy,trimBoundaryWhitespace:true,wordBank:['مَاء']}}
 render(<QuestionInput question={question} onAnswer={answer}/>)
 const input=screen.getByRole('textbox',{name:'الفراغ 1'})
 await userEvent.type(input,'مَاء')
 await userEvent.click(screen.getByRole('button',{name:'إرسال الإجابة'}))
 expect(answer).toHaveBeenCalledWith({kind:'cloze',values:{water:'مَاء'}})
})
it('shows vocabulary clues without inventing or exposing solutions',async()=>{
 const answer=vi.fn(),question:PublicQuestion={id:2,qIndex:0,prompt:'اكتب الكلمة',timeLimitS:20,payload:{kind:'vocabulary',schemaVersion:1,policy,entries:[{id:'entry_1',clue:'قمر الأرض'}]}}
 render(<QuestionInput question={question} onAnswer={answer}/>)
 await userEvent.type(screen.getByRole('textbox',{name:'قمر الأرض'}),'القمر')
 await userEvent.click(screen.getByRole('button',{name:'إرسال الإجابة'}))
 expect(answer).toHaveBeenCalledWith({kind:'vocabulary',values:{entry_1:'القمر'}})
})
it('keeps an entered cloze alternative distinct from the labelled model answer after submission',async()=>{
 const payload={kind:'cloze',schemaVersion:1,segments:[{kind:'text',text:'نبدأ في '},{kind:'blank',blankId:'time'}],policy,trimBoundaryWhitespace:true} as const
 const view=render(<NativeQuestionInput payload={{...payload,segments:[...payload.segments]}} interactive onAnswer={()=>{}}/>)
 await userEvent.type(screen.getByRole('textbox',{name:'الفراغ 1'}),'النهار')
 await userEvent.click(screen.getByRole('button',{name:'إرسال الإجابة'}))
 view.rerender(<NativeQuestionInput payload={{...payload,segments:[...payload.segments]}} interactive={false} onAnswer={()=>{}} revealed={{time:'الصباح'}}/>)
 const input=screen.getByRole<HTMLInputElement>('textbox',{name:'الفراغ 1'})
 expect(input.value).toBe('النهار')
 expect(input.disabled).toBe(true)
 expect(screen.getByText('إجابة مرجعية: الصباح')).toBeTruthy()
})
it('identifies a remounted cloze model answer as reference, never as the submitted answer',()=>{
 const question:PublicQuestion={id:3,qIndex:0,prompt:'أكمل',timeLimitS:20,payload:{kind:'cloze',schemaVersion:1,segments:[{kind:'blank',blankId:'time'}],policy,trimBoundaryWhitespace:true}}
 render(<QuestionInput question={question} disabled onAnswer={()=>{}} revealed={{time:'الصباح'}}/>)
 const input=screen.getByRole<HTMLInputElement>('textbox',{name:'إجابة مرجعية — الفراغ 1'})
 expect(input.value).toBe('الصباح')
 expect(screen.getByText('إجابة مرجعية: الصباح')).toBeTruthy()
 expect(screen.queryByText('إجابتك')).toBeNull()
})
it.each([false,true])('does not recreate a disabled card bank over saved %s grouping targets',grouped=>{
 const question:PublicQuestion={id:4,qIndex:0,prompt:'صنّف',timeLimitS:20,payload:{kind:'match',cards:[{key:'cat',text:'قطة'},{key:'dog',text:'كلب'}],targets:[{key:'one',text:'المجموعة الأولى'},{key:'two',text:'المجموعة الثانية'}]}}
 render(<QuestionInput question={question} disabled onAnswer={()=>{}} revealed={{cat:'one',dog:grouped?'one':'two'}}/>)
 expect(screen.queryByRole('button',{name:'قطة',exact:true})).toBeNull()
 expect(screen.queryByRole('button',{name:'كلب',exact:true})).toBeNull()
 expect(screen.getByRole('button',{name:'المجموعة الأولى',exact:true}).textContent).toContain('قطة')
 expect(screen.getByRole('button',{name:grouped?'المجموعة الأولى':'المجموعة الثانية',exact:true}).textContent).toContain('كلب')
})
