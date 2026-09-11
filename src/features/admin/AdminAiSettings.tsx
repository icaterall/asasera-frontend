import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, CirclePause, Image, RefreshCw, Settings2, Volume2 } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { aiAdministration, creditUsd, type AiModelCatalog, type AiModelPrice, type AiPolicy, type AiPriceRateKind, type AiRouteModel, type AiRoutePolicy, type AiSettings } from './api'
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
  const capabilities=data.capabilities??[]
  const mediaRoutes=(data.routes??[]).filter((route):route is AiRoutePolicy&{capability:'image_generation'|'audio_generation'}=>route.capability==='image_generation'||route.capability==='audio_generation')
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
        <ModelPrice price={selected?.price}/>
        <label className={styles.aiToggle}><input type="checkbox" checked={policy.enabled} disabled={busy||conflict} onChange={e=>setPolicy(p=>({...p,enabled:e.target.checked}))}/>{t('enabled')}</label>
        <p role="status">{!ready?t('unavailable'):!policy.enabled?t('disabled'):t('ready')}</p>
        <p>{t('applies')}</p>
        {error&&<p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}><Button variant="primary" type="submit" loading={busy} disabled={!changed||conflict||(!ready&&policy.enabled)}>{t('save')}</Button>{conflict&&<Button onClick={()=>void reload()}>{t('reload')}</Button>}</div>
      </form>
    </section>
    {data.modelCatalog&&(
      <ModelCatalog catalog={data.modelCatalog}/>
    )}
    <section className={styles.section} aria-labelledby="generation-routes"><h2 id="generation-routes">{t('generationRoutes')}</h2><p>{t('generationRoutesLead')}</p>
      {mediaRoutes.length?<div className={styles.routeSettings}>{mediaRoutes.map(route=><MediaRouteSettings key={`${route.capability}-${route.version}`} route={route} models={data.routeModels?.[route.capability]??[]} reload={reload}/>)}</div>:<p role="status">{t('mediaSettingsUnavailable')}</p>}
    </section>
    <section className={styles.section} aria-labelledby="ai-capabilities"><h2 id="ai-capabilities">{t('capabilities')}</h2><p>{t('capabilityLead')}</p>
      <ul className={styles.capabilities}>{capabilities.map(capability=>{
        const title={pdf_questions:t('pdfQuestions'),image_review:t('imageReview'),image_generation:t('imageGeneration'),audio_generation:t('audioGeneration')}[capability.id]
        const Icon=capability.id==='image_generation'?Image:capability.id==='audio_generation'?Volume2:Settings2
        const detail=capability.id==='image_review'?t('imageReviewDetail'):capability.status==='not_available'?t('notAvailableDetail'):capability.provider&&capability.model?`${capability.provider} · ${capability.model}`:''
        const statusKey=capability.status==='available'?'available':capability.status==='configured_pending'?'configuredPending':capability.status==='paused'?'paused':'notAvailable'
        return <li key={capability.id}><Icon size={20} aria-hidden="true"/><div><strong>{title}</strong><span dir="ltr">{detail}</span></div><span className={styles.capabilityStatus} data-status={capability.status}>{capability.status==='available'?<CheckCircle2 size={16} aria-hidden="true"/>:<CirclePause size={16} aria-hidden="true"/>}{t(statusKey)}</span></li>
      })}</ul>
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

