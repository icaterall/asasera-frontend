import type { ReactNode } from 'react'
import { LoadingState } from '@/design/LoadingState'
import { loadingVariantForPath } from '@/design/loadingVariant'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { homePathFor } from '@/lib/afterAuth'

/**
 * The teacher route rule, in one place.
 *
 * WHY IT IS ITS OWN COMPONENT. This logic used to live inside TeacherLayout,
 * which meant "is this route protected" and "does this route get the sidebar"
 * were the same decision. The lesson editor needs the first without the second
 * — it owns the whole viewport — and moving it out of TeacherLayout to get the
 * layout would have silently taken the guard with it, leaving the editor
 * reachable signed out.
 *
 * Both TeacherLayout and the editor route now wrap in this, so there is one
 * rule and changing it changes both.
 */
export function RequireTeacher({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  if (status === 'loading') {
    return <LoadingState layout="page" variant={loadingVariantForPath(location.pathname)} label={t('teacher.section.loading')} />
  }

  /* `state` carries where they were going, so signing in returns them here
     rather than dropping them on the dashboard root. `replace` keeps the
     protected URL out of history. */
  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  }

  /* A student who reaches this URL is not shown a teacher workspace. */
  if (user.role !== 'teacher') return <Navigate to={homePathFor(user)} replace />

  return <>{children}</>
}
