import {afterEach,beforeAll,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QuestionInput} from '../src/features/session/QuestionInput'
import type {PublicQuestion} from '../src/shared/session'

const language=createInstance()

beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}}},interpolation:{escapeValue:false}})})
afterEach(cleanup)

const question={
  id:1,qIndex:0,prompt:'Match each label to the picture',media:'preview-image.png',timeLimitS:20,
  payload:{
    kind:'hotspot',mode:'card_to_zone',
    zones:[{key:'milk-zone',x:.1,y:.1,w:.25,h:.25,shape:'rect'}],
    cards:[{key:'milk',text:'Milk'}],map:{milk:'milk-zone'},
  },
} as PublicQuestion

test('learner preview accepts a real placement, checks it locally, and locks the completed attempt',()=>{
  const answer=vi.fn()
  render(<I18nextProvider i18n={language}><QuestionInput question={question} onAnswer={answer} preview interactivePreview/></I18nextProvider>)

  const card=screen.getByRole('button',{name:'Milk',exact:true})
  fireEvent.click(card)
  fireEvent.click(screen.getByRole('button',{name:'Zone 1',exact:true}))
  expect(screen.queryByRole('button',{name:'Milk',exact:true})).toBeNull()
  expect(screen.getByRole('button',{name:'Zone 1',exact:true}).textContent).toContain('Milk')
  fireEvent.click(screen.getByRole('button',{name:'Submit answer',exact:true}))

  expect(answer).toHaveBeenCalledWith({kind:'hotspot',picks:[['milk','milk-zone']]})
  expect(screen.getByText('Correct. This is how a learner sees a checked answer.')).toBeTruthy()
  expect(screen.getByRole('button',{name:'Zone 1',exact:true}).hasAttribute('disabled')).toBe(true)
  expect(screen.getByRole('button',{name:'Submit answer',exact:true}).hasAttribute('disabled')).toBe(true)
})
