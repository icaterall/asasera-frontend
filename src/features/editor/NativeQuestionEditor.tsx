import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Select } from '@/design'
import { Trash2 } from 'lucide-react'
import { clozePayloadSchema, vocabularyPayloadSchema, type ClozePayload, type DiscussionPayload, type VocabularyPayload } from '@/shared/questions'
import type { SavedWordBoard, WordSpellingPolicy } from '@/shared/word-boards'
import { wordBoardConfigSchema, type AuthoredWordBoards, type WordBoardGenerate } from '@/shared/word-board-contract'
import styles from './Editor.module.css'
import boardStyles from './NativeWordBoardEditor.module.css'

export type NativeQuestionKind = 'cloze' | 'vocabulary' | 'discussion'
type NativePayload = ClozePayload | VocabularyPayload | DiscussionPayload
export type NativeWordBoardRequest = Omit<WordBoardGenerate, 'expectedRevision'>
export type NativeWordBoardTools = { boards: AuthoredWordBoards; generate: (request: NativeWordBoardRequest) => Promise<void> }
export const isNativeQuestionKind = (kind: string): kind is NativeQuestionKind => ['cloze', 'vocabulary', 'discussion'].includes(kind)
const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
const checkboxStyle = { display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 } as const
const exampleNotice = (ar: boolean) => <p role="note">{ar ? 'محتوى تجريبي — استبدله بمحتواك الذي راجعته قبل الاعتماد.' : 'Example content — replace it with your own reviewed material before approval.'}</p>

export function nativeQuestionDefault(kind: 'cloze', language: 'ar' | 'en'): ClozePayload
export function nativeQuestionDefault(kind: 'vocabulary', language: 'ar' | 'en'): VocabularyPayload
export function nativeQuestionDefault(kind: 'discussion', language: 'ar' | 'en'): DiscussionPayload
export function nativeQuestionDefault(kind: NativeQuestionKind, language: 'ar' | 'en'): NativePayload
export function nativeQuestionDefault(kind: NativeQuestionKind, language: 'ar' | 'en'): NativePayload {
  const policy: WordSpellingPolicy = { version: 1, language, diacritics: 'preserve', tatweel: 'preserve', case: 'preserve', spaces: 'preserve' }
  if (kind === 'discussion') return { schemaVersion: 1, pointsMultiplier: 0 }
  if (kind === 'vocabulary') return { schemaVersion: 1, policy, entries: [{ id: 'word_a', word: language === 'ar' ? 'ماء' : 'water', clue: language === 'ar' ? 'تحتاج إليه النباتات.' : 'Plants need this.' }] }
  return { schemaVersion: 1, policy, trimBoundaryWhitespace: true,
    segments: [{ kind: 'text', text: language === 'ar' ? 'تحتاج النباتات إلى ' : 'Plants need ' }, { kind: 'blank', blankId: 'blank_a' }, { kind: 'text', text: '.' }],
    blanks: [{ id: 'blank_a', acceptedAnswers: [language === 'ar' ? 'الماء' : 'water'] }],
  }
}

