import { useQuery } from '@tanstack/react-query'
import { api, API_PREFIX } from '@/lib/api'

/** Provider availability is public configuration, never a credential. */
export function useAuthOptions() {
  const { data } = useQuery({
    queryKey: ['auth', 'options'],
    queryFn: ({ signal }) => api.get<{ google: boolean }>(`${API_PREFIX}/auth/options`, { anonymous: true, signal }),
    retry: 2,
    staleTime: 30_000,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    // A backend restart must not hide Google for the rest of this page visit.
    refetchInterval: query => query.state.status === 'error' ? 10_000 : false,
  })
  return { google: data?.google === true }
}
