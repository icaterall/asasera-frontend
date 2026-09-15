import {useId} from 'react'
import {useAudienceForm} from './useAudienceForm'
import {useTranslation} from 'react-i18next'
import {Select,Button} from '@/design'
import {MultiSelect} from '@/design/MultiSelect'
import {orderedCountries} from './countries'
import styles from './Audience.module.css'

/**
 * The audience is three fields, and each one is exported on its own.
 *
 * WHY. `AudienceFields` lays them out as a pair plus a full-width row, which is
 * right where the audience is a block of its own. On the creation screen the
 * teacher reads one row of related fields at a time — name beside category,
 * then stage, countries and language together — and a block that carries its
 * own two-column grid inside someone else's column produced the squeezed
 * “Computin / g” columns that screen used to show. Callers that want the block
 * keep using `AudienceFields`; callers that are composing their own rows take
 * the fields.
 */

type Form=ReturnType<typeof useAudienceForm>
const optionName=(option:{name_ar:string;name_en:string},ar:boolean)=>ar?option.name_ar||option.name_en:option.name_en

export function AudienceCategoryField({form,disabled=false,optional=false}:{form:Form;disabled?:boolean;optional?:boolean}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
  return <div className={styles.field}>
    <label htmlFor={id}>{optional?(ar?'التصنيف (اختياري)':'Category (optional)'):(ar?'التصنيف':'Category')}</label>
    <Select id={id} aria-label={ar?'التصنيف':'Category'} required={!optional} value={form.value.categoryId??''} onValueChange={value=>form.setCategoryId(value?Number(value):null)} disabled={disabled||!form.refs.data}>
      <option value="">{form.refs.isPending?(ar?'جارٍ التحميل…':'Loading…'):optional?(ar?'بلا تصنيف بعد':'No category yet'):(ar?'اختر تصنيفًا واحدًا':'Choose one category')}</option>
      {form.refs.data?.categories.map(category=><option key={category.id} value={category.id} data-search-text={`${category.name_en} ${category.name_ar}`}>{optionName(category,ar)}</option>)}
    </Select>
  </div>
}

export function AudienceStagesField({form,disabled=false,optional=false,hints=true}:{form:Form;disabled?:boolean;optional?:boolean;hints?:boolean}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
  /* Category and stage travel together: one without the other is the only way
     to get a half-filled audience, so the hint says so where it is chosen. This
     one survives `hints={false}`: it is not an explanation, it is the reason the
     teacher cannot continue. */
  const partial=optional&&!form.empty&&!form.ready&&!!form.refs.data
  const hint=partial?(ar?'اختر التصنيف والمرحلة معًا، أو اتركهما فارغين الآن.':'Choose both a category and a stage, or leave both empty for now.'):hints?(ar?'يمكن أن يناسب المحتوى أكثر من مرحلة.':'Your content can suit more than one stage.'):undefined
  return <MultiSelect id={id} label={ar?'المراحل التعليمية':'Education stages'} required={!optional} value={form.value.educationStageIds.map(String)} onValueChange={ids=>form.setEducationStageIds(ids.map(Number))} disabled={disabled||!form.refs.data}
    placeholder={form.refs.isPending?(ar?'جارٍ التحميل…':'Loading…'):(ar?'اختر مرحلة أو أكثر':'Choose one or more stages')} hint={hint}>
    {form.refs.data?.stages.map(stage=><option key={stage.id} value={stage.id} data-search-text={`${stage.name_en} ${stage.name_ar}`}>{optionName(stage,ar)}</option>)}
  </MultiSelect>
}

export function AudienceCountriesField({form,disabled=false,hints=true}:{form:Form;disabled?:boolean;hints?:boolean}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
  const countries=orderedCountries(form.countries.data?.countries??[],form.countries.data?.detectedCountryId??null,i18n.language)
  const groups=[...new Set(countries.map(country=>country.group))]
  return <div className={styles.stack}>
    <MultiSelect id={id} label={ar?'الدول (اختياري)':'Countries (optional)'} value={form.value.countryIds.map(String)} onValueChange={ids=>form.setCountryIds(ids.map(Number))} disabled={disabled||!form.countries.data}
      placeholder={form.countries.isPending?(ar?'جارٍ تحميل الدول…':'Loading countries…'):(ar?'جميع الدول':'Any country')}
      hint={!hints?undefined:form.countries.data?.detectedCountryId?(ar?'اقترحنا بلدك بناءً على عنوان الإنترنت. يمكنك تغييره أو مسح الاختيارات ليناسب المحتوى جميع الدول.':'We suggested your country using your IP address. Change it or clear the selections for any country.'):(ar?'اختر الدول المناسبة للمحتوى، أو اترك القائمة فارغة لجميع الدول.':'Choose the countries your content suits, or leave the list empty for any country.')}>
      {groups.map(group=><optgroup key={group} label={group}>{countries.filter(country=>country.group===group).map(country=><option key={country.id} value={country.id} data-search-text={`${country.name_en} ${country.name_ar} ${country.iso_code} ${country.iso_alpha2??''}`}>{optionName(country,ar)}</option>)}</optgroup>)}
    </MultiSelect>
    {form.countries.isError&&<div className={styles.failure} role="status"><p>{form.value.countryIds.length?(ar?'تعذّر تحميل الدول. اختياراتك محفوظة؛ أعد المحاولة لتغييرها.':'Countries couldn’t load. Your selections are kept; try again to change them.'):(ar?'تعذّر تحميل الدول. يمكنك المتابعة لجميع الدول أو إعادة المحاولة.':'Countries couldn’t load. Continue with any country or try again.')}</p><Button onClick={()=>void form.countries.refetch()}>{ar?'إعادة المحاولة':'Try again'}</Button></div>}
  </div>
}

/** The categories/stages load failure, which belongs above whatever row holds them. */
export function AudienceLoadFailure({form}:{form:Form}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  if(!form.refs.isError)return null
  return <div role="alert" className={styles.failure}><p>{ar?'تعذّر تحميل التصنيفات والمراحل. أعد المحاولة، وستبقى اختياراتك محفوظة.':'Categories and stages couldn’t load. Try again; your choices will stay here.'}</p><Button onClick={()=>void form.refs.refetch()}>{ar?'إعادة المحاولة':'Try again'}</Button></div>
}

export function AudienceFields({form,disabled=false,optional=false}:{form:Form;disabled?:boolean;optional?:boolean}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  return <div className={styles.fields}>
    <AudienceLoadFailure form={form}/>
    {optional&&<p className={styles.failure} style={{color:'var(--muted)',margin:0}}>{ar?'يمكنك إضافة هذا لاحقًا؛ يساعد على تنظيم مكتبتك.':'You can add this later; it helps organise your library.'}</p>}
    <div className={styles.pair}>
      <AudienceCategoryField form={form} disabled={disabled} optional={optional}/>
      <AudienceStagesField form={form} disabled={disabled} optional={optional}/>
    </div>
    <AudienceCountriesField form={form} disabled={disabled}/>
  </div>
}
