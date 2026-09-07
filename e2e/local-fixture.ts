import {execFileSync} from 'node:child_process'
import {readFileSync,unlinkSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import path from 'node:path'
/** Seed directly in the local development DB with outbound integrations disabled. */
export function localTeacher():{owner:number;email:string;password:string}{return seedLocal('seed-browser-account.ts')}
export function localShelf():{owner:number;email:string;password:string;activities:{id:number;title:string}[];emptyLevel:number}{return seedLocal('seed-shelf-browser.ts')}
function seedLocal(script:'seed-browser-account.ts'|'seed-shelf-browser.ts'){
 const file=`/tmp/asasera-browser-${randomUUID()}.json`
 const backend=path.resolve(import.meta.dirname,'../../asasera-backend')
 try{
  execFileSync(process.execPath,['--disable-warning=ExperimentalWarning',`scripts/v4/${script}`,file],{cwd:backend,env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:'55432',PG_DATABASE:process.env.E2E_PG_DATABASE??'asasera',PG_USER:'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},stdio:'pipe'})
  return JSON.parse(readFileSync(file,'utf8'))
 }finally{try{unlinkSync(file)}catch{}}
}
