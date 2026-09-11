import {useId} from 'react'
import {DndContext,KeyboardSensor,PointerSensor,TouchSensor,closestCenter,useSensor,useSensors,type DragEndEvent} from '@dnd-kit/core'
import {SortableContext,arrayMove,sortableKeyboardCoordinates,useSortable,verticalListSortingStrategy} from '@dnd-kit/sortable'
import {ChevronDown,ChevronUp,GripVertical,ImagePlus,Plus,Trash2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {Button,Select,type AnswerSlot} from '@/design'
import {ORDER_MODES,impliedOrderConstraints,type OrderConstraint,type OrderMode,type OrderPayload} from '@/shared/questions'
import {FormattedInput} from './FormattedInput'
import {Glyph,SLOT_TOKENS} from './McqCanvas'
import {ImageRemoveButton,ImageUpload,UploadBar,useImage,useUploadProgress} from './ImageUpload'
import {MediaField} from './MediaPicker'
import {readInline} from './rich-document'
import editor from './Editor.module.css'
import styles from './OrderCanvas.module.css'

/**
 * The canvas for an ordering question — plan §12, and the product brief's
 * "Order / رتّب".
 *
 * THE TEACHER TYPES THE ANSWER, NOT THE PUZZLE. Rows are entered in their
 * correct order and the server shuffles them per learner (`publicQuestion` in
 * realtime/content.ts). There is no "shuffle" control on purpose: a teacher who
 * arranges the jumble by hand has done the system's work, and can still hand
 * one class a question that is already solved.
 *
 * The row IS the tile the learner will drag, at the size they will drag it,
 * carrying the same colour, shape, picture and rich text as an answer in a
 * quiz — because an item may be a photograph or a diagram rather than a
 * sentence, and the teacher needs to see what the class will see.
 */

export const MIN_ITEMS = 2, MAX_ITEMS = 8

type OrderItem = OrderPayload['items'][number]

const newKey = () => `item_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`

/** Colour and shape cycle at six. In an ordering the POSITION carries the
 *  meaning, so a repeated shape at item seven costs nothing — unlike a quiz,
 *  where colour and shape ARE the answer's identity. */
const slotFor = (index: number) => ((index % 6) + 1) as AnswerSlot

export const hasItemContent = (item: OrderItem): boolean =>
  !!item.image?.trim() || readInline(item.text).some(node => !!(node.text ?? node.attrs?.latex ?? '').trim())

/**
 * The picture slot, with its own delete over it.
 *
 * Deleting the PICTURE and deleting the ITEM are different acts with different
 * consequences, so they are different controls in different places: this one
 * sits on the image it removes, and the item's own bin stays under the shape.
 * One bin that meant either would eventually mean the wrong one.
 */
function Thumb({imageKey, alt, onRemove, label}: {imageKey: string; alt: string; onRemove: () => void; label: string}) {
  const url = useImage(imageKey)
  if (!url) return null
  return (
    <span className={styles.thumbWrap}>
      <img className={styles.thumb} src={url} alt={alt}/>
      <ImageRemoveButton className={styles.thumbRemove} onRemove={onRemove} label={label}/>
    </span>
  )
}

interface RowProps {
  item: OrderItem
  index: number
  count: number
  onText: (text: string) => void
  onImage: (image: string | undefined) => void
  onRemove: () => void
  onMove: (step: number) => void
}

function Row({item, index, count, onText, onImage, onRemove, onMove}: RowProps) {
  const {i18n} = useTranslation(), ar = i18n.language.startsWith('ar')
  const sortable = useSortable({id: item.key})
  const upload = useUploadProgress()
  const token = SLOT_TOKENS[slotFor(index)]
  const filled = hasItemContent(item)
  const spoken = readInline(item.text).map(n => n.text ?? '').join('').trim() || `${ar ? 'العنصر' : 'Item'} ${index + 1}`

  return (
    <li
      ref={sortable.setNodeRef}
      className={styles.row}
      data-order-item=""
      data-answer-cell=""
      data-dragging={sortable.isDragging}
      style={{
        ['--tile' as string]: token.fill,
        ['--tileFg' as string]: token.fg,
        transform: sortable.transform ? `translate3d(0,${sortable.transform.y}px,0)` : undefined,
        transition: sortable.transition,
      }}
    >
      <span className={styles.lead}>
        <Glyph slot={slotFor(index)} />
        {count > MIN_ITEMS && (
          <button type="button" className={editor.answerRemove} onClick={onRemove}
            aria-label={ar ? `احذف العنصر ${index + 1}` : `Remove item ${index + 1}`}
            title={ar ? 'احذف هذا العنصر' : 'Remove this item'}><Trash2 size={16} aria-hidden="true"/></button>
        )}
      </span>

      <div className={styles.body} data-empty={!filled}>
        {item.image && <Thumb imageKey={item.image} alt={spoken} onRemove={() => onImage(undefined)}
          label={ar ? 'احذف صورة العنصر' : 'Remove item image'}/>}
        <FormattedInput
          className={`${editor.optionText} ${styles.text}`}
          value={item.text}
          maxLength={300}
          placeholder={item.image ? (ar ? 'نص إضافي (اختياري)' : 'Text (optional)') : (ar ? `أضف العنصر ${index + 1}` : `Add item ${index + 1}`)}
          label={ar ? `نص العنصر ${index + 1}` : `Item ${index + 1} text`}
          onChange={onText}
        />

        <button type="button" className={editor.answerImageButton} disabled={upload.busy} aria-busy={upload.busy}
          aria-label={ar ? `صورة العنصر ${index + 1}` : `Item ${index + 1} image`}
          title={ar ? 'إضافة أو استبدال صورة' : 'Add or replace image'}
          onClick={event => event.currentTarget.closest('[data-answer-cell]')?.querySelector<HTMLInputElement>('input[type=file]')?.click()}
        ><ImagePlus size={22}/></button>

        {/*
          Two ways to move a row, always both. Dragging is the fast one and the
          one a touch screen expects; the arrows are how it is done with a
          keyboard, with one hand, or on a small screen where a drag competes
          with the page's own scroll. Neither is a fallback for the other.
        */}
        <span className={styles.nudges}>
          <button type="button" className={styles.nudge} disabled={index === 0} onClick={() => onMove(-1)}
            aria-label={ar ? `انقل «${spoken}» للأعلى` : `Move “${spoken}” up`}><ChevronUp size={17} aria-hidden="true"/></button>
          <button type="button" className={styles.nudge} disabled={index === count - 1} onClick={() => onMove(1)}
            aria-label={ar ? `انقل «${spoken}» للأسفل` : `Move “${spoken}” down`}><ChevronDown size={17} aria-hidden="true"/></button>
        </span>

        {/* The drag activator is the handle alone. A sensor on the whole row
            would make selecting a word in the text field impossible. */}
        <button
          type="button"
          ref={sortable.setActivatorNodeRef}
          {...sortable.attributes}
          {...sortable.listeners}
          className={styles.handle}
          aria-label={ar ? `أعد ترتيب «${spoken}»` : `Reorder “${spoken}”`}
        ><GripVertical size={22} aria-hidden="true"/></button>

        <UploadBar state={upload.state} label={ar ? 'رفع الصورة' : 'Image upload'}/>
      </div>

      {/* Headless — the file input only. The tile draws the indicator. */}
      <ImageUpload compact onProgress={upload.onProgress} imageKey={item.image ?? null} showPreview={false}
        onImage={image => onImage(image)}/>
    </li>
  )
}

export interface OrderCanvasProps {
  payload: OrderPayload
  mediaKey: string | null
  onMediaChange: (key: string | null) => void
  onQuestionImageBusy?: (busy: boolean) => void
  onChange: (payload: OrderPayload) => void
}

export function OrderCanvas({payload, mediaKey, onMediaChange, onQuestionImageBusy, onChange}: OrderCanvasProps) {
  const {i18n} = useTranslation(), ar = i18n.language.startsWith('ar')
  const listId = useId()
  const mode: OrderMode = payload.mode ?? 'exact'
  const label = (key: string) => {
    const item = payload.items.find(i => i.key === key)
    const written = readInline(item?.text ?? '').map(n => n.text ?? '').join('').trim()
    return written || `${ar ? 'العنصر' : 'Item'} ${payload.correct.indexOf(key) + 1}`
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
    useSensor(TouchSensor, {activationConstraint: {delay: 150, tolerance: 8}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
  )

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= payload.correct.length || from === to) return
    onChange(withCorrect(payload, arrayMove(payload.correct, from, to)))
  }
  const dragEnd = (event: DragEndEvent) => {
    if (!event.over || event.over.id === event.active.id) return
    reorder(payload.correct.indexOf(String(event.active.id)), payload.correct.indexOf(String(event.over.id)))
  }
  const patchItem = (key: string, patch: Partial<OrderItem>) =>
    onChange({...payload, items: payload.items.map(i => (i.key === key ? {...i, ...patch} : i))})

  return (
    <>
      <div className={styles.canvas}>
        <div className={styles.media}>
          <MediaField
            onBusyChange={onQuestionImageBusy}
            label={ar ? 'ابحث عن وسائط وأدرجها (اختياري)' : 'Find and insert media (Optional)'}
            imageKey={mediaKey}
            onImage={onMediaChange}
            onRemove={() => onMediaChange(null)}
          />
        </div>

        <div className={styles.column}>
          <p className={styles.hint}>
            {ar
              ? 'اكتب العناصر بترتيبها الصحيح. يخلطها النظام لكل طالب عند العرض.'
              : 'Write the items in their correct order. Each learner sees them shuffled.'}
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
            <SortableContext items={payload.correct} strategy={verticalListSortingStrategy}>
              <ol className={styles.list} id={listId}>
                {payload.correct.map((key, index) => {
                  const item = payload.items.find(i => i.key === key)
                  if (!item) return null
                  return (
                    <Row
                      key={key}
                      item={item}
                      index={index}
                      count={payload.correct.length}
                      onText={text => patchItem(key, {text})}
                      onImage={image => patchItem(key, {image})}
                      onMove={step => reorder(index, index + step)}
                      onRemove={() => onChange(removeItem(payload, key))}
                    />
                  )
                })}
              </ol>
            </SortableContext>
          </DndContext>

          {payload.correct.length < MAX_ITEMS && (
            <div className={editor.answerCount}>
              <Button variant="secondary" icon={<Plus size={17}/>} onClick={() => onChange(addItem(payload))}>
                {ar ? 'أضف عنصرًا' : 'Add item'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/*
        Collapsed, and it stays collapsed for the teacher who just wants three
        steps in order — the common case the brief optimises for.
      */}
      <details className={styles.advanced}>
        <summary>{ar ? 'إعدادات متقدمة' : 'Advanced settings'}</summary>
        <div>
          <label>
            {ar ? 'طريقة التحقق من الترتيب' : 'How the order is judged'}
            <Select value={mode} onValueChange={value => onChange(withMode(payload, value as OrderMode))}>
              <option value="exact">{ar ? 'ترتيب واحد صحيح' : 'One exact order'}</option>
              <option value="partial">{ar ? 'ما يهم هو العلاقات فقط' : 'Only these dependencies matter'}</option>
              {/* Flexible is stored and marked, but has no authoring UI yet; offered
                  only so a question that already uses it is not silently rewritten. */}
              {mode === 'flexible' && <option value="flexible">{ar ? 'أكثر من ترتيب مقبول' : 'Several accepted orders'}</option>}
            </Select>
          </label>

          {mode === 'exact' && (
            <p className={styles.modeNote}>
              {ar ? 'الترتيب المكتوب أعلاه هو الترتيب الصحيح الوحيد.' : 'The order written above is the only correct one.'}
            </p>
          )}

          {mode === 'partial' && (
            <>
              <p className={styles.modeNote}>
                {ar
                  ? 'احذف أي علاقة لا تهم. ما يبقى هو ما يُحاسب عليه الطالب، وما عداه يُقبل بأي ترتيب.'
                  : 'Delete any dependency that does not matter. What is left is what the learner is judged on; anything else may come in any order.'}
              </p>
              <ul className={styles.rules}>
                {(payload.constraints ?? []).map((constraint, index) => (
                  <li key={`${constraint.before}>${constraint.after}`} className={styles.rule}>
                    <Select aria-label={ar ? 'العنصر الأول' : 'Earlier item'} value={constraint.before}
                      onValueChange={value => onChange(patchConstraint(payload, index, {before: value}))}
                    >{payload.correct.map(key => <option key={key} value={key}>{label(key)}</option>)}</Select>
                    <span>{ar ? 'قبل' : 'before'}</span>
                    <Select aria-label={ar ? 'العنصر التالي' : 'Later item'} value={constraint.after}
                      onValueChange={value => onChange(patchConstraint(payload, index, {after: value}))}
                    >{payload.correct.map(key => <option key={key} value={key}>{label(key)}</option>)}</Select>
                    <Button variant="quiet" aria-label={ar ? 'احذف هذه العلاقة' : 'Delete this dependency'}
                      onClick={() => onChange({...payload, constraints: (payload.constraints ?? []).filter((_, i) => i !== index)})}>
                      <Trash2 size={17}/>
                    </Button>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" icon={<Plus size={17}/>} onClick={() => onChange(addConstraint(payload))}>
                {ar ? 'أضف علاقة' : 'Add dependency'}
              </Button>
            </>
          )}

          {mode === 'flexible' && (
            <p className={styles.modeNote}>
              {ar
                ? `هذا السؤال يقبل ${(payload.alternates?.length ?? 0) + 1} ترتيبات. تحريرها غير متاح هنا بعد.`
                : `This question accepts ${(payload.alternates?.length ?? 0) + 1} orders. Editing them here is not available yet.`}
            </p>
          )}
        </div>
      </details>
    </>
  )
}

/* ---- payload edits -------------------------------------------------------
 * Pure, and kept out of the component, so the invariants the stored schema
 * enforces (constraints name real items, `correct` lists every item exactly
 * once) live in one readable place rather than inside five event handlers.
 */

/** Drops constraints that no longer name a present item. */
function prune(payload: OrderPayload): OrderPayload {
  if (!payload.constraints) return payload
  const keys = new Set(payload.items.map(i => i.key))
  const seen = new Set<string>()
  const constraints = payload.constraints.filter(c => {
    const id = `${c.before}>${c.after}`
    if (c.before === c.after || !keys.has(c.before) || !keys.has(c.after) || seen.has(id)) return false
    seen.add(id)
    return true
  })
  return {...payload, constraints}
}

function withCorrect(payload: OrderPayload, correct: string[]): OrderPayload {
  /*
   * In `partial`, the dependencies are the answer key — but the stored schema
   * also requires `correct` to satisfy them, so a teacher who drags a row past
   * one of their own dependencies would write a payload that cannot validate.
   * Re-derive the chain when the old one was simply the full chain; otherwise
   * keep what they wrote and let publication report the contradiction by name.
   */
  const next = {...payload, correct}
  if ((payload.mode ?? 'exact') !== 'partial') return next
  const was = payload.constraints ?? []
  const chain = impliedOrderConstraints(payload.correct)
  const isFullChain = was.length === chain.length && chain.every(c => was.some(w => w.before === c.before && w.after === c.after))
  return isFullChain ? {...next, constraints: impliedOrderConstraints(correct)} : next
}

function addItem(payload: OrderPayload): OrderPayload {
  const key = newKey()
  return {...payload, items: [...payload.items, {key, text: ''}], correct: [...payload.correct, key]}
}

function removeItem(payload: OrderPayload, key: string): OrderPayload {
  return prune({
    ...payload,
    items: payload.items.filter(i => i.key !== key),
    correct: payload.correct.filter(k => k !== key),
    alternates: payload.alternates?.map(sequence => sequence.filter(k => k !== key)),
  })
}

/**
 * Switching to `partial` seeds the full chain from the order already written.
 *
 * Starting empty would mean "nothing matters", which marks every arrangement
 * correct — a mode change that silently makes a question impossible to get
 * wrong. Starting from the full chain means the question behaves exactly as it
 * did a moment ago, and the teacher's job is to DELETE the links that do not
 * matter.
 */
function withMode(payload: OrderPayload, mode: OrderMode): OrderPayload {
  if (!ORDER_MODES.includes(mode)) return payload
  if (mode === 'exact') return {...payload, mode: undefined, constraints: undefined, alternates: undefined}
  if (mode === 'partial') return {...payload, mode, alternates: undefined, constraints: payload.constraints?.length ? payload.constraints : impliedOrderConstraints(payload.correct)}
  return {...payload, mode, constraints: undefined}
}

function addConstraint(payload: OrderPayload): OrderPayload {
  const existing = payload.constraints ?? []
  const spare = impliedOrderConstraints(payload.correct).find(c => !existing.some(e => e.before === c.before && e.after === c.after))
  return spare ? {...payload, constraints: [...existing, spare]} : payload
}

function patchConstraint(payload: OrderPayload, index: number, patch: Partial<OrderConstraint>): OrderPayload {
  const constraints = (payload.constraints ?? []).map((c, i) => (i === index ? {...c, ...patch} : c))
  const edited = constraints[index]
  /* A dependency of an item on itself is not a rule; drop the row rather than
     store something the schema will reject at save. */
  return prune({...payload, constraints: edited && edited.before === edited.after ? constraints.filter((_, i) => i !== index) : constraints})
}
