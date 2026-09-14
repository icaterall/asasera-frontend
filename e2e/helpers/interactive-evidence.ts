import {expect,type APIRequestContext,type Browser,type Page} from '@playwright/test'
export type Language='en'|'ar'
export const label=(language:Language,en:string,ar:string)=>language==='ar'?ar:en
export async function teacherFixture(page:Page,request:APIRequestContext,language:Language,questions:Record<string,unknown>[]){
 expect(process.env.PW_BASE_URL).toBe('http://127.0.0.1:5411')
 const email=`bounded-evidence-${crypto.randomUUID()}@example.com`,password=`Synthetic-${crypto.randomUUID()}!`
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic evidence instructor',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const headers={Authorization:`Bearer ${(await login.json()).accessToken}`}
 const made=await request.post('/api/v1/activities',{headers,data:{title:label(language,'Reviewed activity evidence','مراجعة نشاط معتمد'),subjectId:1,levelId:8,purposeId:2,contentLanguage:language}});expect(made.ok()).toBe(true)
 const {activity}=await made.json(),saved=[]
 for(const source of questions){const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:source});expect(added.ok(),await added.text()).toBe(true);saved.push((await added.json()).question)}
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize(language==='ar'?{width:390,height:844}:{width:1440,height:900})
 return {activity,questions:saved,headers,publish:async()=>expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)}
}
export async function assignment(page:Page,activityId:number,language:Language,name:string){
 await page.goto(`/teacher/activities/${activityId}/play?mode=study`)
 await page.getByRole('radio',{name:new RegExp(`^${name}`)}).check()
 await page.getByRole('button',{name:label(language,'Create assignment link','أنشئ رابط المشاركة'),exact:true}).click()
 return page.getByRole('textbox',{name:label(language,'Assignment link','رابط النشاط')}).inputValue()
}
export async function guest(browser:Browser,link:string,language:Language,reducedMotion:'reduce'|'no-preference'='no-preference'){
 const context=await browser.newContext({viewport:language==='ar'?{width:390,height:844}:{width:1440,height:900},hasTouch:language==='ar',reducedMotion})
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 await page.goto(link)
 await page.getByRole('textbox',{name:label(language,'Your name','اسمك')}).fill(label(language,'Synthetic learner','متعلم تجريبي'))
 await page.getByRole('button',{name:label(language,'Start','ابدأ'),exact:true}).click()
 return {context,page,errors}
}
