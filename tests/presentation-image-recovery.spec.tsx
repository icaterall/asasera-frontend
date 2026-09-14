import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react'
import {FlashcardContent} from '../src/features/presentations/FlashcardContent'
const language=vi.hoisted(()=>({value:'en'}))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:language.value}})}))
afterEach(()=>{cleanup();language.value='en'})
const question={id:1,qIndex:0,prompt:'Identify the flower.',media:'https://example.com/prompt.png',timeLimitS:20,payload:{kind:'mcq' as const,options:[{key:'a',text:'',image:'https://example.com/flower.png'},{key:'b',text:'Rock'}]}}
it('offers explicit retry for prompt, option and authorized reference images without changing their source or alt',()=>{
 render(<FlashcardContent question={question} revealed correct="a"/>)
 const images=screen.getAllByRole('img')
 expect(images).toHaveLength(3)
 for(const image of images){
  const src=image.getAttribute('src'),alt=image.getAttribute('alt')!
  fireEvent.error(image)
  expect(screen.getByRole('status').textContent).toContain('Image unavailable')
  expect(screen.getByRole('status').textContent).toContain(alt)
  expect(screen.queryByRole('img',{name:alt})).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:`Retry image: ${alt}`}))
  const retry=screen.getByRole('img',{name:alt})
  expect(retry.getAttribute('src')).toBe(src)
  fireEvent.load(retry)
  expect(screen.queryByRole('status')).toBeNull()
 }
})
it('does not retry automatically and a different card does not inherit an earlier image failure',()=>{
 const view=render(<FlashcardContent question={question} revealed={false}/>)
 fireEvent.error(screen.getByRole('img',{name:question.prompt}))
 view.rerender(<FlashcardContent question={question} revealed={false}/>)
 expect(screen.queryByRole('img',{name:question.prompt})).toBeNull()
 expect(screen.queryByRole('region',{name:'Reference answer'})).toBeNull()
 view.rerender(<FlashcardContent question={{...question,media:'https://example.com/new-prompt.png'}} revealed={false}/>)
 expect(screen.getByRole('img',{name:question.prompt}).getAttribute('src')).toBe('https://example.com/new-prompt.png')
 expect(screen.queryByRole('status')).toBeNull()
})
it('localizes unavailable-image recovery and retains Arabic alternative text',()=>{
 language.value='ar'
 render(<FlashcardContent question={question} revealed correct="a"/>)
 const reference=screen.getByRole('region',{name:'الإجابة المرجعية'})
 fireEvent.error(within(reference).getByRole('img',{name:'الصورة الصحيحة، الخيار 1'}))
 expect(within(reference).getByRole('status').textContent).toContain('الصورة غير متاحة')
 expect(within(reference).getByRole('button',{name:'إعادة تحميل الصورة: الصورة الصحيحة، الخيار 1'})).toBeTruthy()
})
