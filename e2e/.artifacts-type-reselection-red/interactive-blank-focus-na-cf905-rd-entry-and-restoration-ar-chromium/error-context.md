# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-blank-focus.spec.ts >> native question type dialog preserves keyboard entry and restoration ar
- Location: e2e/interactive-blank-focus.spec.ts:67:44

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByRole('textbox', { name: 'الإجابات المقبولة للفراغ 1', exact: true })
Expected: "كتابًا"
Received: "الماء"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" getByRole('textbox', { name: 'الإجابات المقبولة للفراغ 1', exact: true }) with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'الإجابات المقبولة للفراغ 1', exact: true })
    14 × locator resolved to <textarea rows="2" dir="auto" maxlength="2407">الماء</textarea>
       - unexpected value "الماء"

```

```yaml
- textbox "الإجابات المقبولة للفراغ 1": الماء
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test'
  2  | import {assignment,guest,label,teacherFixture} from './helpers/interactive-evidence'
  3  | test.use({trace:'off'})
  4  | const policy={version:1,language:'ar',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'}
  5  | test('Arabic native blanks survive whole-grapheme insertion, removal, formatted prompt normalization and approved delivery',async({page,request,browser})=>{
  6  |  test.setTimeout(60000)
  7  |  const source={kind:'cloze',prompt:'أكمل نص المراجعة.',payload:{schemaVersion:1,policy,trimBoundaryWhitespace:true,segments:[{kind:'text',text:'نقرأ '},{kind:'blank',blankId:'anchor'},{kind:'text',text:' ونلتقي مُعَلِّمًا.'}],blanks:[{id:'anchor',acceptedAnswers:['كتابًا']}]}}
  8  |  const fixture=await teacherFixture(page,request,'ar',[source]);await fixture.publish()
  9  |  await page.goto(`/teacher/activities/${fixture.activity.id}`)
  10 |  const passage=page.getByRole('textbox',{name:'جزء النص 2',exact:true}),make=page.getByRole('button',{name:'حوّل النص المحدد إلى فراغ',exact:true})
  11 |  await passage.fill(' ونلتقي مُعَلِّمًا.')
  12 |  // Native textarea selection is the actual supported authoring boundary.
  13 |  await passage.evaluate((element)=>{const input=element as HTMLTextAreaElement;input.focus();input.setSelectionRange(8,9);input.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}))})
  14 |  await expect(make).toBeDisabled();await expect(page.getByRole('status').filter({hasText:'حدّد الحرف مع حركاته كاملةً.'})).toBeVisible()
  15 |  await passage.evaluate((element)=>{const input=element as HTMLTextAreaElement,start=input.value.indexOf('مُعَلِّمًا');input.focus();input.setSelectionRange(start,start+'مُعَلِّمًا'.length);input.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}))})
  16 |  await expect(make).toBeEnabled();await make.click()
  17 |  await expect(page.getByRole('textbox',{name:'الإجابات المقبولة للفراغ 2',exact:true})).toHaveValue('مُعَلِّمًا')
  18 |  await page.getByRole('button',{name:'احذف الفراغ 2',exact:true}).click()
  19 |  await expect(page.getByRole('textbox',{name:'جزء النص 2',exact:true})).toHaveValue(' ونلتقي مُعَلِّمًا.')
  20 |  await passage.evaluate((element)=>{const input=element as HTMLTextAreaElement,start=input.value.indexOf('مُعَلِّمًا');input.focus();input.setSelectionRange(start,start+'مُعَلِّمًا'.length);input.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}))});await make.click()
  21 |  await page.getByRole('textbox',{name:'الإجابات المقبولة للفراغ 2',exact:true}).fill('مُعَلِّمًا\nمُدَرِّسًا')
  22 |  const prompt=page.getByRole('textbox',{name:'نص السؤال',exact:true});await prompt.fill('أكمل نص المراجعة.');await prompt.press('ControlOrMeta+a');await prompt.press('ControlOrMeta+b')
  23 |  const published=page.waitForResponse(r=>r.url().endsWith(`/activities/${fixture.activity.id}/publish`)&&r.request().method()==='POST');await page.getByRole('button',{name:'اعتماد التغييرات',exact:true}).click();expect((await published).ok()).toBe(true)
  24 |  await page.reload();await expect(page.getByRole('textbox',{name:'الإجابات المقبولة للفراغ 1',exact:true})).toHaveValue('كتابًا');await expect(page.getByRole('textbox',{name:'الإجابات المقبولة للفراغ 2',exact:true})).toHaveValue('مُعَلِّمًا\nمُدَرِّسًا')
  25 |  const read=await request.get(`/api/v1/activities/${fixture.activity.id}`,{headers:fixture.headers}),saved=(await read.json()).questions[0]
  26 |  expect(saved.payload.segments.map((s:{kind:string;text?:string})=>s.kind==='text'?s.text:'[blank]')).toEqual(['نقرأ ','[blank]',' ونلتقي ','[blank]','.'])
  27 |  expect(saved.payload.segments[1].blankId).toBe('anchor');expect(saved.payload.segments[3].blankId).not.toBe('anchor')
  28 |  expect(saved.payload.blanks).toHaveLength(2);expect(saved.prompt).toBe('**أكمل نص المراجعة.**')
  29 |  await page.goto(`/teacher/activities/${fixture.activity.id}/play?mode=study`);await page.getByRole('radio',{name:/^إكمال الجملة/}).check();await page.getByRole('button',{name:'معاينة المحتوى المعتمد',exact:true}).click()
  30 |  const preview=page.getByRole('region',{name:'معاينة العرض',exact:true});await expect(preview.locator('h2,h3,h1').filter({hasText:'أكمل نص المراجعة.'})).toBeVisible()
  31 |  await preview.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill('كتابًا');await preview.getByRole('textbox',{name:'الفراغ 2',exact:true}).fill('مُدَرِّسًا');await preview.getByRole('button',{name:'إرسال الإجابة',exact:true}).click();await expect(preview.getByRole('status').filter({hasText:'إجابة صحيحة'})).toBeVisible()
  32 |  const link=await assignment(page,fixture.activity.id,'ar','إكمال الجملة')
  33 |  const {context,page:learn,errors}=await guest(browser,link,'ar')
  34 |  try{
  35 |   await learn.getByRole('button',{name:'ابدأ الجولة',exact:true}).click()
  36 |   await expect(learn.getByText('نقرأ ',{exact:true})).toBeVisible();await expect(learn.getByText(' ونلتقي ',{exact:true})).toBeVisible()
  37 |   await learn.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill('كتابًا');await learn.getByRole('textbox',{name:'الفراغ 2',exact:true}).fill('مُدَرِّسًا')
  38 |   const response=learn.waitForResponse(r=>r.url().endsWith('/answer')&&r.request().method()==='POST');await learn.getByRole('button',{name:'إرسال الإجابة',exact:true}).click();expect((await (await response).json()).reveal.wasCorrect).toBe(true)
  39 |   await learn.reload();await expect(learn.getByRole('textbox',{name:'الفراغ 1',exact:true})).toHaveValue('كتابًا');await expect(learn.getByRole('textbox',{name:'الفراغ 2',exact:true})).toHaveValue('مُدَرِّسًا')
  40 |   await learn.screenshot({path:'../docs/evidence/interactive/blank-insertion-ar-saved.png',fullPage:true});expect(errors).toEqual([])
  41 |  }finally{await context.close().catch(()=>{})}
  42 | })
  43 | 
  44 | for(const language of ['en','ar'] as const)test(`actual native learner dialog and network error are keyboard accessible ${language}`,async({page,request,browser})=>{
  45 |  test.setTimeout(60000)
  46 |  const fixture=await teacherFixture(page,request,language,[{kind:'tf',prompt:label(language,'The moon is a star.','القمر نجم.'),payload:{correct:false}}]);await fixture.publish()
  47 |  const link=await assignment(page,fixture.activity.id,language,label(language,'Flashcards','بطاقات المراجعة')),{context,page:learn,errors}=await guest(browser,link,language)
  48 |  try{
  49 |   await learn.getByRole('button',{name:label(language,'Start round','ابدأ الجولة'),exact:true}).click()
  50 |   const trigger=learn.getByRole('button',{name:label(language,'Leave a shared device','خروج من جهاز مشترك'),exact:true});await trigger.focus();await learn.keyboard.press('Enter')
  51 |   const dialog=learn.getByRole('dialog',{name:label(language,'Remove your resume key?','إزالة مفتاح الاستئناف؟'),exact:true})
  52 |   await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
  53 |   const traversal=[]
  54 |   for(let i=0;i<6;i++){await learn.keyboard.press('Tab');const focus=await dialog.evaluate(el=>({inside:el.contains(document.activeElement),tag:document.activeElement?.tagName,text:el.contains(document.activeElement)?document.activeElement?.textContent:null}));traversal.push(focus);expect(focus.inside||focus.tag==='BODY').toBe(true)}
  55 |   expect(traversal.filter(item=>item.inside).length).toBeGreaterThanOrEqual(4)
  56 |   await learn.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused()
  57 |   await trigger.press('Enter');await dialog.getByRole('button',{name:label(language,'Stay here','ابقَ هنا'),exact:true}).focus();await learn.keyboard.press('Enter');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused()
  58 |   await learn.route('**/delivery/attempts/*/presentation',route=>route.abort('internetdisconnected'),{times:1})
  59 |   await learn.getByRole('button',{name:label(language,'Reveal answer','اكشف الإجابة'),exact:true}).click()
  60 |   const alert=learn.getByRole('alert');await expect(alert).toBeVisible();const reconnect=alert.getByRole('button',{name:label(language,'Reconnect','أعد الاتصال'),exact:true});await reconnect.focus();await learn.keyboard.press('Enter');await expect(alert).toHaveCount(0)
  61 |   await learn.getByRole('button',{name:label(language,'Reveal answer','اكشف الإجابة'),exact:true}).click();await expect(learn.getByRole('button',{name:label(language,'Show question','إظهار السؤال'),exact:true})).toBeVisible()
  62 |   await learn.reload();await expect(learn.getByRole('button',{name:label(language,'Show question','إظهار السؤال'),exact:true})).toBeVisible()
  63 |   await trigger.focus();await learn.keyboard.press('Enter');await learn.screenshot({path:`../docs/evidence/interactive/native-dialog-${language}-focus.png`,fullPage:true});await learn.keyboard.press('Escape');expect(errors).toEqual([])
  64 |  }finally{await context.close().catch(()=>{})}
  65 | })
  66 | 
  67 | for(const language of ['en','ar'] as const)test(`native question type dialog preserves keyboard entry and restoration ${language}`,async({page,request})=>{
  68 |  const fixture=await teacherFixture(page,request,language,[{kind:'cloze',prompt:label(language,'Complete the reviewed sentence.','أكمل الجملة المعتمدة.'),payload:{schemaVersion:1,policy:{...policy,language},trimBoundaryWhitespace:true,segments:[{kind:'text',text:label(language,'We read a ','نقرأ ')},{kind:'blank',blankId:'book'}],blanks:[{id:'book',acceptedAnswers:[label(language,'book','كتابًا')]}]}}]);await fixture.publish();await page.goto(`/teacher/activities/${fixture.activity.id}`)
  69 |  const trigger=page.getByRole('button',{name:label(language,'Question type','نوع السؤال'),exact:true})
  70 |  await expect(page.getByRole('textbox',{name:label(language,'Question text','نص السؤال'),exact:true})).toBeVisible()
  71 |  const save=page.getByRole('button',{name:label(language,'Save','حفظ'),exact:true});await expect(save).toBeDisabled()
  72 |  const authored=(await (await request.get(`/api/v1/activities/${fixture.activity.id}`,{headers:fixture.headers})).json()).questions[0]
  73 |  if(!await trigger.isVisible())await page.getByRole('button',{name:label(language,'Properties','الخصائص'),exact:true}).click()
  74 |  await trigger.focus();await page.keyboard.press('Enter')
  75 |  const dialog=page.getByRole('dialog',{name:label(language,'Choose question type','اختر نوع السؤال'),exact:true}),selected=dialog.getByRole('button',{name:label(language,'Complete the sentence','أكمل الجملة'),exact:true})
  76 |  await expect(dialog).toBeVisible();await expect(selected).toBeFocused()
  77 |  await page.keyboard.press('Tab');expect(await dialog.evaluate(element=>element.contains(document.activeElement))).toBe(true)
  78 |  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused()
  79 |  await page.keyboard.press('Enter');await expect(selected).toBeFocused();await page.keyboard.press('Enter');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();await expect(trigger).toHaveAttribute('data-question-kind','cloze')
> 80 |  await expect(page.getByRole('textbox',{name:label(language,'Accepted answers for blank 1','الإجابات المقبولة للفراغ 1'),exact:true})).toHaveValue(label(language,'book','كتابًا'))
     |                                                                                                                                        ^ Error: expect(locator).toHaveValue(expected) failed
  81 |  await expect(page.getByRole('textbox',{name:label(language,'Passage text 1','جزء النص 1'),exact:true})).toHaveValue(label(language,'We read a ','نقرأ '));await expect(save).toBeDisabled()
  82 |  const after=(await (await request.get(`/api/v1/activities/${fixture.activity.id}`,{headers:fixture.headers})).json()).questions[0];expect(after).toEqual(authored)
  83 |  await page.keyboard.press('Enter');await expect(selected).toBeFocused();await page.screenshot({path:`../docs/evidence/interactive/native-type-dialog-${language}-focus.png`,fullPage:true});await page.keyboard.press('Escape');await expect(trigger).toBeFocused()
  84 | })
  85 | 
```