function ModelCatalog({catalog}:{catalog:AiModelCatalog}) {
 const {t,i18n}=useTranslation('adminAi'),{user}=useAuth(),client=useQueryClient()
 const [busy,setBusy]=useState(false),[error,setError]=useState(false),[fetched,setFetched]=useState(false)
 async function refresh(){
  if(busy)return
  setBusy(true);setError(false);setFetched(false)
  try{
   const updated=await aiAdministration.refreshModelCatalog()
   client.setQueryData(['admin-ai-settings',user?.id],updated)
   setFetched(true)
  }catch{setError(true)}finally{setBusy(false)}
 }
 const statusLabel:Record<AiModelCatalog['providers'][number]['status'],'catalogStatusUpdated'|'catalogStatusNotConfigured'|'catalogStatusUnavailable'|'catalogStatusNotFetched'>={updated:'catalogStatusUpdated',not_configured:'catalogStatusNotConfigured',unavailable:'catalogStatusUnavailable',not_fetched:'catalogStatusNotFetched'}
 return <section className={styles.section} aria-labelledby="model-catalog">
   <div className={styles.catalogHeading}><div><h2 id="model-catalog">{t('catalogTitle')}</h2><p>{t('catalogLead')}</p></div><Button variant="secondary" icon={<RefreshCw size={16} aria-hidden="true"/>} onClick={()=>void refresh()} loading={busy}>{t('fetchModels')}</Button></div>
   {fetched&&<p className={styles.success} role="status">{t('catalogFetched')}</p>}
   {error&&<p className={styles.error} role="alert">{t('catalogFetchFailed')}</p>}
   <div className={styles.catalogStatuses} aria-label={t('catalogStatusTitle')}>{catalog.providers.map(provider=><div key={provider.provider}><strong>{provider.provider==='openai'?'OpenAI':'Gemini'}</strong><span>{t(statusLabel[provider.status],{count:provider.modelCount})}</span>{provider.fetchedAt&&<small><time dateTime={provider.fetchedAt}>{new Date(provider.fetchedAt).toLocaleString(i18n.language)}</time></small>}</div>)}</div>
   {!catalog.candidates.length?<p className={styles.catalogEmpty} role="status">{t('catalogEmpty')}</p>:<ul className={styles.catalogCandidates}>{catalog.candidates.map(candidate=><li key={`${candidate.provider}-${candidate.id}`}>
     <div><strong dir="ltr">{candidate.id}</strong><span>{candidate.provider==='openai'?'OpenAI':'Gemini'} · {t('catalogLastSeen',{date:new Date(candidate.lastSeenAt).toLocaleString(i18n.language)})}</span></div><span className={styles.catalogVerification} data-verified={candidate.verification==='approved'}>{t(candidate.verification==='approved'?'catalogCandidateApproved':'catalogCandidateReview')}</span>
   </li>)}</ul>}
 </section>
}

