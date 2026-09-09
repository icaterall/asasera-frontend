import {test,expect} from '@playwright/test'
import {writeFileSync} from 'node:fs'
test.use({javaScriptEnabled:false})
const apiOrigin=process.env.PW_API_URL??'http://127.0.0.1:4000'
test('Express legal pages remain readable in both languages with JavaScript disabled',async({page})=>{
 const evidence=[]
 for(const path of ['privacy','data-deletion']){
  const response=await page.goto(`${apiOrigin}/${path}`);expect(response?.status()).toBe(200)
  await expect(page.locator('#ar')).toBeVisible();await expect(page.locator('#en')).toBeVisible();await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://asasera.com/${path}`)
  expect(await page.locator('#ar').innerText()).not.toBe('');expect(await page.locator('#en').innerText()).not.toBe('')
  evidence.push({path,status:response!.status(),javaScript:false,arabicVisible:true,englishVisible:true,canonical:`https://asasera.com/${path}`})
 }
 const missing=await page.request.get(`${apiOrigin}/api/v1/unknown-review-route`);expect(missing.status()).toBe(404);expect(missing.headers()['content-type']).toContain('application/json')
 writeFileSync('../asasera-backend/docs/implementation/legal-routing-v4.json',JSON.stringify({pages:evidence,unknownApi404:true},null,2))
})
