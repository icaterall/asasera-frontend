import { api } from '@/lib/api'
import type { PublicQuestion } from '@/shared/session'

export type FeedbackStatus = 'open' | 'reviewed' | 'resolved'
export interface Feedback {
  id: number; versionId: number; rating: number; recommend: boolean; strengths: string; suggestion: string
  status: FeedbackStatus; response: string; revision: number; createdAt: string; updatedAt: string
}
export interface FeedbackInput { versionId: number; rating: number; recommend: boolean; strengths: string; suggestion: string }
type Label = { name_ar: string; name_en: string }
export interface SharedActivity {
  id: number; title: string; theme: string; authorName: string; versionId: number; version: number; publishedAt: string
  subjectId: number; levelId: number; shareUrl: string; questionCount: number; questions: PublicQuestion[]
  audience: { category: Label | null; educationStages: Label[]; countries: Label[] }
  summary: { reviewCount: number; averageRating: number | null; recommendationCount: number }
}
export interface InboxItem extends Omit<Feedback, 'rating' | 'recommend' | 'versionId'> {
  kind: 'feedback' | 'flag'; activityId: number; activityTitle: string; reviewerName: string
  questionId: number | null; reason: string | null; rating: number | null; recommend: boolean | null; versionId: number | null
}
export interface Recommendation {
  id: number; title: string; theme: string; authorName: string; questionCount: number; reuseCount: number; reasons: string[]
}
export const community = {
  activity: (id: number) => api.get<SharedActivity>(`/api/v1/community/activities/${id}`, { anonymous: true }),
  context: (id: number) => api.get<{ isAuthor: boolean; feedback: Feedback | null; flags: {id:number;questionId:number;reason:string;note:string;status:FeedbackStatus;response:string}[] }>(`/api/v1/community/activities/${id}/context`),
  save: (id: number, input: FeedbackInput) => api.put<{ feedback: Feedback }>(`/api/v1/community/activities/${id}/feedback`, input),
  withdraw: (id: number) => api.del(`/api/v1/community/activities/${id}/feedback`),
  inbox: (activityId: string, status: string, page: number) => api.get<{ items: InboxItem[]; hasMore: boolean; summary: Record<'total' | FeedbackStatus, number> }>(`/api/v1/community/inbox?${new URLSearchParams({ ...(activityId ? { activityId } : {}), ...(status ? { status } : {}), page: String(page) })}`),
  respond: (item: InboxItem, status: FeedbackStatus, response: string) => api.patch(`/api/v1/community/inbox/${item.kind}/${item.id}`, { status, response, expectedRevision: item.revision }),
  recommendations: (activityId?: number) => api.get<{ activities: Recommendation[]; personalized: boolean }>(`/api/v1/community/recommendations${activityId ? `?activityId=${activityId}` : ''}`),
  insights: (id: number) => api.get<{ status: string; totalParticipation: number | null; ideas: { code: string; questionId: number; questionNumber: number; prompt: string; version: number }[] }>(`/api/v1/community/activities/${id}/insights`),
}
