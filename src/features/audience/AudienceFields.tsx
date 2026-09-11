import {useId} from 'react'
import {useAudienceForm} from './useAudienceForm'
import {useTranslation} from 'react-i18next'
import {Select,Button} from '@/design'
import {MultiSelect} from '@/design/MultiSelect'
import {orderedCountries} from './countries'
import styles from './Audience.module.css'

export function AudienceFields({form,disabled=false,optional=false}:{form:ReturnType<typeof useAudienceForm>;disabled?:boolean;optional?:boolean}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
  const partial=optional&&!form.empty&&!form.ready&&!!form.refs.data
  const name=(option:{name_ar:string;name_en:string})=>ar?option.name_ar||option.name_en:option.name_en
  const countries=orderedCountries(form.countries.data?.countries??[],form.countries.data?.detectedCountryId??null,i18n.language)
  const groups=[...new Set(countries.map(country=>country.group))]
  return <div className={styles.fields}>
    {form.refs.isError&&<div role="alert" className={styles.failure}><p>{ar?'تعذّر تحميل التصنيفات والمراحل. أعد المحاولة، وستبقى اختياراتك محفوظة.':'Categories and stages couldn’t load. Try again; your choices will stay here.'}</p><Button onClick={()=>void form.refs.refetch()}>{ar?'إعادة المحاولة':'Try again'}</Button></div>}
    {optional&&<p className={styles.failure} style={{color:'var(--muted)',margin:0}}>{ar?'يمكنك إضافة هذا لاحقًا؛ يساعد على تنظيم مكتبتك.':'You can add this later; it helps organise your library.'}</p>}
    <div className={styles.pair}>
      <div className={styles.field}><label htmlFor={`${id}-category`}>{optional?(ar?'التصنيف (اختياري)':'Category (optional)'):(ar?'التصنيف':'Category')}</label>
        <Select id={`${id}-category`} aria-label={ar?'التصنيف':'Category'} required={!optional} value={form.value.categoryId??''} onValueChange={value=>form.setCategoryId(value?Number(value):null)} disabled={disabled||!form.refs.data}>
          <option value="">{form.refs.isPending?(ar?'جارٍ التحميل…':'Loading…'):optional?(ar?'بلا تصنيف بعد':'No category yet'):(ar?'اختر تصنيفًا واحدًا':'Choose one category')}</option>
          {form.refs.data?.categories.map(category=><option key={category.id} value={category.id} data-search-text={`${category.name_en} ${category.name_ar}`}>{name(category)}</option>)}
        </Select>
      </div>
      <MultiSelect id={`${id}-stages`} label={ar?'المراحل التعليمية':'Education stages'} required={!optional} value={form.value.educationStageIds.map(String)} onValueChange={ids=>form.setEducationStageIds(ids.map(Number))} disabled={disabled||!form.refs.data}
        placeholder={form.refs.isPending?(ar?'جارٍ التحميل…':'Loading…'):(ar?'اختر مرحلة أو أكثر':'Choose one or more stages')} hint={partial?(ar?'اختر التصنيف والمرحلة معًا، أو اتركهما فارغين الآن.':'Choose both a category and a stage, or leave both empty for now.'):(ar?'يمكن أن يناسب المحتوى أكثر من مرحلة.':'Your content can suit more than one stage.')}>
        {form.refs.data?.stages.map(stage=><option key={stage.id} value={stage.id} data-search-text={`${stage.name_en} ${stage.name_ar}`}>{name(stage)}</option>)}
      </MultiSelect>
    </div>
    <MultiSelect id={`${id}-countries`} label={ar?'الدول (اختياري)':'Countries (optional)'} value={form.value.countryIds.map(String)} onValueChange={ids=>form.setCountryIds(ids.map(Number))} disabled={disabled||!form.countries.data}
      placeholder={form.countries.isPending?(ar?'جارٍ تحميل الدول…':'Loading countries…'):(ar?'جميع الدول':'Any country')}
      hint={form.countries.data?.detectedCountryId?(ar?'اقترحنا بلدك بناءً على عنوان الإنترنت. يمكنك تغييره أو مسح الاختيارات ليناسب المحتوى جميع الدول.':'We suggested your country using your IP address. Change it or clear the selections for any country.'):(ar?'اختر الدول المناسبة للمحتوى، أو اترك القائمة فارغة لجميع الدول.':'Choose the countries your content suits, or leave the list empty for any country.')}>
      {groups.map(group=><optgroup key={group} label={group}>{countries.filter(country=>country.group===group).map(country=><option key={country.id} value={country.id} data-search-text={`${country.name_en} ${country.name_ar} ${country.iso_code} ${country.iso_alpha2??''}`}>{name(country)}</option>)}</optgroup>)}
    </MultiSelect>
    {form.countries.isError&&<div className={styles.failure} role="status"><p>{form.value.countryIds.length?(ar?'تعذّر تحميل الدول. اختياراتك محفوظة؛ أعد المحاولة لتغييرها.':'Countries couldn’t load. Your selections are kept; try again to change them.'):(ar?'تعذّر تحميل الدول. يمكنك المتابعة لجميع الدول أو إعادة المحاولة.':'Countries couldn’t load. Continue with any country or try again.')}</p><Button onClick={()=>void form.countries.refetch()}>{ar?'إعادة المحاولة':'Try again'}</Button></div>}
  </div>
}
