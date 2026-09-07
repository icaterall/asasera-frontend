import {test,expect} from '@playwright/test'
import {localShelf} from './local-fixture'
import {writeFileSync} from 'node:fs'
test('empty shelf exits work and a foreign private curriculum can be copied into an available shelf',async({page})=>{
 const f=localShelf(),measurements:unknown[]=[]
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:f.email,password:f.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 await page.request.put('/api/v1/discovery/preferences',{headers,data:{subjectId:1,levelId:f.emptyLevel}})
 const capture=async(file:string,width:number,height:number)=>{await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>document.fonts.ready);const bounds=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,main:document.querySelector('main')!.getBoundingClientRect().toJSON()}));expect(bounds.width).toBe(width);expect(bounds.scrollWidth).toBe(width);measurements.push({file,...bounds});await page.screenshot({path:`../screenshots/v4/${file}`,fullPage:true})}
 await page.goto('/teacher/shelf');await expect(page.getByRole('heading',{name:'This shelf is waiting for its first activity'})).toBeVisible()
 await capture('shelf-empty-1440.png',1440,900)
 await page.getByRole('button',{name:f.activities[1]!.title,exact:true}).click();await expect(page.getByRole('dialog')).toContainText('One plus one equals two');await page.keyboard.press('Escape')
 await page.getByRole('button',{name:/Explore level/}).click();await expect(page.getByRole('heading',{name:'This shelf is waiting for its first activity'})).not.toBeVisible()
 await page.goto('/teacher/shelf');await page.getByRole('combobox',{name:'Level',exact:true}).selectOption(String(f.emptyLevel))
 await expect(page.getByRole('heading',{name:'This shelf is waiting for its first activity'})).toBeVisible();await page.getByRole('button',{name:'Be the first to create here',exact:true}).click();await expect(page).toHaveURL(/\/teacher\/activities$/)
 await page.goto('/teacher/shelf');await page.getByRole('combobox',{name:'Level',exact:true}).selectOption('8')
 const article=page.locator('article').filter({has:page.getByRole('heading',{name:f.activities[0]!.title,exact:true})})
 await expect(article).toBeVisible();await capture('shelf-populated-390.png',390,844)
 await article.getByRole('button',{name:'Copy activity',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Choose a shelf for your copy'});await expect(dialog).toBeVisible();await dialog.getByLabel('Copy destination').selectOption('purpose:2');await dialog.getByRole('button',{name:'Save my copy'}).click()
 await expect(page).toHaveURL(/\/teacher\/activities\/[0-9]+$/);await expect(page.getByLabel('Question text')).toHaveValue('One plus one equals two')
 writeFileSync('../screenshots/v4/shelf-evidence.json',JSON.stringify(measurements,null,2))
})
