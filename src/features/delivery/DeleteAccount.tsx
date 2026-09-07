import {useId,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {useAuth} from '@/hooks/useAuth'
import {Button} from '@/design'
import styles from './Delivery.module.css'
export function DeleteAccount(){
 const dialogTitleId=useId()
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),{signOut}=useAuth(),dialog=useRef<HTMLDialogElement>(null)
 const [password,setPassword]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const remove=async()=>{setBusy(true);setError('');try{await api.post('/api/v1/account/delete',password?{password}:{});for(const store of [localStorage,sessionStorage])for(const key of Object.keys(store))if(key.startsWith('asasera:'))store.removeItem(key);await signOut()}catch(e){setError(e instanceof Error?e.message:(ar?'تعذّر حذف الحساب':'Could not delete account'))}finally{setBusy(false)}}
 return <section className="asas" style={{marginTop:32,borderTop:'1px solid var(--line)',paddingTop:24}}>
  <Button variant="quiet" onClick={()=>dialog.current?.showModal()}>{ar?'حذف الحساب':'Delete account'}</Button>
  <dialog aria-labelledby={dialogTitleId} ref={dialog} className={`asas ${styles.leave}`} onCancel={()=>{if(!busy){setPassword('');setConfirmed(false)}}}>
   <h2 id={dialogTitleId}>{ar?'حذف حسابك؟':'Delete your account?'}</h2>
   <p>{ar?'يُلغى تسجيل الدخول وتُزال المسودات والمشاركة من الرف. تُحذف الملفات غير المستخدمة عبر قائمة الحذف. قد تبقى النسخ المصرّح بها لدى معلمين آخرين، والسجلات دون أسماء المشاركين، وسجل المحفظة والحذف.':'Sign-in is revoked and your drafts and shelf listings are removed. Unused files enter the erasure queue. Authorized copies held by other teachers, records without participant names, and wallet and deletion audit records may remain.'}</p>
   <label>{ar?'كلمة المرور الحالية، إن كان حسابك يستخدمها':'Current password, if your account uses one'}<input type="password" autoComplete="current-password" value={password} disabled={busy} onChange={e=>{setPassword(e.target.value);setError('')}}/></label>
   <p>{ar?'إذا كنت تستخدم Google أو Facebook، أعد تسجيل الدخول ثم عد هنا خلال خمس دقائق.':'If you use Google or Facebook, sign in again and return here within five minutes.'}</p>
   <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/>{ar?'أفهم أن حذف الحساب لا يمكن التراجع عنه.':'I understand that account deletion cannot be undone.'}</label>
   {error&&<p role="alert">{error}</p>}
   <Button variant="danger" loading={busy} disabled={!confirmed} onClick={()=>void remove()}>{ar?'احذف حسابي':'Delete my account'}</Button>
   <Button disabled={busy} onClick={()=>{dialog.current?.close();setPassword('');setConfirmed(false)}}>{ar?'إلغاء':'Cancel'}</Button>
  </dialog>
 </section>
}
