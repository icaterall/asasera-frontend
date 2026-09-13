// Exercise actual nginx, not Vite's more permissive development fallback.
// Discover Route declarations so a new React page cannot silently miss nginx.
import {readFileSync} from 'node:fs'
import ts from 'typescript'

const base=process.argv[2]
if(!base)throw new Error('Usage: node scripts/check-spa-routes.mjs <origin>')
const source=ts.createSourceFile('App.tsx',readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
const paths=new Set(['/'])
function walk(node,parent=''){
 const opening=ts.isJsxElement(node)?node.openingElement:ts.isJsxSelfClosingElement(node)?node:null
 if(opening?.tagName.getText(source)==='Route'){
  const attr=opening.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(source)==='path')
  if(attr){
   if(!attr.initializer||!ts.isStringLiteral(attr.initializer))throw new Error('Dynamic Route path needs explicit reload-test coverage')
   const value=attr.initializer.text
   if(value==='*'||value==='__design')return
   parent=value.startsWith('/')?value:`${parent}/${value}`
   paths.add(parent)
  }
 }
 ts.forEachChild(node,child=>walk(child,parent))
}
walk(source)
const samples=new Set()
for(const path of paths){
 const roles=path.includes(':role')?['teacher','student']:['teacher']
 for(const role of roles){
  const sample=path.replaceAll(':role',role).replaceAll(':id',path.startsWith('/learn/')?'f293d132-5bdd-46b1-a660-df417a787ac8':'42')
  if(sample.includes(':'))throw new Error(`Provide a sample for route ${path}`)
  samples.add(sample)
 }
}
samples.add('/teacher/billing?checkout=done&session=cs_test_reload')
samples.add('/teacher/billing/')
samples.add('/admin/ai-settings/')
const failures=[]
for(const path of samples){
 const response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(15000)})
 const body=await response.text()
 if(response.status!==200||!body.includes('id="root"')||!response.headers.get('content-type')?.includes('text/html'))failures.push(`${path}: HTTP ${response.status}, app shell=${body.includes('id="root"')}`)
}
for(const path of ['/not-a-real-page','/teacher/not-a-real-page','/admin/not-a-real-page','/assets/not-a-real-file.js','/api/v1/not-a-real-endpoint']){
 const response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(15000)})
 if(response.status!==404)failures.push(`${path}: expected a real 404, got ${response.status}`)
}
for(const failure of failures)console.error(`FAIL ${failure}`)
console.log(`${samples.size} registered page/reload checks, 5 genuine-404 checks: ${failures.length?'FAILED':'PASSED'}`)
if(failures.length)process.exitCode=1
