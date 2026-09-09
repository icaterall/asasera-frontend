import { api } from '@/lib/api'
import type { LearningProfile, StudentLearningProfile, StudentOverview } from '@/shared/student'
export type StudentAccess = { accessToken: string; attemptId: string | null; token: string | null }
export const studentApi = {
  overview: () => api.get<StudentOverview>('/api/v1/student/overview'),
  profile: ({ stage, grade, educationStageId }: LearningProfile) => api.put<{ profile: StudentLearningProfile }>('/api/v1/student/profile', { stage, grade, educationStageId }),
  save: (id: string, accessToken: string) => api.post('/api/v1/student/activities', { id, accessToken }),
  attach: (id: string, attemptId: string, token: string) => api.post(`/api/v1/student/activities/${id}/attempt`, { attemptId, token }),
  start: (id: string, name: string, requestId: string) => api.post<{ attemptId: string; token: string }>(`/api/v1/student/activities/${id}/start`, { name, requestId }),
  resume: (id: string) => api.post<StudentAccess>(`/api/v1/student/activities/${id}/resume`),
}
export const studentQueryKey = (id: number) => ['student-workspace', id] as const
