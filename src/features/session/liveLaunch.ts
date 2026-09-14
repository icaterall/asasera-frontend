import {z} from 'zod'
import {liveLaunchSchema,type LiveLaunch} from '@/shared/live-presentation'
const prefix='asasera.live-launch:'
const storedSchema=z.object({activityId:z.number().int().positive(),presentation:liveLaunchSchema}).strict()
/** Preserve a reviewed launch across a pre-ACK reload; never fall back to a different quiz. */
export function retainLiveLaunch(requestId:string,activityId:number,routeState:unknown):LiveLaunch|undefined{
 const route=routeState&&typeof routeState==='object'&&'presentation'in routeState?routeState.presentation:undefined
 if(route!==undefined){
  const parsed=liveLaunchSchema.safeParse(route)
  if(!parsed.success)throw Error('The presentation setup is invalid. Return to delivery setup. / إعداد العرض غير صالح. ارجع إلى إعداد التسليم.')
  sessionStorage.setItem(prefix+requestId,JSON.stringify({activityId,presentation:parsed.data}))
  return parsed.data
 }
 const stored=sessionStorage.getItem(prefix+requestId)
 if(stored===null)return undefined
 const parsed=storedSchema.safeParse(JSON.parse(stored))
 if(!parsed.success)throw Error('The saved presentation setup is invalid. Return to delivery setup.')
 if(parsed.data.activityId!==activityId)throw Error('This saved launch belongs to a different activity. Return to delivery setup.')
 return parsed.data.presentation
}
export function clearLiveLaunch(requestId:string){sessionStorage.removeItem(prefix+requestId)}
