import {test,expect} from '@playwright/test'
import {localTeacher,isolatedStackOnly} from './local-fixture'
for(const width of [1440,390])test(`editor saves and recovers failed edits ${width}`,async({page})=>{
 isolatedStackOnly();await page.setViewportSize({width,height:1000});const teacher=localTeacher()
 await page.addInitScript(()=>localStorage.setItem('asasera.language','ar'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}});expect(login.ok()).toBeTruthy()
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 const r=await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار حفظ النشاط',subjectId:1,levelId:8,purposeId:2}}),{activity}=await r.json()
 await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:'اختر العدد الزوجي',payload:{options:[{key:'a',text:'2'},{key:'b',text:'3'},{key:'c',text:''},{key:'d',text:''}],correct:'a'}}})
 await page.goto(`/teacher/activities/${activity.id}`)
 const prompt=page.getByRole('textbox',{name:'نص السؤال',exact:true})
 let fail=true
 await page.route('**/api/v1/activities/questions/*',route=>route.request().method()==='PATCH'&&fail?route.fulfill({status:503,json:{error:{code:'upstream',message:'Test outage'}}}):route.continue())
 await prompt.fill('هذا التعديل يجب ألا يضيع')
 await expect(page.getByText('تعذّر الحفظ — تعديلك لم يُفقد')).toBeVisible()
 await expect(prompt).toHaveText('هذا التعديل يجب ألا يضيع')
 await page.reload();await expect(prompt).toHaveText('هذا التعديل يجب ألا يضيع')
 fail=false
 await page.getByRole('button',{name:'حفظ التعديلات المستعادة',exact:true}).click()
 await expect.poll(async()=>{const result=await page.request.get(`/api/v1/activities/${activity.id}`,{headers});return (await result.json()).questions[0].prompt}).toBe('هذا التعديل يجب ألا يضيع')
 await page.reload();await expect(prompt).toHaveText('هذا التعديل يجب ألا يضيع')
 await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
 await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
})
