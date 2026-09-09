import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {reference,type AudienceSelection} from '@/lib/api'

export function useAudienceForm(initial?:AudienceSelection) {
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
  const countryIds=countryChoice??(suggestion?[suggestion]:[])
  if(countryChoice===null&&countries.isSuccess)setCountryChoice(countryIds)
  return {value:{categoryId,educationStageIds,countryIds},setCategoryId,setEducationStageIds,setCountryIds:setCountryChoice,refs,countries,
    ready:!!refs.data&&refs.data.categories.some(c=>c.id===categoryId)&&educationStageIds.length>0&&educationStageIds.every(id=>refs.data.stages.some(s=>s.id===id))}
}