function ClozeEditor({ payload, onChange, ar }: { payload: ClozePayload; onChange: (payload: ClozePayload) => void; ar: boolean }) {
  const [selection, setSelection] = useState<{ index: number; start: number; end: number } | null>(null)
  const selected = selection && payload.segments[selection.index]
  const selectedText = selected?.kind === 'text' ? selected.text.slice(selection!.start, selection!.end) : ''
  // Textarea offsets use UTF-16; only whole graphemes may become blanks.
  const boundaries = new Set(selected?.kind === 'text' ? [...new Intl.Segmenter(payload.policy.language, { granularity: 'grapheme' }).segment(selected.text)].map(part => part.index).concat(selected.text.length) : [])
  const wholeSelection = !!selection && boundaries.has(selection.start) && boundaries.has(selection.end)
  const example = nativeQuestionDefault('cloze', payload.policy.language)
  const isExample = JSON.stringify([payload.segments, payload.blanks]) === JSON.stringify([example.segments, example.blanks])
  let textNumber = 0
  const insertBlank = () => {
    if (!selection || !wholeSelection || selected?.kind !== 'text' || !selectedText.trim() || selectedText.length > 300 || payload.blanks.length >= 16) return
    const id = newId('blank')
    const before = selected.text.slice(0, selection.start), after = selected.text.slice(selection.end)
    const replacement: ClozePayload['segments'] = [
      ...(before ? [{ kind: 'text' as const, text: before }] : []),
      { kind: 'blank', blankId: id },
      ...(after ? [{ kind: 'text' as const, text: after }] : []),
    ]
    onChange({ ...payload, segments: [...payload.segments.slice(0, selection.index), ...replacement, ...payload.segments.slice(selection.index + 1)], blanks: [...payload.blanks, { id, acceptedAnswers: [selectedText] }] })
    setSelection(null)
  }
  const removeBlank = (id: string) => {
    const answer = payload.blanks.find(blank => blank.id === id)?.acceptedAnswers[0] ?? ''
    const segments: ClozePayload['segments'] = []
    for (const segment of payload.segments) {
      const next = segment.kind === 'blank' && segment.blankId === id ? { kind: 'text' as const, text: answer } : segment
      if (next.kind === 'text' && !next.text) continue
      const previous = segments.at(-1)
      if (previous?.kind === 'text' && next.kind === 'text' && previous.text.length + next.text.length <= 4000) segments[segments.length - 1] = { kind: 'text', text: previous.text + next.text }
      else segments.push(next)
    }
    onChange({ ...payload, segments, blanks: payload.blanks.filter(blank => blank.id !== id) })
    setSelection(null)
  }
  return <section className={styles.advanced} aria-label={ar ? 'النص والفراغات' : 'Passage and blanks'}>
    <h2>{ar ? 'النص والفراغات' : 'Passage and blanks'}</h2>
    {isExample && exampleNotice(ar)}
    <p>{ar ? 'حرّر النص، ثم حدّد كلمة واضغط «حوّل النص المحدد إلى فراغ». اكتب الإجابات المقبولة لكل فراغ.' : 'Edit the passage, then select a word and choose Make selected text a blank. Set the accepted answers for each blank.'}</p>
    {payload.segments.map((segment, index) => segment.kind === 'text'
      ? <label key={`text_${index}`}><span>{ar ? 'جزء النص' : 'Passage text'} {++textNumber}</span><textarea rows={2} maxLength={4000} dir="auto" value={segment.text}
          onSelect={event => setSelection({ index, start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd })}
          onChange={event => { setSelection(null); onChange({ ...payload, segments: payload.segments.map((part, i) => i === index ? { kind: 'text', text: event.target.value } : part) }) }}/></label>
      : <div key={segment.blankId} className={styles.editRow}><label style={{ flex: 1, minWidth: 0 }}><span>{ar ? 'الإجابات المقبولة للفراغ' : 'Accepted answers for blank'} {payload.blanks.findIndex(blank => blank.id === segment.blankId) + 1}</span><textarea rows={2} dir="auto" maxLength={2407}
          value={payload.blanks.find(blank => blank.id === segment.blankId)?.acceptedAnswers.join('\n') ?? ''}
          onChange={event => onChange({ ...payload, blanks: payload.blanks.map(blank => blank.id === segment.blankId ? { ...blank, acceptedAnswers: event.target.value.split('\n') } : blank) })}/></label>
          <Button variant="quiet" disabled={payload.blanks.length <= 1} aria-label={`${ar ? 'احذف الفراغ' : 'Remove blank'} ${payload.blanks.findIndex(blank => blank.id === segment.blankId) + 1}`} onClick={() => removeBlank(segment.blankId)}><Trash2 size={18} aria-hidden="true"/></Button></div>)}
    <p>{ar ? 'بديل مقبول واحد في كل سطر، حتى ٨ بدائل لكل فراغ. حذف الفراغ يعيد أول إجابة إلى النص.' : 'One accepted alternative per line, up to 8 per blank. Removing a blank restores its first answer to the passage.'}</p>
    <Button disabled={!wholeSelection || !selectedText.trim() || selectedText.length > 300 || payload.blanks.length >= 16} onClick={insertBlank}>{ar ? 'حوّل النص المحدد إلى فراغ' : 'Make selected text a blank'}</Button>
    {!!selectedText && !wholeSelection && <p role="status">{ar ? 'حدّد الحرف مع حركاته كاملةً.' : 'Select complete letters, including their combining marks.'}</p>}
    <label style={checkboxStyle}><input type="checkbox" checked={payload.wordBank !== undefined} onChange={event => {
      if (event.target.checked) onChange({ ...payload, wordBank: payload.blanks.map(blank => blank.acceptedAnswers[0] ?? '') })
      else { const { wordBank: _removed, ...next } = payload; onChange(next) }
    }}/><span>{ar ? 'أتح بنك كلمات' : 'Offer a word bank'}</span></label>
    {payload.wordBank !== undefined && <><label><span>{ar ? 'كلمات البنك' : 'Word-bank tiles'}</span><textarea rows={3} dir="auto" maxLength={12039} value={payload.wordBank.join('\n')} onChange={event => onChange({ ...payload, wordBank: event.target.value.split('\n') })}/></label><p>{ar ? 'كلمة في كل سطر. كرّر الكلمة إذا احتاجها أكثر من فراغ؛ حدّ أقصى ٤٠ كلمة.' : 'One tile per line. Repeat a word when more than one blank needs it; up to 40 tiles.'}</p></>}
    <SpellingRules policy={payload.policy} onChange={policy => onChange({ ...payload, policy })} ar={ar}/>
    <label style={checkboxStyle}><input type="checkbox" checked={payload.trimBoundaryWhitespace} onChange={event => onChange({ ...payload, trimBoundaryWhitespace: event.target.checked })}/><span>{ar ? 'تجاهل المسافات في بداية الإجابة ونهايتها' : 'Ignore leading and trailing answer spaces'}</span></label>
    {!clozePayloadSchema.safeParse(payload).success && <p role="status">{ar ? 'أكمل النص والإجابات المقبولة قبل الحفظ.' : 'Complete the passage and accepted answers before saving.'}</p>}
  </section>
}

