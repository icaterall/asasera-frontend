import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import path from 'node:path'

const root=path.resolve(import.meta.dirname,'..')
if(!existsSync(path.join(root,'dist/index.html')))throw new Error('Run npm run build before nginx route tests.')
const image=process.env.NGINX_TEST_IMAGE||'nginx:stable-alpine'
const id=execFileSync('docker',['run','-d','--rm','-p','127.0.0.1::80',
 '--mount',`type=bind,source=${root}/nginx.conf,target=/etc/nginx/conf.d/default.conf,readonly`,
 '--mount',`type=bind,source=${root}/dist,target=/usr/share/nginx/html,readonly`,image],{encoding:'utf8'}).trim()
try{
 execFileSync('docker',['exec',id,'nginx','-t'],{stdio:'inherit'})
 const binding=execFileSync('docker',['port',id,'80/tcp'],{encoding:'utf8'}).trim()
 const origin=`http://${binding}`
 let ready=false
 for(let n=0;n<40;n++){
  try{ready=(await fetch(`${origin}/healthz`)).ok}catch{}
  if(ready)break
  await new Promise(resolve=>setTimeout(resolve,100))
 }
 if(!ready)throw new Error('Test nginx did not become ready')
 execFileSync(process.execPath,['scripts/check-spa-routes.mjs',origin],{cwd:root,stdio:'inherit'})
}finally{
 // Only the disposable container ID returned above; never the user's stack.
 execFileSync('docker',['stop',id],{stdio:'ignore'})
}
