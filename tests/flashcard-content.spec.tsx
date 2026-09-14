import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen,within} from '@testing-library/react'
import {FlashcardContent} from '../src/features/presentations/FlashcardContent'
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(cleanup)
it('includes an authorized image-only choice in the revealed reference answer',()=>{
 render(<FlashcardContent question={{id:1,qIndex:0,prompt:'Which image shows a flower?',media:null,timeLimitS:20,payload:{kind:'mcq',options:[{key:'a',text:'',image:'https://example.com/flower.png'},{key:'b',text:'Rock'}]}}} revealed correct="a"/> )
 const reference=screen.getByLabelText('Reference answer')
 expect(within(reference).getByRole('img',{name:'Correct image, option 1'}).getAttribute('src')).toBe('https://example.com/flower.png')
})
it('makes a false statement an explicit true-or-false task without changing its content',()=>{
 render(<FlashcardContent question={{id:1,qIndex:0,prompt:'The moon is a star.',media:null,timeLimitS:20,payload:{kind:'tf',options:[{key:'true',text:'True'},{key:'false',text:'False'}]}}} revealed={false}/> )
 expect(screen.getByText('True or false?')).toBeTruthy()
 expect(screen.queryByLabelText('Reference answer')).toBeNull()
})