function SpellingRules({ policy, onChange, ar }: { policy: WordSpellingPolicy; onChange: (policy: WordSpellingPolicy) => void; ar: boolean }) {
  const check = (label: string, checked: boolean, change: (checked: boolean) => void) => <label style={checkboxStyle}><input type="checkbox" checked={checked} onChange={event => change(event.target.checked)}/><span>{label}</span></label>
  return <details><summary style={{ minHeight: 44, paddingBlock: 12, cursor: 'pointer' }}>{ar ? 'قواعد الإملاء' : 'Spelling rules'}</summary>
    <label><span>{ar ? 'لغة الكلمات' : 'Word language'}</span><Select aria-label={ar ? 'لغة الكلمات' : 'Word language'} value={policy.language} onValueChange={value => onChange({ ...policy, language: value === 'ar' ? 'ar' : 'en' })}><option value="ar">{ar ? 'العربية' : 'Arabic'}</option><option value="en">{ar ? 'الإنجليزية' : 'English'}</option></Select></label>
    {policy.language === 'ar' && <>
      {check(ar ? 'تجاهل الحركات عند المطابقة' : 'Ignore Arabic diacritics', policy.diacritics === 'ignore', checked => onChange({ ...policy, diacritics: checked ? 'ignore' : 'preserve' }))}
      {check(ar ? 'تجاهل التطويل عند المطابقة' : 'Ignore tatweel', policy.tatweel === 'ignore', checked => onChange({ ...policy, tatweel: checked ? 'ignore' : 'preserve' }))}
      <p>{ar ? 'تبقى الهمزات وة/ه وى/ي حروفًا مختلفة.' : 'Hamza variants, ة/ه and ى/ي remain different letters.'}</p>
    </>}
    {policy.language === 'en' && check(ar ? 'تجاهل حالة الأحرف الإنجليزية' : 'Ignore letter case', policy.case === 'ignore', checked => onChange({ ...policy, case: checked ? 'ignore' : 'preserve' }))}
    {check(ar ? 'تجاهل المسافات عند المطابقة' : 'Ignore spaces when matching', policy.spaces === 'ignore', checked => onChange({ ...policy, spaces: checked ? 'ignore' : 'preserve' }))}
  </details>
}

