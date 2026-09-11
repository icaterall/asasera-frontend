import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {reference, type ActivityRecord} from '@/lib/api'
import styles from './Audience.module.css'

/*
 * What the teacher chose, readable without opening the panel. The same two query
 * keys the edit form uses, so this shares react-query's cache rather than
 * refetching the reference lists for the sake of a few labels.
 */
export function AudienceSummary({activity}: {activity: ActivityRecord}) {
  const {i18n} = useTranslation(), ar = i18n.language.startsWith('ar')
  const refs = useQuery({queryKey:['content-audience-reference'], queryFn: async ({signal}) => {
    const [categories, stages] = await Promise.all([reference.categories(signal), reference.educationStages(signal)])
    return {categories, stages}
  }})
  const countries = useQuery({queryKey:['audience-countries'], queryFn: ({signal}) => reference.countries(signal), staleTime: 300_000})

  const name = (option: {name_ar: string; name_en: string}) => (ar ? option.name_ar || option.name_en : option.name_en)
  const pick = <T extends {id: number; name_ar: string; name_en: string}>(list: T[] | undefined, ids: number[]) =>
    ids.map(id => list?.find(item => item.id === id)).filter((item): item is T => !!item).map(name)

  const labels = [
    ...pick(refs.data?.categories, activity.categoryId ? [activity.categoryId] : []),
    ...pick(refs.data?.stages, activity.educationStageIds ?? []),
    ...pick(countries.data?.countries, activity.countryIds ?? []),
  ]

  if (refs.isPending) return null
  if (!labels.length) return <span className={styles.summaryEmpty}>{ar ? 'لم يُحدَّد بعد' : 'Not set yet'}</span>

  // Four is what fits on one line at the narrowest supported width; the rest counts up.
  const shown = labels.slice(0, 4), rest = labels.length - shown.length
  return <span className={styles.summaryChips}>
    {shown.map(label => <span key={label} className={styles.chip}>{label}</span>)}
    {rest > 0 && <span className={styles.chipMore}>+{rest}</span>}
  </span>
}
