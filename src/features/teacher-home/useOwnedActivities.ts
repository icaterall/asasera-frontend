import { useQuery } from '@tanstack/react-query'
import { activities } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export function useOwnedActivities() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['owned-activities', user?.id], queryFn: activities.list, enabled: !!user, staleTime: 0 })
}
