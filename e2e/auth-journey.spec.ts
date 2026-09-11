import {test,expect,type Page} from '@playwright/test'
import {readdirSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import path from 'node:path'

/*
 * v5.1 release closure (C7) — the teacher's first hour in a REAL BROWSER.
 *
 * Register through the signup pages → read the verification link out of the
 * CAPTURED mail file (EMAIL_DELIVERY=capture writes JSON and delivers nothing)
 * → open the link → the account is verified → the USD 1.00 trial allowance is
 * granted exactly once, in the wallet API and on the one screen that shows it
 * → a reload and a fresh sign-in grant nothing more → a second registration
 * with the same address is refused in the interface and by the API.
 *
 * No SQL touches this journey: verification happens by opening the emailed
 * link, exactly as a person would. Recipients are always fake (@example.com)
 * and the token itself is never written to the evidence file or the log.
 *
 * Requires the isolated stack of this package:
 *   API   127.0.0.1:4305  EMAIL_DELIVERY=capture EMAIL_CAPTURE_DIR=$PW_MAIL_DIR
 *   Vite  127.0.0.1:5305  VITE_DEV_API_TARGET=http://127.0.0.1:4305
 * and skips without it, so a plain `npx playwright test` stays green.
 */
const MAIL=process.env.PW_MAIL_DIR??''
const SHOTS=process.env.PW_SHOT_DIR??'./e2e/.artifacts/auth-journey'
test.skip(!MAIL,'Requires the captured-mail stack: PW_MAIL_DIR + EMAIL_DELIVERY=capture on the API')
test.describe.configure({mode:'serial'})

const ALLOWANCE=100_000            // millicents: USD 1.00
const PASSWORD='a release closure passphrase 2026'
/** 1280 is the desktop pass; 390 is an EMULATED narrow viewport, not a physical phone. */
const WIDTHS=[{name:'1280',width:1280,height:900},{name:'390',width:390,height:844}] as const
type Wallet={balanceMillicents:number;reservedMillicents:number;spendableMillicents:number;welcomeGrantClaimed:boolean
  allowanceMillicents:number;exposureMillicents:number;usableMillicents:number;providerCostMillicents:number;trialGrantMillicents:number}
const evidence:Record<string,unknown>[]=[]

/** The newest captured message for this address, with the link it carries. The token never leaves this function. */
function capturedVerification(address:string){
  for(const name of readdirSync(MAIL).filter(f=>f.endsWith('.json')).sort().reverse()){
    const record=JSON.parse(readFileSync(path.join(MAIL,name),'utf8')) as {to:string[];subject:string;text:string;html:string|null;delivered:boolean}
    if(!record.to.includes(address))continue
    const link=/https?:\/\/[^\s"'<>]+\/verify-email\?token=[A-Za-z0-9_-]+/.exec(record.text)?.[0]
    if(link)return {file:path.join(MAIL,name),link,delivered:record.delivered,subject:record.subject,html:record.html??''}
  }
  return null
}
async function shoot(page:Page,screen:string,language:string){
  const taken:string[]=[]
  for(const size of WIDTHS){
    await page.setViewportSize({width:size.width,height:size.height})
    await page.waitForTimeout(120) // let the layout settle at the new width
    const file=`${SHOTS}/${screen}-${language}-${size.name}.png`
    await page.screenshot({path:file,fullPage:true})
    taken.push(file)
  }
  await page.setViewportSize({width:WIDTHS[0].width,height:WIDTHS[0].height})
  return taken
}

for(const language of ['en','ar'] as const){
  const ar=language==='ar'
  const say=(english:string,arabic:string)=>ar?arabic:english

  test(`a teacher registers, verifies from the captured mail and is granted USD 1.00 once (${language})`,async({page})=>{
    test.setTimeout(180_000)
    mkdirSync(SHOTS,{recursive:true})
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
    const address=`qa-v51-${randomUUID()}@example.com`
    await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
    await page.setViewportSize({width:1280,height:900})

    /* 1 — the signup chain, screen by screen, as a person walks it. */
    await page.goto('/signup')
    await expect(page.getByRole('heading',{name:say('Create your account','أنشئ حسابك')})).toBeVisible()
    await page.locator('a[data-role="teacher"]').click()
    await expect(page.locator('.choice-card').first()).toBeVisible({timeout:15_000})
    await page.locator('.choice-card').first().click()
    await expect(page.getByLabel(say('Email address','البريد الإلكتروني'),{exact:true})).toBeVisible()
    await page.getByLabel(say('Email address','البريد الإلكتروني'),{exact:true}).fill(address)
    const signupShots=await shoot(page,'signup',language)
    await page.getByRole('button',{name:say('Continue','متابعة'),exact:true}).click()

    await page.getByLabel(say('Password','كلمة المرور'),{exact:true}).fill(PASSWORD)
    const signedIn=page.waitForResponse(r=>r.url().endsWith('/api/v1/auth/login')&&r.request().method()==='POST')
    await page.getByRole('button',{name:say('Create account','إنشاء الحساب'),exact:true}).click()
    const session=await(await signedIn).json() as {accessToken:string;user:{id:number;role:string;emailVerified:boolean}}
    expect(session.user.role).toBe('teacher')
    expect(session.user.emailVerified).toBe(false)
    await expect(page).toHaveURL(/\/teacher/,{timeout:20_000})
    const bearer={authorization:`Bearer ${session.accessToken}`}

    /* 2 — nothing is granted before the address is confirmed. */
    const unverified=await(await page.request.get('/api/v1/teaching/wallet',{headers:bearer})).json() as Wallet
    expect(unverified.balanceMillicents).toBe(0)
    expect(unverified.welcomeGrantClaimed).toBe(false)
    expect(unverified.trialGrantMillicents).toBe(ALLOWANCE) // advertised, not granted

    /* 3 — the captured message. Written to disk, delivered to nobody. */
    await expect.poll(()=>capturedVerification(address)!==null,{timeout:20_000,message:'a verification message is captured for this address'}).toBe(true)
    const mail=capturedVerification(address)!
    expect(mail.delivered).toBe(false)
    expect(mail.subject.length).toBeGreaterThan(0)
    expect(new URL(mail.link).pathname).toBe('/verify-email')
    expect(mail.html).toContain(mail.link)

    /* 4 — open the emailed link in the browser. No SQL, no API shortcut. */
    await page.goto(mail.link)
    await expect(page.getByRole('heading',{name:say('Your email is verified.','تم تأكيد بريدك الإلكتروني.')})).toBeVisible({timeout:20_000})
    const verifyShots=await shoot(page,'verify',language)
    await page.getByRole('link',{name:say('Continue','متابعة'),exact:true}).click()
    await expect(page).toHaveURL(/\/teacher/,{timeout:20_000})
    expect((await(await page.request.get('/api/v1/auth/me',{headers:bearer})).json()).user.emailVerified).toBe(true)

    /* 5 — the allowance, in the API and then on the screen that shows it. */
    const granted=await(await page.request.get('/api/v1/teaching/wallet',{headers:bearer})).json() as Wallet
    expect(granted.balanceMillicents).toBe(ALLOWANCE)
    expect(granted.usableMillicents).toBe(ALLOWANCE)
    expect(granted.spendableMillicents).toBe(ALLOWANCE)
    expect(granted.allowanceMillicents).toBe(ALLOWANCE)
    expect(granted.exposureMillicents).toBe(0)
    expect(granted.welcomeGrantClaimed).toBe(true)

    const created=await(await page.request.post('/api/v1/activities',{headers:bearer,data:{title:say('Trial allowance — synthetic activity','رصيد التجربة — نشاط تجريبي'),subjectId:1,levelId:8,purposeId:2}})).json()
    await page.goto(`/teacher/activities/${created.activity.id}?generate=1`)
    await page.getByPlaceholder(say('The water cycle — Grade 5','دورة الماء — الصف الخامس')).fill(say('The water cycle','دورة الماء'))
    const cost=page.locator('[aria-live="polite"]').filter({hasText:say('Available','المتاح')}).first()
    await expect(cost).toBeVisible({timeout:20_000})
    // One US$1.00 on the line, and it is the "available" figure: the trial allowance, unspent.
    const costText=(await cost.innerText()).replace(/‏|‎/g,'')
    expect(costText).toMatch(new RegExp(`${say('Available','المتاح')}\\s*(\\$\\s*1\\.00|1\\.00\\s*US\\$)`))
    const walletShots=await shoot(page,'wallet',language)

    /* 6 — granted once: a reload, a re-read and a fresh sign-in add nothing. */
    await page.reload()
    await expect(page).toHaveURL(new RegExp(`/teacher/activities/${created.activity.id}`))
    const reread=await(await page.request.get('/api/v1/teaching/wallet',{headers:bearer})).json() as Wallet
    expect(reread.balanceMillicents).toBe(ALLOWANCE)
    const relogin=await(await page.request.post('/api/v1/auth/login',{data:{email:address,password:PASSWORD}})).json() as {accessToken:string}
    const afterRelogin=await(await page.request.get('/api/v1/teaching/wallet',{headers:{authorization:`Bearer ${relogin.accessToken}`}})).json() as Wallet
    expect(afterRelogin.balanceMillicents).toBe(ALLOWANCE)
    expect(afterRelogin.welcomeGrantClaimed).toBe(true)
    const ledger=await(await page.request.get('/api/v1/teaching/wallet/entries',{headers:{authorization:`Bearer ${relogin.accessToken}`}})).json() as {entries:{kind:string;amountMillicents:number;reason:string|null}[]}
    expect(ledger.entries.filter(e=>e.kind==='grant')).toEqual([{kind:'grant',amountMillicents:ALLOWANCE,jobId:null,reason:'trial_allowance',createdAt:expect.any(String)}])
    const claimAgain=await page.request.post('/api/v1/teaching/wallet/welcome-grant',{headers:{authorization:`Bearer ${relogin.accessToken}`}})
    expect(claimAgain.status()).toBe(409)
    expect((await claimAgain.json()).error.code).toBe('grant_already_claimed')
    expect((await(await page.request.get('/api/v1/teaching/wallet',{headers:{authorization:`Bearer ${relogin.accessToken}`}})).json() as Wallet).balanceMillicents).toBe(ALLOWANCE)

    /* 7 — the same address again: the interface says so before the password step, and the API refuses. */
    const captures=readdirSync(MAIL).length
    await page.goto('/signup/teacher/method')
    await page.getByLabel(say('Email address','البريد الإلكتروني'),{exact:true}).fill(address)
    await page.getByRole('button',{name:say('Continue','متابعة'),exact:true}).click()
    await expect(page.getByText(say('An account with this email already exists.','يوجد حساب مسجّل بهذا البريد الإلكتروني.'),{exact:false})).toBeVisible({timeout:15_000})
    await expect(page).toHaveURL(/\/signup\/teacher\/method$/)
    const duplicate=await page.request.post('/api/v1/auth/register/teacher',{data:{email:address,password:'a different passphrase 2026'}})
    expect(duplicate.status()).toBe(409)
    expect((await duplicate.json()).error.code).toBe('email_taken')
    /* The refusal does not create an account and hands the stranger nothing: what it produces is one
       notice to the address's existing owner, and that message carries no verification link. */
    expect(readdirSync(MAIL).length).toBe(captures+1)
    const notice=JSON.parse(readFileSync(path.join(MAIL,readdirSync(MAIL).sort().at(-1)!),'utf8')) as {to:string[];subject:string;text:string;delivered:boolean}
    expect(notice.to).toEqual([address])
    expect(notice.delivered).toBe(false)
    expect(notice.text).not.toMatch(/\/verify-email\?token=/)
    expect(capturedVerification(address)!.file).toBe(mail.file) // still the one link, unreplaced
    expect((await(await page.request.post('/api/v1/auth/login',{data:{email:address,password:PASSWORD}})).json()).user.role).toBe('teacher')
    expect((await page.request.post('/api/v1/auth/login',{data:{email:address,password:'a different passphrase 2026'}})).status()).toBe(401)

    expect(errors).toEqual([])
    evidence.push({language,address,userId:session.user.id,
      capturedMailFile:mail.file,verificationLinkOrigin:new URL(mail.link).origin,tokenRecorded:false,delivered:mail.delivered,
      walletBeforeVerification:unverified.balanceMillicents,walletAfterVerification:granted.balanceMillicents,
      walletAfterReload:reread.balanceMillicents,walletAfterRelogin:afterRelogin.balanceMillicents,grantEntries:ledger.entries.length,
      uiCostLine:costText,duplicateNoticeSubject:notice.subject,screenshots:{signup:signupShots,verify:verifyShots,wallet:walletShots},
      viewports:'1280 desktop; 390 EMULATED narrow viewport, not a physical phone',pageErrors:errors})
    writeFileSync(`${SHOTS}/auth-journey-evidence.json`,JSON.stringify(evidence,null,2))
  })
}
