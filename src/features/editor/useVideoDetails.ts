import {useQuery} from '@tanstack/react-query'
import {api} from '@/lib/api'

/** Shared by the timeframe dialog and attached card: one cached lookup per video. */
export function useVideoDetails(activityId:number|undefined,videoId:string|null|undefined){
 return useQuery({
  queryKey:['video-details-v1',activityId,videoId],
  queryFn:async()=>{
   const result=await api.get<{suggestions:{videoId:string;title:string;durationSeconds?:number|null}[]}>(`/api/v1/activity-media/video-suggestions?activityId=${activityId}&videoId=${encodeURIComponent(videoId!)}`)
   return result.suggestions.find(video=>video.videoId===videoId)??null
  },
  enabled:!!activityId&&!!videoId,
  staleTime:72*60*60*1000,
  retry:false,
 })
}
