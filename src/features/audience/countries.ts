import type {CountryOption} from '@/lib/api'

/** The visitor's country leads; Arab visitors see the other Arab countries next. */
export function orderedCountries(countries:CountryOption[],detectedId:number|null,language:string) {
  const detected=countries.find(country=>country.id===detectedId)
  const ar=language.startsWith('ar'),collator=new Intl.Collator(ar?'ar':'en')
  const rank=(country:CountryOption)=>country.id===detectedId?0:detected?.is_arab&&country.is_arab?1:2
  return [...countries].sort((a,b)=>rank(a)-rank(b)||collator.compare(ar?a.name_ar||a.name_en:a.name_en,ar?b.name_ar||b.name_en:b.name_en)||a.id-b.id).map(country=>({
    ...country,group:country.id===detectedId?(ar?'بلدك المقترح':'Suggested country'):detected?.is_arab&&country.is_arab?(ar?'الدول العربية':'Arab countries'):(ar?'جميع الدول':'All countries'),
  }))
}
