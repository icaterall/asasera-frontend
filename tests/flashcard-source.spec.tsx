import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import {FlashcardContent,PracticeSourceLine} from '../src/features/presentations/FlashcardContent'
import type {PublicQuestion} from '../src/shared/session'
const locale=vi.hoisted(()=>({language:'en'}))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:locale})}))
afterEach(cleanup)
const question:PublicQuestion={id:1,qIndex:0,prompt:'The moon is a star.',media:null,timeLimitS:20,payload:{kind:'tf',options:[{key:'true',text:'True'},{key:'false',text:'False'}]},sourceContext:{origin:'file',sections:[2,4]}}
for(const language of ['en','ar'])it(`keeps the same permitted source reference on both ${language} faces`,()=>{
 locale.language=language
 const label=language==='ar'?'المصدر: مادة مرفوعة · أقسام المصدر 2، 4':'Source: uploaded material · source sections 2, 4'
 const view=render(<FlashcardContent question={question} revealed={false}/> )
 expect(screen.getByText(label)).toBeTruthy()
 expect(screen.queryByRole('link')).toBeNull()
 view.rerender(<FlashcardContent question={question} revealed correct={false} explanation="A planet is not a star."/> )
 expect(screen.getByText(label)).toBeTruthy()
})
it('does not fabricate a source for a manual question',()=>{
 locale.language='en';const {sourceContext:_,...manual}=question
 render(<FlashcardContent question={manual} revealed={false}/> )
 expect(screen.queryByText(/Source:/)).toBeNull()
})
it('uses only a generic source label for a topic-based question',()=>{
 locale.language='en'
 render(<PracticeSourceLine source={{origin:'topic',sections:[]}}/> )
 expect(screen.getByText('Source: topic-based question')).toBeTruthy()
 expect(screen.queryByRole('link')).toBeNull()
})
