import {useEffect,useId,useRef,type ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {useTranslation} from 'react-i18next'
import {X} from 'lucide-react'
import styles from './EditorOverlay.module.css'

export function EditorOverlay({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null),id=useId(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const closeRef=useRef(onClose);closeRef.current=onClose
 useEffect(()=>{
  const previous=document.activeElement,dialog=ref.current
  dialog?.showModal()
  return()=>{dialog?.close();if(previous instanceof HTMLElement&&previous.isConnected)previous.focus()}
 },[])
 return createPortal(<dialog ref={ref} className={`asas ${styles.overlay}`} dir={ar?'rtl':'ltr'} aria-labelledby={id}
  onCancel={e=>{e.preventDefault();closeRef.current()}}>
  <header><h2 id={id}>{title}</h2><button type="button" onClick={onClose} aria-label={ar?'إغلاق':'Close'}><X size={20}/></button></header>
  <div className={styles.body}>{children}</div>
 </dialog>,document.body)
}
