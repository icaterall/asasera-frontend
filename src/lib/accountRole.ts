import type { PublicUser } from '@/lib/api'

const roles: Record<PublicUser['role'], { ar: string; en: string }> = {
  teacher: { ar: 'معلّم', en: 'Teacher' },
  student: { ar: 'طالب', en: 'Student' },
  admin: { ar: 'مدير النظام', en: 'Admin' },
  support: { ar: 'الدعم الفني', en: 'Support' },
}

export function accountRoleLabel(role: PublicUser['role'], language: string): string {
  return roles[role][language.startsWith('ar') ? 'ar' : 'en']
}
