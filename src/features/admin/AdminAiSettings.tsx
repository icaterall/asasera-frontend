import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Settings2 } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { aiAdministration, type AiPolicy, type AiSettings } from './api'
import styles from './Admin.module.css'

export default function AdminAiSettings() {
  const {t}=useTranslation('adminAi'),{user}=useAuth()
  const query=useQuery({queryKey:['admin-ai-settings',user?.id],queryFn:({signal})=>aiAdministration.get(signal),retry:1,enabled:user?.role==='admin'})
  if(user?.role!=='admin') return null
  return <>
    <header className={styles.pageHeading}><div><h1>{t('title')}</h1><p>{t('lead')}</p></div><Settings2 size={30} aria-hidden="true"/></header>
    {query.isPending?<LoadingState label={t('loading')} variant="form" rows={3}/>:query.error?<FailureState title={t('loadFailed')} actions={<Button onClick={()=>void query.refetch()}>{t('retry')}</Button>}/>:<AiSettingsForm key={query.data.policy.version} data={query.data} reload={()=>query.refetch()}/>}
  </>
}
export function AiSettingsForm({data,reload}:{data:AiSettings;reload:()=>Promise<unknown>}) {
  const {t,i18n}=useTranslation('adminAi'),{user}=useAuth(),client=useQueryClient()
  const [policy,setPolicy]=useState<AiPolicy>(data.policy),[busy,setBusy]=useState(false),[error,setError]=useState(''),[conflict,setConflict]=useState(false)
  const submitting=useRef(false)
  const selected=data.models.find(m=>m.id===policy.model&&m.provider===policy.provider)
  const ready=!!selected?.configured&&selected.structuredOutput&&selected.pricingAvailable
  const changed=policy.provider!==data.policy.provider||policy.model!==data.policy.model||policy.enabled!==data.policy.enabled
  async function save(event:FormEvent) {
    event.preventDefault();if(submitting.current||!changed||conflict||(!ready&&policy.enabled))return
    submitting.current=true;setBusy(true);setError('')
    try {
      const updated=await aiAdministration.save({provider:policy.provider,model:policy.model,enabled:policy.enabled,expectedVersion:data.policy.version})
      client.setQueryData(['admin-ai-settings',user?.id],updated)
      client.setQueryData(['admin-ai-settings-saved',user?.id],true)
    } catch(e) {
      const stale=e instanceof ApiError&&e.status===409
      setConflict(stale);setError(t(stale?'conflict':'failed'))
    } finally {submitting.current=false;setBusy(false)}
  }
  const saved=client.getQueryData<boolean>(['admin-ai-settings-saved',user?.id])
  return <div className={styles.aiSettings}>
    <section className={styles.section}>
      {saved&&<p className={styles.success} role="status">{t('saved')}</p>}
      <form className={styles.creditForm} onSubmit={save} aria-busy={busy}>
        <label>{t('provider')}<Select value={policy.provider} disabled={busy||conflict} onValueChange={value=>{
          const provider=value as AiPolicy['provider'];const model=data.models.find(m=>m.provider===provider)
          setPolicy(p=>({...p,provider,model:model?.id??''}))
        }}><option value="openai">OpenAI</option><option value="gemini">Gemini</option></Select></label>
        <label>{t('model')}<Select value={policy.model} disabled={busy||conflict} dir="ltr" onValueChange={model=>setPolicy(p=>({...p,model}))}>
          {data.models.filter(m=>m.provider===policy.provider).map(m=><option key={m.id} value={m.id}>{m.id}</option>)}
        </Select></label>
        <label className={styles.aiToggle}><input type="checkbox" checked={policy.enabled} disabled={busy||conflict} onChange={e=>setPolicy(p=>({...p,enabled:e.target.checked}))}/>{t('enabled')}</label>
        <p role="status">{!policy.enabled?t('disabled'):ready?t('ready'):t('unavailable')}</p>
        <p>{t('applies')}</p>
        {error&&<p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}><Button variant="primary" type="submit" loading={busy} disabled={!changed||conflict||(!ready&&policy.enabled)}>{t('save')}</Button>{conflict&&<Button onClick={()=>void reload()}>{t('reload')}</Button>}</div>
      </form>
    </section>
    <section className={styles.section} aria-labelledby="ai-history"><h2 id="ai-history">{t('history')}</h2>
      {!data.history.length?<p>{t('noHistory')}</p>:<ol className={styles.history}>{data.history.map(h=><li key={h.version}>
        <div><strong>{t('version',{version:h.version})}</strong><span>{t(h.enabled?'active':'paused')}</span></div>
        <p><bdi>{h.provider} · {h.model}</bdi></p>
        <small>{h.actorUserId!==null&&<>{t('actor',{id:h.actorUserId})} · </>}<time dateTime={h.createdAt}>{new Date(h.createdAt).toLocaleString(i18n.language)}</time></small>
      </li>)}</ol>}
    </section>
  </div>
}
