import { Select } from '@/design'
import { useId } from 'react'
import { Baby, BookOpen, GraduationCap, Compass, Check } from 'lucide-react'
import { gradesFor, stageNames, studyStages, type LearningProfile } from '@/shared/student'
import styles from './Student.module.css'

const icons = [Baby, BookOpen, GraduationCap, Compass]
export function StageGradePicker({ value, onChange, ar, disabled = false }: {
  value: LearningProfile; onChange: (value: LearningProfile) => void; ar: boolean; disabled?: boolean
}) {
  const id = useId(), lang = ar ? 'ar' : 'en', grades = gradesFor(value.stage)
  const descriptions = ar ? ['الأرقام والأشكال والاكتشاف', 'من الصف الأول إلى الثاني عشر', 'سنوات الدراسة وما بعدها', 'بدون مرحلة أو صف محدد'] : ['Numbers, shapes and discovery', 'Grades 1 through 12', 'Study years and beyond', 'No specific stage or grade']
  return <fieldset className={styles.picker} disabled={disabled}>
    <legend>{ar ? 'مرحلتك التعليمية' : 'Your learning stage'}</legend>
    <div className={styles.stageGrid}>{studyStages.map((stage, i) => {
      const Icon = icons[i]!
      return <label key={stage} className={styles.stageOption} data-selected={value.stage === stage}>
        <input type="radio" name={id} value={stage} checked={value.stage === stage} onChange={() => onChange({ stage, grade: null })} />
        <Icon size={28} aria-hidden="true" /><span><strong>{stageNames[stage][lang]}</strong><small>{descriptions[i]}</small></span>
        {value.stage === stage && <Check size={20} aria-hidden="true" />}
      </label>
    })}</div>
    {grades.length > 0 && <label className={styles.field} htmlFor={`${id}-grade`}>
      {ar ? 'الصف أو السنة (اختياري)' : 'Grade or year (optional)'}
      <Select id={`${id}-grade`} disabled={disabled} value={value.grade ?? ''} onValueChange={e => onChange({ ...value, grade: e || null })}>
        <option value="">{ar ? 'مرحلة عامة — بدون صف محدد' : 'Keep this stage general'}</option>
        {grades.map(grade => <option value={grade.id} key={grade.id}>{grade[lang]}</option>)}
      </Select>
    </label>}
    <p className={styles.hint}>{ar ? 'يمكنك تغيير اختيارك لاحقًا. لا نطلب تاريخ ميلادك.' : 'You can change this later. We do not ask for your date of birth.'}</p>
  </fieldset>
}
