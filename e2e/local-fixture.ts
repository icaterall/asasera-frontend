import {execFileSync} from 'node:child_process'
import {readFileSync,unlinkSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import path from 'node:path'
/**
 * Refuse to run against anything but a throwaway stack.
 *
 * Specs that seed accounts and delete rows must never touch a real database or
 * the shared development stack a person is using. What matters is the isolation,
 * not one particular port: the isolated stack moves between releases, so the
 * guard checks the two properties that actually protect the data — a database
 * whose name says it is a test database, and a loopback API that is not the
 * shared dev server on 5173.
 */
export function isolatedStackOnly(){
 const base=process.env.PW_BASE_URL??''
 if(!process.env.E2E_PG_DATABASE?.includes('test'))throw Error('Set E2E_PG_DATABASE to an isolated test database')
 if(!/^https?:\/\/127\.0\.0\.1:\d+\/?$/.test(base)||/:5173\/?$/.test(base))throw Error(`Set PW_BASE_URL to an isolated loopback stack, not the shared dev server (got ${base||'nothing'})`)
}

/** Seed directly in the local development DB with outbound integrations disabled. */
export function localTeacher():{owner:number;email:string;password:string}{return seedLocal('seed-browser-account.ts')}
export function localShelf():{owner:number;email:string;password:string;activities:{id:number;title:string}[];emptyLevel:number}{return seedLocal('seed-shelf-browser.ts')}
/** A teacher with one image question whose zones are a rectangle, a circle and a hexagon, plus a study link. */
export function localShapes():{owner:number;email:string;password:string;activityId:number;questionId:number;imageKey:string;assignmentId:string;accessToken:string}{return seedLocal('seed-shapes-browser.ts')}
function seedLocal(script:'seed-browser-account.ts'|'seed-shelf-browser.ts'|'seed-shapes-browser.ts'){
 /* Each seeder guards its own destination prefix, so the filename has to match
    the script rather than being one shared name. */
 const file=script==='seed-shapes-browser.ts'?`/tmp/asasera-shapes-${randomUUID()}.json`:`/tmp/asasera-browser-${randomUUID()}.json`
 const backend=path.resolve(import.meta.dirname,'../../asasera-backend')
 try{
  execFileSync(process.execPath,['--disable-warning=ExperimentalWarning',`scripts/v4/${script}`,file],{cwd:backend,env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE??'asasera',PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},stdio:'pipe'})
  return JSON.parse(readFileSync(file,'utf8'))
 }finally{try{unlinkSync(file)}catch{}}
}