function VocabularyEditor({ payload, onChange, ar, wordBoards }: { payload: VocabularyPayload; onChange: (payload: VocabularyPayload) => void; ar: boolean; wordBoards?: NativeWordBoardTools }) {
  return <section className={styles.advanced} aria-label={ar ? 'الكلمات والتلميحات' : 'Words and clues'}>
    <h2>{ar ? 'الكلمات والتلميحات' : 'Words and clues'}</h2>
    {JSON.stringify(payload.entries) === JSON.stringify(nativeQuestionDefault('vocabulary', payload.policy.language).entries) && exampleNotice(ar)}
    <p>{ar ? 'أدخل الكلمات التي راجعتها. أضف تلميحًا لكل كلمة لاستخدامها في الكلمات المتقاطعة.' : 'Enter your reviewed words. Add a clue for each word to use it in a crossword.'}</p>
    {payload.entries.map((entry, index) => <div key={entry.id} style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
      <div className={styles.matchEditor} style={{ flex: 1, minWidth: 0 }}>
        <label><span>{ar ? 'الكلمة' : 'Word'} {index + 1}</span><input dir="auto" maxLength={1024} value={entry.word} onChange={event => onChange({ ...payload, entries: payload.entries.map(item => item.id === entry.id ? { ...item, word: event.target.value } : item) })}/></label>
        <label><span>{ar ? 'التلميح' : 'Clue'} {index + 1}</span><input dir="auto" maxLength={500} value={entry.clue ?? ''} onChange={event => onChange({ ...payload, entries: payload.entries.map(item => item.id === entry.id ? { id: item.id, word: item.word, ...(event.target.value ? { clue: event.target.value } : {}) } : item) })}/></label>
      </div>
      <Button variant="quiet" disabled={payload.entries.length <= 1} aria-label={`${ar ? 'احذف الكلمة' : 'Remove word'} ${index + 1}`} onClick={() => onChange({ ...payload, entries: payload.entries.filter(item => item.id !== entry.id) })}><Trash2 size={18} aria-hidden="true"/></Button>
    </div>)}
    <Button disabled={payload.entries.length >= 40} onClick={() => onChange({ ...payload, entries: [...payload.entries, { id: newId('word'), word: '' }] })}>{ar ? 'أضف كلمة' : 'Add word'}</Button>
    <SpellingRules policy={payload.policy} onChange={policy => onChange({ ...payload, policy })} ar={ar}/>
    {!vocabularyPayloadSchema.safeParse(payload).success && <p role="status">{ar ? 'أكمل كل كلمة، واستخدم لغة واحدة، وتحقّق من عدم تكرار الكلمات.' : 'Complete each word, use one language, and check for duplicate words.'}</p>}
    {wordBoards && <WordBoardEditor payload={payload} tools={wordBoards} ar={ar}/>}
  </section>
}

