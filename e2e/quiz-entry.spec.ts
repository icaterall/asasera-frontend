import {test,expect} from '@playwright/test'
import {isolatedStackOnly,localTeacher} from './local-fixture'
const out='../screenshots/quiz-entry'
for(const [lang,width] of [['en',1440],['ar',390]] as const){
 test(`new quiz entry choices and topic ${lang} ${width}`,async({page})=>{
  isolatedStackOnly() // seeds and deletes rows: a throwaway *test* database on a loopback stack only
  await page.setViewportSize({width,height:900});const teacher=localTeacher()
  await page.addInitScript(l=>localStorage.setItem('asasera.language',l),lang)
  expect((await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}})).ok()).toBeTruthy()
  let paid=0;await page.route('**/api/v1/activity-generation/**',r=>{if(r.request().url().endsWith('/quote'))return r.fulfill({json:{quoteId:'11111111-1111-4111-8111-111111111111',quoteExpiresAt:'2999-01-01',estimateMillicents:10,maxAuthorizedMillicents:100,usableMillicents:100000,affordable:true,generationAvailable:true,pricingAvailable:true}});if(r.request().method()==='POST')paid++;return r.fulfill({json:{jobs:[]}})})
  await page.goto('/teacher/activities/new')
  await expect(page.getByRole('button',{name:lang==='en'?'Blank canvas':'صفحة فارغة',exact:true})).toHaveCount(0)
  await page.getByLabel(lang==='en'?'Activity name':'اسم النشاط',{exact:true}).fill(lang==='en'?'Water cycle quiz':'اختبار دورة الماء')
  await page.screenshot({path:`${out}/details-${lang}-${width}.png`,fullPage:true})
  await page.getByRole('button',{name:lang==='en'?'Next':'التالي',exact:true}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button',{name:lang==='en'?'PDF or slides to quiz':'ملف أو شرائح إلى اختبار',exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:lang==='en'?'Blank canvas':'صفحة فارغة',exact:true})).toBeVisible()
  await page.screenshot({path:`${out}/choices-${lang}-${width}.png`,fullPage:true})
  await page.getByRole('button',{name:lang==='en'?'Topic to quiz':'موضوع إلى اختبار',exact:true}).click()
  await expect(page).toHaveURL(/\/teacher\/activities\/\d+/)
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible()
  await dialog.getByLabel(lang==='en'?'Lesson topic':'موضوع الدرس').fill(lang==='en'?'The water cycle':'دورة الماء')
  await expect(dialog.getByRole('button',{name:lang==='en'?'Generate 5 questions with AI':/توليد [٥5] أسئلة بالذكاء الاصطناعي/})).toBeEnabled()
  expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
  await expect(dialog.locator('footer')).toBeInViewport()
  await page.screenshot({path:`${out}/topic-${lang}-${width}.png`})
  expect(paid).toBe(0)
 })
}
test('new quiz file path combines PDF and slides; blank canvas stays manual',async({page})=>{
 const teacher=localTeacher();await page.addInitScript(()=>localStorage.setItem('asasera.language','en'));expect((await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}})).ok()).toBeTruthy()
 await page.route('**/api/v1/activity-generation/**',r=>r.fulfill({json:{jobs:[]}}))
 await page.goto('/teacher/activities/new');await page.getByLabel('Activity name',{exact:true}).fill('Lesson quiz');await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'PDF or slides to quiz',exact:true}).click()
 const d=page.getByRole('dialog');await expect(d).toBeVisible();await expect(d.locator('input[type=file]')).toHaveAttribute('accept',/\.pdf.*\.docx.*\.pptx/)
 await page.screenshot({path:`${out}/upload-en.png`});await d.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/en-water-cycle.pdf');await expect(d).toContainText('en-water-cycle.pdf');await expect(d.getByRole('button',{name:'Change source',exact:true})).toBeVisible();await d.getByRole('button',{name:'Change source',exact:true}).click();await d.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/en-water-cycle.pptx');await expect(d).toContainText('en-water-cycle.pptx');await expect(d.getByText('Slide 1',{exact:true})).toBeAttached()
 await page.goto('/teacher/activities/new');await page.getByLabel('Activity name',{exact:true}).fill('Lesson quiz');await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Blank canvas',exact:true}).click();await expect(page).toHaveURL(/\/teacher\/activities\/\d+/);await expect(page.getByRole('dialog')).toHaveCount(0)
})