function MediaRouteSettings({route,models,reload}:{route:AiRoutePolicy&{capability:'image_generation'|'audio_generation'};models:AiRouteModel[];reload:()=>Promise<unknown>}) {
  const {t}=useTranslation('adminAi'),{user}=useAuth(),client=useQueryClient()
  const [policy,setPolicy]=useState<AiPolicy>(route),[busy,setBusy]=useState(false),[error,setError]=useState(''),[conflict,setConflict]=useState(false)
  const submitting=useRef(false)
  const title=route.capability==='image_generation'?t('imageGeneration'):t('audioGeneration')
  const selected=models.find(model=>model.id===policy.model&&model.provider===policy.provider)
  const providers=[...new Set(models.map(model=>model.provider))]
  const changed=policy.provider!==route.provider||policy.model!==route.model||policy.enabled!==route.enabled
  async function save(event:FormEvent) {
    event.preventDefault();if(submitting.current||!changed||conflict)return
    submitting.current=true;setBusy(true);setError('')
    try {
      const updated=await aiAdministration.saveRoute(route.capability,{provider:policy.provider,model:policy.model,enabled:policy.enabled,expectedVersion:route.version})
      client.setQueryData(['admin-ai-settings',user?.id],updated)
      client.setQueryData(['admin-ai-settings-saved',user?.id],true)
    } catch(e) {
      const stale=e instanceof ApiError&&e.status===409
      setConflict(stale);setError(t(stale?'conflict':'failed'))
    } finally {submitting.current=false;setBusy(false)}
  }
  const status=!policy.enabled?t('routePaused'):route.execution==='pending'?selected?.configured?t('routePending'):t('routePendingUnconfigured'):selected?.configured?t('ready'):t('unavailable')
  return <article className={styles.routeSetting} aria-labelledby={`${route.capability}-route-title`}>
    <div className={styles.routeHeading}><div><h3 id={`${route.capability}-route-title`}>{title}</h3><p>{route.capability==='image_generation'?t('imageGenerationLead'):t('audioGenerationLead')}</p></div><span data-execution={route.execution}>{t(!policy.enabled?'paused':route.execution==='pending'?'pending':'available')}</span></div>
    <form className={styles.creditForm} onSubmit={save} aria-busy={busy}>
      <label>{t('provider')}<Select value={policy.provider} aria-label={`${t('provider')} ${title}`} disabled={busy||conflict||providers.length===0} onValueChange={value=>{
        const provider=value as AiPolicy['provider'];const model=models.find(item=>item.provider===provider)
        setPolicy(current=>({...current,provider,model:model?.id??''}))
      }}>{providers.map(provider=><option key={provider} value={provider}>{provider==='openai'?'OpenAI':'Gemini'}</option>)}</Select></label>
      <label>{t('model')}<Select value={policy.model} aria-label={`${t('model')} ${title}`} disabled={busy||conflict||models.length===0} dir="ltr" onValueChange={model=>setPolicy(current=>({...current,model}))}>
        {models.filter(model=>model.provider===policy.provider).map(model=><option key={model.id} value={model.id}>{model.id}</option>)}
      </Select></label>
      <ModelPrice price={selected?.price}/>
      <label className={styles.aiToggle}><input type="checkbox" checked={policy.enabled} disabled={busy||conflict} onChange={event=>setPolicy(current=>({...current,enabled:event.target.checked}))}/>{t('enableRoute',{capability:title})}</label>
      <p role="status">{status}</p>
      {error&&<p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><Button variant="primary" type="submit" loading={busy} disabled={!changed||conflict||models.length===0}>{t('saveRoute',{capability:title})}</Button>{conflict&&<Button onClick={()=>void reload()}>{t('reload')}</Button>}</div>
    </form>
  </article>
}

const priceRateLabels:Record<AiPriceRateKind,'priceInputText'|'priceCachedInputText'|'priceInputImage'|'priceCachedInputImage'|'priceInputTextOrImage'|'priceOutputText'|'priceOutputAudio'|'priceOutputImage'>={
 input_text:'priceInputText',cached_input_text:'priceCachedInputText',input_image:'priceInputImage',cached_input_image:'priceCachedInputImage',input_text_or_image:'priceInputTextOrImage',output_text:'priceOutputText',output_audio:'priceOutputAudio',output_image:'priceOutputImage',
}
function ModelPrice({price}:{price?:AiModelPrice}) {
 const {t,i18n}=useTranslation('adminAi')
 if(!price)return <p className={styles.priceUnavailable} role="status">{t('priceUnavailable')}</p>
 const lifecycle=price.lifecycle==='stable'?'priceStable':price.lifecycle==='preview'?'pricePreview':'priceDeprecated'
 return <div className={styles.modelPrice} aria-live="polite" aria-label={t('referencePrice')}>
   <div className={styles.priceHeading}><strong>{t('referencePrice')}</strong><span data-lifecycle={price.lifecycle}>{t(lifecycle)}</span></div>
   <dl className={styles.priceRates}>{price.components.map(component=><div key={component.kind}><dt>{t(priceRateLabels[component.kind])}</dt><dd dir="ltr">{creditUsd(component.amountMillicents,i18n.language)} / {t('perMillionTokens')}</dd></div>)}</dl>
   {price.imageOutputReferences&&<div className={styles.imagePriceTable}><strong>{t('imageOutputCosts')}</strong><table><caption>{t('imageOutputCostLead')}</caption><thead><tr><th>{t('imageSize')}</th><th>{t('imageQuality')}</th><th>{t('cost')}</th></tr></thead><tbody>{price.imageOutputReferences.map(reference=><tr key={`${reference.size}-${reference.quality??'standard'}`}><td dir="ltr">{reference.size}</td><td>{reference.quality?t(reference.quality==='low'?'lowQuality':reference.quality==='medium'?'mediumQuality':'highQuality'):t('standard')}</td><td dir="ltr">{creditUsd(reference.amountMillicents,i18n.language)} / {t('perImage')}</td></tr>)}</tbody></table></div>}
   <p>{t(price.lifecycle==='deprecated'?'priceDeprecatedLead':price.lifecycle==='preview'?'pricePreviewLead':'priceReferenceLead')}</p>
   <small>{t('standardPaidTier')} · {t('priceVerified',{date:new Date(`${price.verifiedAt}T00:00:00Z`).toLocaleDateString(i18n.language)})} · <a href={price.source} target="_blank" rel="noreferrer">{t('officialPricing')}</a></small>
 </div>
}
