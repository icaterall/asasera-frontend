import {selectOption} from './select-option'
import {test,expect,type Page} from '@playwright/test'
import {readFileSync,mkdirSync,appendFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {randomUUID} from 'node:crypto'

// Requires scripts/journeys/local-environment.mjs: real SMTP terminates locally.
const environment=process.env.PW_JOURNEY_STATE ? JSON.parse(readFileSync(process.env.PW_JOURNEY_STATE,'utf8')) : {web:'http://127.0.0.1:5201',mailDir:'',directory:'',database:''} as {web:string;mailDir:string;directory:string;database:string}
test.skip(!process.env.PW_JOURNEY_STATE, 'Requires the isolated local SMTP journey environment')
test.use({baseURL:environment.web,actionTimeout:10_000,navigationTimeout:15_000})
const shots='../screenshots/journeys'
mkdirSync(shots,{recursive:true})
const password='Asasera learning journey 2026'
function identity(){return `journey-${randomUUID()}@example.test`}
function ledger(user:{id:number;role:string}){appendFileSync(`${environment.directory}/owned-users.jsonl`,JSON.stringify({id:user.id,role:user.role,database:environment.database})+'\n',{mode:0o600})}
function deliveredLink(email:string,kind:'verify-email'|'reset'){
  const script=`import json,sys,pathlib,email,email.policy,re
for p in sorted(pathlib.Path(sys.argv[1]).glob('*.eml'),reverse=True):
 m=email.message_from_bytes(p.read_bytes(),policy=email.policy.default)
 if sys.argv[2] not in str(m.get('X-Asasera-Intended-To','')): continue
 for part in m.walk():
  if part.get_content_type()!='text/plain': continue
  body=part.get_content()
  for url in re.findall(r'https?://[^\\s<>]+',body):
   if '/'+sys.argv[3]+'?' in url: print(json.dumps(url));sys.exit(0)
print('null')`
  return JSON.parse(execFileSync('python3',['-c',script,environment.mailDir,email,kind],{encoding:'utf8'})) as string|null
}
async function prepare(page:Page,language='en'){
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
}
async function account(page:Page,role:'teacher'|'student'){
  const email=identity()
  await prepare(page)
  await page.goto('/signup')
  await page.getByRole('link',{name:role==='teacher'?'Teacher':'Student',exact:true}).click()
  let stageId:number|undefined
  if(role==='teacher')await page.locator('.choice-card').first().click()
  else{
    const stages=await(await page.request.get('/api/v1/education-stages')).json()
    stageId=(stages.items??stages.stages??stages)[0]?.id
    await page.locator('.tile-grid button').first().click()
  }
  await page.getByLabel('Email address',{exact:true}).fill(email)
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await page.getByLabel('Password',{exact:true}).fill(password)
  const login=page.waitForResponse(r=>r.url().endsWith('/api/v1/auth/login')&&r.request().method()==='POST')
  await page.getByRole('button',{name:'Create account',exact:true}).click()
  const session=await(await login).json()
  expect(session.user.role).toBe(role);ledger(session.user)
  return {email,session,stageId}
}

test('signup shows an actionable error when Continue is clicked before entering an email',async({page})=>{
  await prepare(page);await page.goto('/signup/teacher/method')
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await expect(page.getByText('Enter your email address.',{exact:true})).toBeVisible()
  await expect(page.getByLabel('Email address',{exact:true})).toHaveAttribute('aria-invalid','true')
})

test('student registration keeps the selected level and opens a usable learner destination',async({page})=>{
  const {session,stageId}=await account(page,'student')
  await page.screenshot({path:`${shots}/student-after-signup.png`,fullPage:true})
  expect(stageId).toBeDefined()
  expect(session.user.educationStageId).toBe(stageId)
  await expect(page.getByRole('heading',{name:'Your learning',exact:true})).toBeVisible()
  await expect(page.getByLabel('Game PIN',{exact:true})).toBeVisible()
})

test('teacher registers, follows the actual verification email, creates and publishes from the workspace',async({page})=>{
  test.setTimeout(90_000)
  const {email,session}=await account(page,'teacher')
  await expect(page).toHaveURL(/\/teacher\//)
  await expect.poll(()=>deliveredLink(email,'verify-email')).not.toBeNull()
  const verification=deliveredLink(email,'verify-email')!
  expect(new URL(verification).origin).toBe(environment.web)
  await page.goto(verification)
  await expect(page.getByRole('heading',{name:'Your email is verified.',exact:true})).toBeVisible()
  await page.getByRole('link',{name:'Continue',exact:true}).click()
  await page.getByRole('link',{name:'My activities',exact:true}).first().click()
  await page.getByLabel('Title',{exact:true}).fill('Learning journey — synthetic activity')
  await page.getByRole('button',{name:'Create and start editing',exact:true}).click()
  await page.getByRole('button',{name:'Add question',exact:true}).first().click()
  await page.getByLabel('Question text',{exact:true}).fill('What is two plus two?')
  for(const [i,shape]of ['triangle','diamond','circle','square'].entries())await page.getByLabel(`Answer text ${shape}`,{exact:true}).fill(['Four','Three','Five','Six'][i]!)
  await page.getByRole('button',{name:'Publish',exact:true}).click()
  await expect(page.getByRole('button',{name:'Publish changes',exact:true})).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Question text',{exact:true})).toHaveValue('What is two plus two?')
  const profile=await page.request.get('/api/v1/auth/me',{headers:{authorization:`Bearer ${session.accessToken}`}})
  expect((await profile.json()).user.emailVerified).toBe(true)
  await page.screenshot({path:`${shots}/teacher-published.png`,fullPage:true})
  writeFileSync(`${environment.directory}/teacher.json`,JSON.stringify({email,password,activityId:Number(new URL(page.url()).pathname.split('/').at(-1))}),{mode:0o600})
})

test('the API applies the same twelve-character registration floor shown in the browser',async({page})=>{
  const response=await page.request.post('/api/v1/auth/register/student',{data:{email:identity(),password:'long9word'}})
  expect(response.status()).toBe(422)
})

test('recovery email changes the password, rejects reuse, and returns to a fresh sign-in',async({page})=>{
  test.setTimeout(60_000)
  const {email}=await account(page,'student')
  await expect(page).toHaveURL(/\/student$/)
  await page.goto('/forgot')
  await page.getByLabel('Email address',{exact:true}).fill(email)
  await page.getByRole('button',{name:'Send the link',exact:true}).click()
  await expect.poll(()=>deliveredLink(email,'reset')).not.toBeNull()
  const reset=deliveredLink(email,'reset')!
  await page.goto(reset)
  await page.getByLabel('Password',{exact:true}).fill('A changed journey password 2026')
  await page.getByRole('button',{name:'Save the new password',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Password changed',exact:true}).first()).toBeVisible()
  await page.getByRole('link',{name:'Sign in',exact:true}).click()
  await expect(page.getByLabel('Email address',{exact:true})).toBeVisible()
  await page.getByLabel('Email address',{exact:true}).fill(email)
  await page.getByLabel('Password',{exact:true}).fill('A changed journey password 2026')
  await page.getByRole('button',{name:'Sign in',exact:true}).click()
  await expect(page).toHaveURL(/\/student$/)
  const old=await page.request.post('/api/v1/auth/login',{data:{email,password}})
  expect(old.status()).toBe(401)
  await page.goto(reset)
  await page.getByLabel('Password',{exact:true}).fill('A replay must not change 2026')
  await page.getByRole('button',{name:'Save the new password',exact:true}).click()
  await expect(page.getByRole('alert')).toBeVisible()
})

test('student destination handles bad links and Arabic PINs, role protection, refresh and logout',async({page})=>{
  await account(page,'student')
  await expect(page).toHaveURL(/\/student$/)
  await page.getByRole('button',{name:'Join',exact:true}).click()
  await expect(page.getByText('Enter the six-digit PIN shown by your teacher.',{exact:true})).toBeVisible()
  await page.getByLabel('Activity link',{exact:true}).fill('https://example.com/learn/12345678-1234-1234-1234-123456789012#fake')
  await page.getByRole('button',{name:'Open activity',exact:true}).click()
  await expect(page.getByText('Paste the full Asasera activity link shared by your teacher.',{exact:true})).toBeVisible()
  await page.getByLabel('Game PIN',{exact:true}).fill('١۲٣۴٥۶')
  await page.getByRole('button',{name:'Join',exact:true}).click()
  await expect(page.getByLabel('Class PIN',{exact:true})).toHaveValue('123456')
  await page.goto('/teacher/activities')
  await expect(page).toHaveURL(/\/student$/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/student$/)
  await page.reload()
  await expect(page.getByRole('heading',{name:'Your learning',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Account menu',exact:true}).click()
  await page.getByRole('menuitem',{name:'Sign out',exact:true}).click()
  await page.goto('/student')
  await expect(page).toHaveURL(/\/login$/)
})

test('email sign-in remains usable with unconfigured providers',async({page})=>{
  await prepare(page)
  for(const url of ['/login','/forgot','/reset?token=invalid','/signup/student/method']){
    await page.goto(url)
    await expect(page.locator('a[href*="/auth/google"]')).toHaveCount(0)
    await expect(page.locator('form')).toBeVisible()
  }
})

test('a student can correct their email and verify the actual replacement link',async({page})=>{
 const {email}=await account(page,'student')
 await expect(page).toHaveURL(/\/student$/)
 const next=identity()
 await page.getByRole('button',{name:'Change email',exact:true}).click()
 await page.getByLabel('New email address',{exact:true}).fill(next)
 await page.getByRole('button',{name:'Save and send link',exact:true}).click()
 await expect(page.locator('.verify-banner-email')).toHaveText(next)
 await expect.poll(()=>deliveredLink(next,'verify-email')).not.toBeNull()
 const old=deliveredLink(email,'verify-email')!
 const rejected=await page.request.post('/api/v1/auth/verify-email',{data:{token:new URL(old).searchParams.get('token')}})
 expect(rejected.status()).toBe(400)
 await page.goto(deliveredLink(next,'verify-email')!)
 await expect(page.getByRole('heading',{name:'Your email is verified.',exact:true})).toBeVisible()
 await page.getByRole('link',{name:'Continue',exact:true}).click()
 await expect(page).toHaveURL(/\/student$/)
 await expect(page.locator('.verify-banner')).toHaveCount(0)
 await page.reload()
 await expect(page.locator('.verify-banner')).toHaveCount(0)
})

test('verification success survives an unavailable follow-up profile request',async({page})=>{
 const {email}=await account(page,'teacher')
 await expect(page).toHaveURL(/\/teacher\//)
 await page.route('**/api/v1/auth/me',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{code:'unavailable',message:'Synthetic profile outage'}})}))
 await page.goto(deliveredLink(email,'verify-email')!)
 await expect(page.getByRole('heading',{name:'Your email is verified.',exact:true})).toBeVisible()
})

test('a protected teacher link keeps its complete destination through sign-in',async({page})=>{
 const fixture=JSON.parse(readFileSync(`${environment.directory}/teacher.json`,'utf8'))
 await prepare(page)
 const target=`/teacher/activities/${fixture.activityId}/play?source=journey#play`
 await page.goto(target)
 await expect(page).toHaveURL(/\/login$/)
 await page.getByLabel('Email address',{exact:true}).fill(fixture.email)
 await page.getByLabel('Password',{exact:true}).fill(fixture.password)
 await page.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(page).toHaveURL(environment.web+target)
 await expect(page.getByRole('heading',{name:'How would you like to play?',exact:true})).toBeVisible()
})

test('student profile changes persist and verification resend gives its server cooldown',async({page})=>{
 const {session}=await account(page,'student')
 await expect(page).toHaveURL(/\/student$/)
 await page.getByRole('button',{name:'Verify email',exact:true}).click()
 await page.getByRole('button',{name:'Resend verification email',exact:true}).click()
 await expect(page.getByText(/A message was just sent\. Try again in/)).toBeVisible()
 await page.getByRole('link',{name:'Your study level',exact:true}).click()
 const stages=(await(await page.request.get('/api/v1/education-stages')).json()).stages
 await selectOption(page.getByLabel('Stage',{exact:true}),String(stages.at(-1).id))
 await page.getByRole('button',{name:'Save and continue',exact:true}).click()
 await expect(page).toHaveURL(/\/student$/)
 const me=await(await page.request.get('/api/v1/auth/me',{headers:{authorization:`Bearer ${session.accessToken}`}})).json()
 expect(me.user.educationStageId).toBe(stages.at(-1).id)
 await page.reload()
 await page.getByRole('link',{name:'Your study level',exact:true}).click()
 await expect(page.getByLabel('Stage',{exact:true})).toHaveAttribute('data-select-value',String(stages.at(-1).id))
})

test('duplicate signup offers sign-in without creating a second account',async({page})=>{
 const teacher=JSON.parse(readFileSync(`${environment.directory}/teacher.json`,'utf8'))
 await prepare(page);await page.goto('/signup/student/method')
 await page.getByLabel('Email address',{exact:true}).fill(teacher.email)
 await page.getByRole('button',{name:'Continue',exact:true}).click()
 await expect(page.getByText(/An account with this email already exists/)).toBeVisible()
 await page.locator('[id$="-error"]').getByRole('link',{name:'Sign in',exact:true}).click()
 await expect(page.getByLabel('Email address',{exact:true})).toHaveValue(teacher.email)
 await page.getByLabel('Password',{exact:true}).fill('Wrong journey password 2026')
 await page.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(page.getByRole('alert')).toBeVisible()
 await page.getByLabel('Password',{exact:true}).fill(teacher.password)
 await page.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(page).toHaveURL(/\/teacher\/dashboard$/)
})
