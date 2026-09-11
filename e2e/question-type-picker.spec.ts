import {test,expect} from '@playwright/test'
import {localTeacher,isolatedStackOnly} from './local-fixture'
for(const width of [1440,390])test(`visual question types ${width}`,async({page})=>{
 isolatedStackOnly();await page.setViewportSize({width,height:900});const teacher=localTeacher()
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}});expect(login.ok()).toBeTruthy();const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 const r=await page.request.post('/api/v1/activities',{headers,data:{title:'Question type picker fixture',subjectId:1,levelId:8,purposeId:2}});expect(r.ok()).toBeTruthy();const {activity}=await r.json()
 const q=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:'Which number is even?',payload:{options:[{key:'a',text:'2'},{key:'b',text:'3'},{key:'c',text:'5'},{key:'d',text:'7'}],correct:'a'}}});expect(q.ok()).toBeTruthy()
 await page.goto(`/teacher/activities/${activity.id}`)
 if(width<1000)await page.getByRole('button',{name:'Properties',exact:true}).click()
 await page.getByRole('button',{name:'Question type',exact:true}).click()
 const dialog=page.getByRole('dialog',{name:'Choose question type'});await expect(dialog).toBeVisible()
 await expect(dialog.getByRole('button',{name:'Quiz',exact:true})).toHaveAttribute('aria-pressed','true')
 await expect(dialog.getByRole('button',{name:'Type answer Not available yet'})).toBeDisabled()
 expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
 await page.screenshot({path:`../screenshots/question-types-${width}.png`})
 await dialog.getByRole('button',{name:'True or false',exact:true}).click();await expect(dialog).toHaveCount(0)
 await expect(page.getByRole('button',{name:'Question type',exact:true})).toContainText('True or false')
})