function WordBoardEditor({ payload, tools, ar }: { payload: VocabularyPayload; tools: NativeWordBoardTools; ar: boolean }) {
  const t = (arabic: string, english: string) => ar ? arabic : english
  const [kind, setKind] = useState<'word-search' | 'crossword'>(tools.boards['word-search'] ? 'word-search' : tools.boards.crossword ? 'crossword' : 'word-search')
  const [config, setConfig] = useState(() => tools.boards[kind]?.board.config ?? { seed: 41, rows: 8, columns: 8, allowReverse: false, allowDiagonal: false, maxWork: 50000 })
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const inFlight = useRef(false), retry = useRef<{ fingerprint: string; request: NativeWordBoardRequest } | null>(null)
  const valid = vocabularyPayloadSchema.safeParse(payload).success && wordBoardConfigSchema.safeParse(config).success
  const generate = async () => {
    if (inFlight.current || !valid) return
    inFlight.current = true; setBusy(true); setError('')
    const fingerprint = JSON.stringify({ kind, config, payload })
    const request = retry.current?.fingerprint === fingerprint ? retry.current.request : { kind, config, requestId: crypto.randomUUID() }
    retry.current = { fingerprint, request }
    try { await tools.generate(request); retry.current = null }
    catch (failure) { setError(`${t('تعذّر إنشاء اللوحة. أعد المحاولة بالإعدادات نفسها، أو أعد تحميل السؤال إذا تغيّرت نسخته.', 'Could not generate the board. Retry these settings, or reload the question if its revision changed.')}${failure instanceof Error ? ` ${failure.message}` : ''}`) }
    finally { inFlight.current = false; setBusy(false) }
  }
  return <details className={boardStyles.editor}>
    <summary>{t('لوحات الكلمات', 'Word boards')}</summary>
    <p>{t('إنشاء محلي من كلماتك دون ذكاء اصطناعي أو رصيد. يُحفظ السؤال أولًا، ثم تُحفظ اللوحة بدل اللوحة السابقة من النوع نفسه. هذا لا يعتمد النشاط.', 'Build locally from your words without AI or credits. The question saves first, then this replaces the saved board of the same kind. This does not approve the activity.')}</p>
    <fieldset disabled={busy} aria-label={t('إعدادات لوحة الكلمات', 'Word-board settings')}>
      <label><span>{t('نوع اللوحة', 'Board type')}</span><Select value={kind} aria-label={t('نوع اللوحة', 'Board type')} onValueChange={value => { setKind(value === 'crossword' ? 'crossword' : 'word-search'); setError('') }}><option value="word-search">{t('البحث عن الكلمات', 'Word search')}</option><option value="crossword">{t('الكلمات المتقاطعة', 'Crossword')}</option></Select></label>
      <div className={boardStyles.settings}>
        {(['rows', 'columns', 'seed'] as const).map(field => <label key={field}><span>{field === 'rows' ? t('الصفوف', 'Rows') : field === 'columns' ? t('الأعمدة', 'Columns') : t('رقم الترتيب', 'Layout seed')}</span><input type="number" min={field === 'seed' ? 0 : 1} max={field === 'seed' ? 4294967295 : 20} step={1} value={Number.isNaN(config[field]) ? '' : config[field]} onChange={event => setConfig({ ...config, [field]: event.target.valueAsNumber })}/></label>)}
      </div>
      <p>{t('نفس الكلمات والإعدادات تعطي نفس الترتيب. غيّر رقم الترتيب لتجربة ترتيب آخر.', 'The same words and settings produce the same layout. Change the layout seed to try another arrangement.')}</p>
      {kind === 'word-search' && <div className={boardStyles.directions}>
        <label><input type="checkbox" checked={config.allowReverse} onChange={event => setConfig({ ...config, allowReverse: event.target.checked })}/><span>{t('السماح بالاتجاه المعاكس', 'Allow reverse directions')}</span></label>
        <label><input type="checkbox" checked={config.allowDiagonal} onChange={event => setConfig({ ...config, allowDiagonal: event.target.checked })}/><span>{t('السماح بالاتجاه القطري', 'Allow diagonal directions')}</span></label>
      </div>}
      {!valid && <p role="status">{t('أكمل الكلمات، واختر بين صف واحد و٢٠ صفًا وعمود واحد و٢٠ عمودًا ورقم ترتيب صحيحًا.', 'Complete the words and choose 1–20 rows and columns, with a valid whole-number layout seed.')}</p>}
      <Button loading={busy} disabled={!valid || busy} onClick={() => void generate()}>{error ? t('أعد إنشاء اللوحة وحفظها', 'Retry generating and saving board') : t('أنشئ اللوحة واحفظها', 'Generate and save board')}</Button>
    </fieldset>
    {error && <p role="alert">{error}</p>}
    {Object.entries(tools.boards).some(([, saved]) => saved?.board.status === 'partial') && <p role="alert">{t('الاعتماد متوقف: توجد لوحة غير مكتملة. راجع الكلمات غير الموضوعة وأعد إنشاء اللوحة؛ لا تُحذف الكلمات تلقائيًا.', 'Approval is blocked: a saved board is incomplete. Review every unplaced word and regenerate that board; words are never silently removed.')}</p>}
    {tools.boards[kind] ? <SavedBoardPreview key={tools.boards[kind].requestId} board={tools.boards[kind].board} ar={ar}/> : <p>{t('لا توجد لوحة محفوظة لهذا النوع. احفظ لوحة ثم راجعها قبل اعتماد النشاط.', 'No saved board of this kind. Generate a board and review it before approving the activity.')}</p>}
  </details>
}

