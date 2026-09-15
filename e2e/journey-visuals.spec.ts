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
 await expect(page.locator('a[data-role="teacher"]')).toBeVisible()
 await capture(page,'signup-desktop-en')
 await page.getByRole('button',{name:'التبديل إلى العربية',exact:true}).click()
 await page.setViewportSize({width:390,height:844})
 await capture(page,'signup-mobile-ar')
 const email=`visual-${randomUUID()}@example.test`,password='Visual journey passphrase 2026'
 const result=await page.request.post('/api/v1/auth/register/student',{data:{email,password}});expect(result.ok()).toBe(true)
 const login=await page.request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const session=await login.json();appendFileSync(`${state.directory}/owned-users.jsonl`,JSON.stringify({id:session.user.id,role:'student',database:state.database})+'\n',{mode:0o600})
 await page.goto('/login')
 if(await page.getByLabel('Email address',{exact:true}).isVisible()){
  await page.getByLabel('Email address',{exact:true}).fill(email)
  await page.getByLabel('Password',{exact:true}).fill(password)
  await page.getByRole('button',{name:'Sign in',exact:true}).click()
 }
 await page.setViewportSize({width:1440,height:900});await page.goto('/student')
 await expect(page.getByRole('heading',{name:'Welcome to your learning space!',exact:true})).toBeVisible()
 await capture(page,'student-desktop-en')
 await page.getByRole('button',{name:'التبديل إلى العربية',exact:true}).click()
 await page.setViewportSize({width:390,height:844});await capture(page,'student-mobile-ar')
 await page.getByRole('button',{name:'Switch to English',exact:true}).click()
 await page.getByRole('button',{name:/Toggle colour theme/}).click()
 await capture(page,'student-mobile-en-dark')
 const teacher=JSON.parse(readFileSync(`${state.directory}/teacher.json`,'utf8'))
 await page.getByRole('button',{name:/^Account menu/}).click()
 await page.getByRole('menuitem',{name:'Sign out',exact:true}).click()
 await expect(page).toHaveURL(/\/login$/)
 await page.getByLabel('Email address',{exact:true}).fill(teacher.email)
 await page.getByLabel('Password',{exact:true}).fill(teacher.password)
 await page.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(page).toHaveURL(/\/teacher\/dashboard$/)
 await page.setViewportSize({width:1440,height:900})
 await page.getByRole('link',{name:'My activities',exact:true}).first().click()
 await page.getByRole('link',{name:'Learning journey — synthetic activity',exact:true}).click()
 await expect(page.getByLabel('Question text',{exact:true})).toHaveText('What is two plus two?')
 await capture(page,'teacher-editor-desktop-en-dark')
})
