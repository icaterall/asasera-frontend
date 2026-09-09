import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, ChartNoAxesCombined, ClipboardList, House, KeyRound, LifeBuoy, LogIn, LogOut, Settings2, UserRound } from 'lucide-react'
import '@/design/Dropdown.module.css'
import { Bdi } from '@/components/Bdi'
import { useAuth } from '@/hooks/useAuth'
import { homePathFor } from '@/lib/afterAuth'
import { accountRoleLabel } from '@/lib/accountRole'
import styles from './AccountControl.module.css'

function initial(name: string | null): string | null {
  const trimmed = name?.trim()
  if (!trimmed) return null
  return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(trimmed)][0]?.segment ?? null
}

/** One keyboard-accessible account menu in every signed-in header. */
export function AccountControl() {
  const { user, signOut } = useAuth()
  const { i18n } = useTranslation()
  const t = (ar: string, en: string) => i18n.language.startsWith('ar') ? ar : en
  const location = useLocation()
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const focusLast = useRef(false)
  const leavingRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [height, setHeight] = useState(480)
  const [locationKey, setLocationKey] = useState(location.key)
  if (location.key !== locationKey) { setLocationKey(location.key); setOpen(false) }

  useLayoutEffect(() => {
    if (!open) return
    const resize = () => setHeight(Math.max(120, window.innerHeight - (trigger.current?.getBoundingClientRect().bottom ?? 80) - 20))
    resize()
    const items = menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
    items?.[focusLast.current ? items.length - 1 : 0]?.focus()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [open])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  if (!user) return null
  const letter = initial(user.name)
  const teacher = user.role === 'teacher'
  const student = user.role === 'student'
  const roleLabel = accountRoleLabel(user.role, i18n.language)
  const links = [
    ...((teacher || student || user.role === 'admin') ? [{ to: homePathFor(user), label: t('لوحة التحكم', 'Dashboard'), icon:House }] : []),
    ...(teacher ? [
      { to: '/teacher/activities', label: t('أنشطتي', 'My activities'), icon:BookOpen },
      { to: '/teacher/assignments', label: t('الواجبات', 'Assignments'), icon:ClipboardList },
      { to: '/teacher/reports', label: t('التقارير', 'Reports'), icon:ChartNoAxesCombined },
    ] : student ? [{ to: '/join', label: t('انضمّ إلى حصّة', 'Join a class'), icon:LogIn }] : []),
    { to: '/account', label: t('إعدادات الحساب', 'Account settings'), icon:Settings2 },
    ...(user.role === 'admin' ? [] : [{ to: '/forgot', label: t('إعادة تعيين كلمة المرور', 'Reset password'), icon:KeyRound }]),
    { to: '/contact', label: t('تواصل مع الدعم', 'Contact support'), icon:LifeBuoy },
  ]

  function keyboard(event: KeyboardEvent) {
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const current = items.indexOf(document.activeElement as HTMLElement)
    let next: number | undefined
    if (event.key === 'ArrowDown') next = (current + 1) % items.length
    if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = items.length - 1
    if (next !== undefined) { event.preventDefault(); items[next]?.focus() }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus() }
    if (event.key === 'Tab') setOpen(false)
  }

  return <div ref={root} className={`asas ${styles.root}`} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button ref={trigger} type="button" className={styles.trigger} data-account-role={user.role}
      aria-label={`${t('قائمة الحساب', 'Account menu')} — ${roleLabel}`} title={roleLabel}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => { focusLast.current = false; setOpen(value => !value) }}
      onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); focusLast.current = event.key === 'ArrowUp'; setOpen(true) } }}>
      <span className={styles.avatar} aria-hidden="true">{letter ? <Bdi>{letter}</Bdi> : <UserRound size={22} />}</span>
    </button>
    {open && <div ref={menu} id={id} role="menu" aria-label={t('قائمة الحساب', 'Account menu')} className={styles.menu} style={{ maxHeight: height }} onKeyDown={keyboard}>
      <div className={styles.identity} role="presentation">
        <strong><Bdi>{user.name || t('حسابك', 'Your account')}</Bdi></strong>
        {user.email && <Bdi className={styles.email}>{user.email}</Bdi>}
        <span className={styles.identityRole}>{roleLabel}</span>
      </div>
      {links.map(link => <Link key={link.to} to={link.to} role="menuitem" tabIndex={-1} onClick={() => setOpen(false)}><link.icon size={19} aria-hidden="true"/>{link.label}</Link>)}
      <div role="separator" className={styles.separator} />
      <button type="button" role="menuitem" tabIndex={-1} disabled={leaving} onClick={async () => {
        if (leavingRef.current) return
        leavingRef.current = true; setLeaving(true)
        try { await signOut() } catch { /* AuthProvider clears local credentials even on network failure. */ }
      }}><LogOut size={19} aria-hidden="true"/>{leaving ? t('جارٍ تسجيل الخروج…', 'Signing out…') : t('تسجيل الخروج', 'Sign out')}</button>
    </div>}
  </div>
}