function SavedBoardPreview({ board, ar }: { board: SavedWordBoard; ar: boolean }) {
  const [solution, setSolution] = useState(false), t = (arabic: string, english: string) => ar ? arabic : english
  const numbers = new Map(board.placements.map(entry => [`${entry.cells[0]?.row}:${entry.cells[0]?.column}`, entry.number]))
  const solutionCells = new Set(board.placements.flatMap(entry => entry.cells.map(cell => `${cell.row}:${cell.column}`)))
  const reason = (value: string) => ({ 'too-long': t('الكلمة أطول من مساحة اللوحة', 'Word exceeds board dimensions'), 'no-placement': t('لا يوجد موضع متصل', 'No connecting placement'), 'work-limit': t('وصل الإنشاء إلى حد البحث', 'Search limit reached') }[value] ?? value)
  return <section className={boardStyles.preview} aria-label={t('اللوحة المحفوظة', 'Saved word board')}>
    <h3>{t('معاينة اللوحة المحفوظة', 'Saved board preview')}</h3>
    <p>{t(`وُضعت ${board.placements.length} من ${board.placements.length + board.unplaced.length} كلمات`, `${board.placements.length} of ${board.placements.length + board.unplaced.length} words placed`)} · {board.config.rows} × {board.config.columns} · {t('رقم الترتيب', 'Layout seed')} {board.config.seed}</p>
    <p>{t('هذه هي اللوحة المحفوظة، وليست إعادة إنشاء. تعديل الكلمات أو الإملاء يمسح اللوحات المحفوظة ويستلزم إنشاءها مجددًا.', 'This is the saved board, not a regeneration. Editing words or spelling rules clears saved boards and requires generating them again.')}</p>
    <label className={boardStyles.solution}><input type="checkbox" checked={solution} onChange={event => setSolution(event.target.checked)}/><span>{t('أظهر حل المعلّم', 'Show instructor solution')}</span></label>
    <div className={boardStyles.gridScroll} tabIndex={0} role="region" aria-label={t('معاينة قابلة للتمرير؛ الإحداثيات من أعلى اليسار', 'Scrollable preview; coordinates start at top left')}>
      <table className={boardStyles.grid} dir="ltr" aria-label={t('معاينة اللوحة المحفوظة', 'Saved board preview')}><tbody>{board.matrix.map((row, r) => <tr key={r}>{row.map((cell, c) => {
        const key = `${r}:${c}`, number = board.kind === 'crossword' ? numbers.get(key) : undefined
        const text = cell === null ? '' : board.kind === 'word-search' || solution ? cell : ''
        return <td key={c} data-blocked={cell === null} data-solution={solution && solutionCells.has(key)} aria-label={t(`صف ${r + 1} عمود ${c + 1}: ${cell === null ? 'مغلق' : text || 'فارغ'}`, `Row ${r + 1} column ${c + 1}: ${cell === null ? 'blocked' : text || 'blank'}`)}>{!!number && <small>{number}</small>}<bdi>{text}</bdi></td>
      })}</tr>)}</tbody></table>
    </div>
    <ul className={boardStyles.words}>{board.placements.map(entry => <li key={entry.entryId}>{board.kind === 'crossword' ? <>{entry.number}. {entry.direction.rowStep === 0 ? t('أفقي', 'Across') : t('عمودي', 'Down')} — <bdi>{entry.clue}</bdi>{solution && <>: <bdi>{entry.word}</bdi></>}</> : <bdi>{entry.word}</bdi>}</li>)}</ul>
    {board.unplaced.length > 0 && <><h4>{t('كلمات لم توضع', 'Unplaced words')}</h4><ul className={boardStyles.words}>{board.unplaced.map(entry => <li key={entry.entryId}><bdi>{entry.word}</bdi> — <span>{reason(entry.reason)}</span></li>)}</ul><p>{t('جرّب أبعادًا أكبر أو ترتيبًا آخر. للكلمات المتقاطعة، راجع وجود حروف مشتركة والتلميحات. جميع الكلمات الأصلية ما زالت محفوظة.', 'Try larger dimensions or another layout seed. For crosswords, review shared letters and clues. All original words are still saved.')}</p></>}
    {board.status === 'ready' && <p role="status">{t('وُضعت كل الكلمات. راجع اللوحة ثم اعتمد النشاط من زر الاعتماد المعتاد.', 'All words placed. Review the board, then use the existing activity approval button.')}</p>}
  </section>
}

