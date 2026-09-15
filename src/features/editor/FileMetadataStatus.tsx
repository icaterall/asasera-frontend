import {useEffect} from 'react'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {CheckCircle2} from 'lucide-react'
import {api} from '@/lib/api'
import {Button,LoadingIndicator} from '@/design'
import styles from './FileMetadataStatus.module.css'

type Analysis={
 state:'not_analyzed'|'queued'|'running'|'ready'|'unsupported'|'failed'|'uncertain'
 errorCode?:string|null
 coveredSegments:number[]
 metadata:{title:string;language:string;summary:string;topics:{text:string;sourceSegments:number[]}[]}|null
}

/** Only the revision identifies this query. Page/option changes never start new analysis. */
export function FileMetadataStatus({revisionId}:{revisionId:number}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),client=useQueryClient()
 const key=['file-metadata',revisionId],path=`/api/v1/teaching/revisions/${revisionId}/metadata`
 const saved=useQuery({queryKey:key,queryFn:()=>api.get<Analysis>(path),staleTime:30_000,
  refetchInterval:query=>['queued','running'].includes(query.state.data?.state??'')?5000:false})
 const ensure=useMutation({mutationFn:()=>api.post<Analysis>(path),onSuccess:data=>client.setQueryData(key,data)})
 const {mutate,isPending,isError}=ensure
 useEffect(()=>{if(saved.data?.state==='not_analyzed'&&!isPending&&!isError)mutate()},[saved.data?.state,isPending,isError,mutate])
 const data=saved.data
 if(saved.isPending)return <p className={styles.notice}>{ar?'جارٍ التحقق من تحليل الملف المحفوظ…':'Checking saved file analysis…'}</p>
 if(saved.isError||ensure.isError)return <div className={styles.notice}>
  <span>{ar?'تعذّر تحميل تحليل الملف. يمكنك متابعة اختيار الصفحات.':'Couldn’t load file analysis. You can keep selecting pages.'}</span>
  <Button variant="quiet" onClick={()=>{ensure.reset();void saved.refetch()}}>{ar?'تحقق مجددًا':'Check again'}</Button>
 </div>
 if(data?.state==='ready'&&data.metadata)return <details className={styles.details}>
  <summary><CheckCircle2 size={17} aria-hidden="true"/><span>{ar?'تحليل الملف محفوظ':'File analysis saved'}<small>{ar?'دون خصم من رصيدك · يُعاد استخدامه لهذا الملف':'No balance used · Reused for this file'}</small></span></summary>
  <div className={styles.content}>
   <p dir="auto">{data.metadata.summary}</p>
   <p>{ar?'لغة المصدر: ':'Source language: '}<bdi>{data.metadata.language}</bdi> · {ar?'الصفحات المحللة: ':'Pages analysed: '}{data.coveredSegments.length.toLocaleString(ar?'ar':'en')}</p>
   {data.metadata.topics.length>0&&<ul>{data.metadata.topics.slice(0,5).map((topic,index)=><li key={index} dir="auto">{topic.text}</li>)}</ul>}
   <small>{ar?'تحليل مساعد بالذكاء الاصطناعي؛ راجع النتائج. تبقى الصفحات الأصلية مرجع الأسئلة. إنشاء المحتوى لاحقًا يستخدم الرصيد كالمعتاد.':'AI-assisted analysis; review its findings. Original pages remain the source for questions. Later content generation uses balance as usual.'}</small>
  </div>
 </details>
 const waiting=['queued','running','not_analyzed'].includes(data?.state??'')
 /* The spinner lives with the thing that is actually working. */
 if(waiting)return <div className={styles.notice} role="status"><LoadingIndicator label={ar?'جارٍ تحليل الملف، دون خصم من رصيدك. يمكنك متابعة اختيار الصفحات.':'Analysing your file, without using your balance. You can keep selecting pages.'}/></div>
 return <p className={styles.notice} role="status">{data?.errorCode==='analysis_size_limit'
   ?ar?'يتجاوز الملف حد التحليل التلقائي. ما زال بإمكانك إنشاء أسئلة من الصفحات المحددة.':'This file exceeds the automatic analysis limit. You can still create questions from selected pages.'
   :ar?'التحليل التلقائي غير متاح لهذا الملف. يبقى الملف محفوظًا ويمكنك المتابعة.':'Automatic analysis is unavailable for this file. Your file is saved and you can continue.'}</p>
}
