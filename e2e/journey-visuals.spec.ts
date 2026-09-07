import {test,expect,type Page} from '@playwright/test'
import {readFileSync,mkdirSync,appendFileSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
const state=process.env.PW_JOURNEY_STATE?JSON.parse(readFileSync(process.env.PW_JOURNEY_STATE,'utf8')):null
test.skip(!state,'Requires the local journey environment')
test.use({baseURL:state?.web??'http://127.0.0.1:5201'})
const directory='.impeccable/review/journeys'
async function capture(page:Page,name:string){
 await page.evaluate(()=>document.fonts.ready)
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:`${directory}/${name}.png`,fullPage:true,animations:'disabled'})
}
test('account and learner layouts in both directions, desktop and phone',async({page})=>{
 test.setTimeout(60_000);mkdirSync(directory,{recursive:true})
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 await page.setViewportSize({width:1440,height:900});await page.goto('/signup')
 await expect(page.getByRole('link',{name:'Teacher',exact:true})).toBeVisible()
 await capture(page,'signup-desktop-en')
 await page.getByRole('button',{name:'التبديل إلى العربية',exact:true}).click()
 await page.setViewportSize({width:390,height:844})
 await capture(page,'signup-mobile-ar')
 const email=`visual-${randomUUID()}@example.test`,password='Visual journey passphrase 2026'
 const result=await page.request.post('/api/v1/auth/register/student',{data:{email,password}});expect(result.ok()).toBe(true)
 const login=await page.request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const session=await login.json();appendFileSync(`${state.directory}/owned-users.jsonl`,JSON.stringify({id:session.user.id,role:'student',database:state.database})+'\n',{mode:0o600})
 await page.setViewportSize({width:1440,height:900});await page.goto('/student')
 await expect(page.getByRole('heading',{name:'Your learning',exact:true})).toBeVisible()
 await capture(page,'student-desktop-en')
 await page.getByRole('button',{name:'التبديل إلى العربية',exact:true}).click()
 await page.setViewportSize({width:390,height:844});await capture(page,'student-mobile-ar')
 await page.getByRole('button',{name:'Switch to English',exact:true}).click()
 await page.getByRole('button',{name:/Toggle colour theme/}).click()
 await capture(page,'student-mobile-en-dark')
 const teacher=JSON.parse(readFileSync(`${state.directory}/teacher.json`,'utf8'))
 await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}})
 await page.setViewportSize({width:1440,height:900});await page.goto(`/teacher/activities/${teacher.activityId}`)
 await expect(page.getByLabel('Question text',{exact:true})).toHaveValue('What is two plus two?')
 await capture(page,'teacher-editor-desktop-en-dark')
})