function DiscussionEditor({ payload, onChange, ar }: { payload: DiscussionPayload; onChange: (payload: DiscussionPayload) => void; ar: boolean }) {
  return <section className={styles.advanced} aria-label={ar ? 'إرشادات المناقشة' : 'Discussion guidance'}>
    <h2>{ar ? 'إرشادات المناقشة' : 'Discussion guidance'}</h2>
    <p>{ar ? 'لا تُقيَّم إجابات المناقشة تلقائيًا.' : 'Discussion responses are not automatically graded.'}</p>
    <label><span>{ar ? 'إجابة مرجعية (اختياري)' : 'Reference response (optional)'}</span><textarea rows={4} maxLength={2000} dir="auto" value={payload.referenceResponse ?? ''}
      onChange={event => onChange({ schemaVersion: 1, pointsMultiplier: 0, ...(event.target.value ? { referenceResponse: event.target.value } : {}) })}/></label>
    <p>{ar ? 'تظهر الإجابة المرجعية فقط عندما تسمح إعدادات النشاط بكشفها.' : 'The reference response is shown only when the activity allows a reveal.'}</p>
  </section>
}

export function NativeQuestionEditor({ kind, payload, onChange, wordBoards }: { kind: NativeQuestionKind; payload: unknown; onChange: (payload: NativePayload) => void; wordBoards?: NativeWordBoardTools }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar')
  if (!payload || typeof payload !== 'object' || !('schemaVersion' in payload) || payload.schemaVersion !== 1) return <p role="alert">{ar ? 'تعذّر قراءة محتوى السؤال.' : 'Could not read this question content.'}</p>
  if (kind === 'cloze') return <ClozeEditor payload={payload as ClozePayload} onChange={onChange} ar={ar}/>
  if (kind === 'vocabulary') return <VocabularyEditor payload={payload as VocabularyPayload} onChange={onChange} ar={ar} wordBoards={wordBoards}/>
  return <DiscussionEditor payload={payload as DiscussionPayload} onChange={onChange} ar={ar}/>
}
