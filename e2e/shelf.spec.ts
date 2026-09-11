import {selectOption} from './select-option'
import {test,expect} from '@playwright/test'
import {localShelf} from './local-fixture'
import {writeFileSync} from 'node:fs'
/*
 * The shelf became "Explore activities" (`/teacher/shelf` redirects to
 * `/teacher/discover`), so the copy and the controls moved. The two things
 * this test exists to guard did not:
 *
 *  1. an empty shelf is never a dead end — it names a way to create here and
 *     a neighbouring stage that does have something;
 *  2. an activity filed under someone else's PRIVATE curriculum unit can still
 *     be copied: the fork is refused with `choose_shelf`, the teacher picks a
 *     destination they do own, and the copy opens in the editor with its
 *     question intact.
 */
test('empty shelf exits work and a foreign private curriculum can be copied into an available shelf',async({page})=>{
 const f=localShelf(),measurements:unknown[]=[]
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:f.email,password:f.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 await page.request.put('/api/v1/discovery/preferences',{headers,data:{subjectId:1,levelId:f.emptyLevel}})
 const capture=async(file:string,width:number,height:number)=>{await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>document.fonts.ready);const bounds=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,main:document.querySelector('main')!.getBoundingClientRect().toJSON()}));expect(bounds.width).toBe(width);expect(bounds.scrollWidth).toBe(width);measurements.push({file,...bounds});await page.screenshot({path:`../screenshots/v4/${file}`,fullPage:true})}
 const empty=page.getByRole('heading',{name:'Nothing shared here just yet'})
 const stage=page.getByRole('combobox',{name:'Stage or grade',exact:true})
 await page.goto('/teacher/shelf');await expect(empty).toBeVisible()
 await capture('shelf-empty-1440.png',1440,900)
 /* Exit one: the neighbouring stage the empty state points at. */
 await page.getByRole('button',{name:/^Explore /}).click();await expect(empty).not.toBeVisible()
 /* Exit two: creating here. The same words appear in the banner, so read the empty state itself. */
 await page.goto('/teacher/shelf');await selectOption(stage,String(f.emptyLevel))
 await expect(empty).toBeVisible();await page.locator('[class*=empty]').getByRole('link',{name:'Create activity',exact:true}).click();await expect(page).toHaveURL(/\/teacher\/activities\/new$/)
 /* The preview a teacher reads before copying anything. */
 await page.goto('/teacher/shelf');await selectOption(stage,'7')
 const neighbour=page.locator('article').filter({has:page.getByRole('heading',{name:f.activities[1]!.title,exact:true})})
 await expect(neighbour).toBeVisible();await neighbour.getByRole('button',{name:'Preview',exact:true}).click()
 await expect(page.getByRole('dialog')).toContainText('One plus one equals two');await page.keyboard.press('Escape')
 await page.goto('/teacher/shelf');await selectOption(stage,'8')
 const article=page.locator('article').filter({has:page.getByRole('heading',{name:f.activities[0]!.title,exact:true})})
 await expect(article).toBeVisible();await capture('shelf-populated-390.png',390,844)
 await article.getByRole('button',{name:'Make a copy',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Save your copy'});await expect(dialog).toBeVisible();await selectOption(dialog.getByLabel('Organize your activity'),'purpose:2');await dialog.getByRole('button',{name:'Save copy'}).click()
 await expect(page).toHaveURL(/\/teacher\/activities\/[0-9]+$/);await expect(page.getByLabel('Question text')).toHaveText('One plus one equals two')
 writeFileSync('../screenshots/v4/shelf-evidence.json',JSON.stringify(measurements,null,2))
})
