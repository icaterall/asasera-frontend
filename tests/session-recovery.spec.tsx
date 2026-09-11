import {afterEach,expect,it,vi} from 'vitest'

afterEach(()=>{vi.unstubAllGlobals();Reflect.deleteProperty(navigator,'locks');vi.resetModules()})

it('does not treat a temporary backend restart as a lost Google session',async()=>{
  const api=await import('../src/lib/api')
  api.setAccessToken('existing-session')
  const lost=vi.fn();api.setSessionLostHandler(lost)
  vi.stubGlobal('fetch',vi.fn()
    .mockResolvedValueOnce(new Response('{}',{status:401}))
    .mockResolvedValueOnce(new Response('Restarting',{status:503})))
  await expect(api.api.get('/api/v1/auth/me')).rejects.toMatchObject({status:503})
  expect(lost).not.toHaveBeenCalled()
  expect(api.getAccessToken()).toBe('existing-session')
})

it('keeps an unavailable boot refresh distinct from an expired cookie and recovers afterwards',async()=>{
  const api=await import('../src/lib/api')
  const fetch=vi.fn().mockRejectedValueOnce(new TypeError('API restarting'))
    .mockResolvedValueOnce(new Response(JSON.stringify({accessToken:'recovered',user:{id:1,role:'teacher'}}),{status:200,headers:{'content-type':'application/json'}}))
  vi.stubGlobal('fetch',fetch)
  await expect(api.refreshSession()).rejects.toMatchObject({code:'session_refresh_unavailable'})
  expect(await api.refreshSession()).toMatchObject({accessToken:'recovered'})
})

it('keeps both Google sessions signed in when two tabs refresh the same cookie together',async()=>{
  let lock=Promise.resolve<unknown>(undefined)
  Object.defineProperty(navigator,'locks',{configurable:true,value:{request:vi.fn((_name:string,run:()=>Promise<unknown>)=>{
    const task=lock.then(run);lock=task.catch(()=>{});return task
  })}})
  const firstTab=await import('../src/lib/api')
  vi.resetModules()
  const secondTab=await import('../src/lib/api')
  let cookie=0
  const used=new Set<number>()
  vi.stubGlobal('fetch',vi.fn(async()=>{
    const presented=cookie
    await new Promise(resolve=>setTimeout(resolve,5))
    if(used.has(presented))return new Response('{}',{status:401})
    used.add(presented);cookie++
    return new Response(JSON.stringify({accessToken:`session-${cookie}`,user:{id:1,role:'teacher'}}),{status:200,headers:{'content-type':'application/json'}})
  }))
  const sessions=await Promise.all([firstTab.refreshSession(),secondTab.refreshSession()])
  expect(sessions.every(Boolean)).toBe(true)
  expect(cookie).toBe(2)
})

it('still ends a revoked session without an endless refresh loop',async()=>{
  const api=await import('../src/lib/api')
  const lost=vi.fn();api.setSessionLostHandler(lost);api.setAccessToken('old')
  const fetch=vi.fn().mockResolvedValueOnce(new Response('{}',{status:401}))
    .mockResolvedValueOnce(new Response(JSON.stringify({accessToken:'new',user:{id:1}}),{status:200}))
    .mockResolvedValueOnce(new Response('{}',{status:401}))
  vi.stubGlobal('fetch',fetch)
  await expect(api.api.get('/api/v1/auth/me')).rejects.toMatchObject({status:401})
  expect(fetch).toHaveBeenCalledTimes(3)
  expect(lost).toHaveBeenCalledOnce()
  expect(api.getAccessToken()).toBeNull()
})

it('can restore the session when browser privacy settings deny Web Locks',async()=>{
  Object.defineProperty(navigator,'locks',{configurable:true,value:{request:vi.fn().mockRejectedValue(new DOMException('Unavailable','SecurityError'))}})
  const api=await import('../src/lib/api')
  const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({accessToken:'restored',user:{id:1}}),{status:200}))
  vi.stubGlobal('fetch',fetch)
  expect(await api.refreshSession()).toMatchObject({accessToken:'restored'})
  expect(fetch).toHaveBeenCalledOnce()
})
