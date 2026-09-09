import {useLayoutEffect,useMemo,useRef,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {reference,type AudienceSelection} from '@/lib/api'

export function useAudienceForm(initial?:AudienceSelection,onChange?:(value:AudienceSelection)=>void) {
  const [categoryId,setCategoryId]=useState(initial?.categoryId??null)
  const [educationStageIds,setEducationStageIds]=useState(initial?.educationStageIds??[])
  // null means untouched NEW form; [] is an explicit choice of any country.
  const [countryChoice,setCountryChoice]=useState<number[]|null>(initial?initial.countryIds:null)
  const refs=useQuery({queryKey:['content-audience-reference'],queryFn:async({signal})=>{
    const [categories,stages]=await Promise.all([reference.categories(signal),reference.educationStages(signal)])
    return {categories,stages}
  }})
  const countries=useQuery({queryKey:['audience-countries'],queryFn:({signal})=>reference.countries(signal),staleTime:300_000})
  const suggestion=countries.data?.detectedCountryId
  const countryIds=useMemo(()=>countryChoice??(suggestion?[suggestion]:[]),[countryChoice,suggestion])
  if(countryChoice===null&&countries.isSuccess)setCountryChoice(countryIds)
  const latest=useRef<AudienceSelection>({categoryId,educationStageIds,countryIds})
  useLayoutEffect(()=>{latest.current={categoryId,educationStageIds,countryIds}},[categoryId,educationStageIds,countryIds])
  const changed=(patch:Partial<AudienceSelection>)=>{latest.current={...latest.current,...patch};onChange?.(latest.current)}
  return {value:{categoryId,educationStageIds,countryIds},
    setCategoryId:(value:number|null)=>{setCategoryId(value);changed({categoryId:value})},
    setEducationStageIds:(value:number[])=>{setEducationStageIds(value);changed({educationStageIds:value})},
    setCountryIds:(value:number[])=>{setCountryChoice(value);changed({countryIds:value})},refs,countries,
    ready:!!refs.data&&refs.data.categories.some(c=>c.id===categoryId)&&educationStageIds.length>0&&educationStageIds.every(id=>refs.data.stages.some(s=>s.id===id))}
}
