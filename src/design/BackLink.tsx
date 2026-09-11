import type {ReactNode} from 'react'
import {Link,type To} from 'react-router-dom'
import {ArrowLeft} from 'lucide-react'
import button from './Button.module.css'
import styles from './BackLink.module.css'
/** Navigation keeps link semantics, with the same appearance as secondary buttons. */
export function BackLink({to,children}:{to:To;children:string}){
 return <Link to={to} aria-label={children} title={children} className={`${button.btn} ${button.secondary} ${styles.back}`}><ArrowLeft size={18} aria-hidden="true"/><span>{children}</span></Link>
}
export function TitleRow({children}:{children:ReactNode}){return <div className={styles.row}>{children}</div>}
