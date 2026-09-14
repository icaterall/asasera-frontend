# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-upload.spec.ts >> image upload progress and preserved edits 1440
- Location: e2e/image-upload.spec.ts:6:60

# Error details

```
Error: Set E2E_PG_DATABASE to an isolated test database
```

# Test source

```ts
  1  | import {execFileSync} from 'node:child_process'
  2  | import {readFileSync,unlinkSync} from 'node:fs'
  3  | import {randomUUID} from 'node:crypto'
  4  | import path from 'node:path'
  5  | /**
  6  |  * Refuse to run against anything but a throwaway stack.
  7  |  *
  8  |  * Specs that seed accounts and delete rows must never touch a real database or
  9  |  * the shared development stack a person is using. What matters is the isolation,
  10 |  * not one particular port: the isolated stack moves between releases, so the
  11 |  * guard checks the two properties that actually protect the data — a database
  12 |  * whose name says it is a test database, and a loopback API that is not the
  13 |  * shared dev server on 5173.
  14 |  */
  15 | export function isolatedStackOnly(){
  16 |  const base=process.env.PW_BASE_URL??''
> 17 |  if(!process.env.E2E_PG_DATABASE?.includes('test'))throw Error('Set E2E_PG_DATABASE to an isolated test database')
     |                                                          ^ Error: Set E2E_PG_DATABASE to an isolated test database
  18 |  if(!/^https?:\/\/127\.0\.0\.1:\d+\/?$/.test(base)||/:5173\/?$/.test(base))throw Error(`Set PW_BASE_URL to an isolated loopback stack, not the shared dev server (got ${base||'nothing'})`)
  19 | }
  20 | 
  21 | /** Seed directly in the local development DB with outbound integrations disabled. */
  22 | export function localTeacher():{owner:number;email:string;password:string}{return seedLocal('seed-browser-account.ts')}
  23 | export function localShelf():{owner:number;email:string;password:string;activities:{id:number;title:string}[];emptyLevel:number}{return seedLocal('seed-shelf-browser.ts')}
  24 | /** A teacher with one image question whose zones are a rectangle, a circle and a hexagon, plus a study link. */
  25 | export function localShapes():{owner:number;email:string;password:string;activityId:number;questionId:number;imageKey:string;assignmentId:string;accessToken:string}{return seedLocal('seed-shapes-browser.ts')}
  26 | function seedLocal(script:'seed-browser-account.ts'|'seed-shelf-browser.ts'|'seed-shapes-browser.ts'){
  27 |  /* Each seeder guards its own destination prefix, so the filename has to match
  28 |     the script rather than being one shared name. */
  29 |  const file=script==='seed-shapes-browser.ts'?`/tmp/asasera-shapes-${randomUUID()}.json`:`/tmp/asasera-browser-${randomUUID()}.json`
  30 |  const backend=path.resolve(import.meta.dirname,'../../asasera-backend')
  31 |  try{
  32 |   execFileSync(process.execPath,['--disable-warning=ExperimentalWarning',`scripts/v4/${script}`,file],{cwd:backend,env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE??'asasera',PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},stdio:'pipe'})
  33 |   return JSON.parse(readFileSync(file,'utf8'))
  34 |  }finally{try{unlinkSync(file)}catch{}}
  35 | }
  36 | 
```