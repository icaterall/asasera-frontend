/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/word-boards.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'

/** Pure authoring-time word activities. Persist the returned snapshot; never regenerate on view. */
export interface WordSpellingPolicy {
  version: 1
  language: 'ar' | 'en'
  diacritics: 'preserve' | 'ignore'
  tatweel: 'preserve' | 'ignore'
  case: 'preserve' | 'ignore'
  spaces: 'preserve' | 'ignore'
}

export interface VocabularyEntry { id: string; word: string; clue?: string }
export interface NativeVocabulary { kind: 'native_vocabulary'; entries: VocabularyEntry[]; policy: WordSpellingPolicy }
const policySchema = z.object({
  version: z.literal(1), language: z.enum(['ar', 'en']), diacritics: z.enum(['preserve', 'ignore']),
  tatweel: z.enum(['preserve', 'ignore']), case: z.enum(['preserve', 'ignore']), spaces: z.enum(['preserve', 'ignore']),
}).strict()
const entrySchema = z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/), word: z.string().min(1).max(1024), clue: z.string().trim().min(1).max(500).optional() }).strict()
const vocabularySchema = z.object({ kind: z.literal('native_vocabulary'), policy: policySchema, entries: z.array(entrySchema).min(1).max(40) }).strict()
// Native activity-question schemas reuse the same spelling contract.
export { policySchema as wordSpellingPolicySchema, entrySchema as vocabularyEntrySchema }

function checkedLetters(entry: VocabularyEntry, policy: WordSpellingPolicy, board: boolean): string[] {
  entrySchema.parse(entry)
  policySchema.parse(policy)
  const supported = policy.language === 'ar' ? /^[\p{Script=Arabic}\p{M}\u0640 ]+$/u : /^[\p{Script=Latin}\p{M} ]+$/u
  if (!supported.test(entry.word)) throw new Error(`Unsupported or mixed-script vocabulary: ${entry.id}`)
  const letters = wordGraphemes(entry.word, policy)
  if (!letters.length || letters.length > 128 || !letters.some(letter => /\p{L}/u.test(letter)) || letters.some(letter => /^\p{M}/u.test(letter))) throw new Error(`Invalid word length or unattached marks: ${entry.id}`)
  if (board && letters.includes(' ')) throw new Error(`Grid words cannot contain spaces under the selected policy: ${entry.id}`)
  return letters
}

function checkedVocabulary(source: NativeVocabulary): void {
  vocabularySchema.parse(source)
  const ids = new Set<string>()
  const words = new Set<string>()
  for (const entry of source.entries) {
    const word = checkedLetters(entry, source.policy, true).join('')
    if (ids.has(entry.id) || words.has(word)) throw new Error(`Duplicate vocabulary: ${entry.id}`)
    ids.add(entry.id)
    words.add(word)
  }
}
export interface SavedWordBuilder {
  algorithmVersion: 1
  entry: VocabularyEntry
  policy: WordSpellingPolicy
  seed: number
  tiles: Array<{ id: string; text: string }>
  solution: string[]
}

function random(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Seed must be an unsigned 32-bit integer')
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], next: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

export function createWordBuilder(entry: VocabularyEntry, policy: WordSpellingPolicy, seed: number): SavedWordBuilder {
  const solution = checkedLetters(entry, policy, false)
  return {
    algorithmVersion: 1, entry: { ...entry }, policy: { ...policy }, seed, solution,
    tiles: shuffle(solution, random(seed)).map((text, index) => ({ id: `tile_${index}`, text })),
  }
}

/** Compare grapheme values, not their original occurrence IDs. */
export function evaluateWordBuilder(saved: SavedWordBuilder, tileIds: readonly string[]): boolean {
  if (tileIds.length !== saved.solution.length || new Set(tileIds).size !== tileIds.length) return false
  const tiles = new Map(saved.tiles.map(tile => [tile.id, tile.text]))
  return tileIds.every((id, index) => tiles.has(id) && tiles.get(id) === saved.solution[index])
}

/** NFC preserves hamza/alef, taa marbuta/haa and yaa/alef maqsura distinctions.
 * Ignoring Arabic vocalization removes only U+064B–0652 and U+0670, never hamza.
 * Unicode grapheme segmentation is provided by the supported Node 22.18+ runtime.
 */
export function wordGraphemes(word: string, policy: WordSpellingPolicy): string[] {
  let text = word.normalize('NFC')
  if (policy.diacritics === 'ignore') text = text.replace(/[\u064b-\u0652\u0670]/gu, '')
  if (policy.tatweel === 'ignore') text = text.replace(/\u0640/gu, '')
  if (policy.case === 'ignore') text = text.toLocaleLowerCase(policy.language)
  if (policy.spaces === 'ignore') text = text.replace(/ /gu, '')
  return Array.from(new Intl.Segmenter(policy.language, { granularity: 'grapheme' }).segment(text), part => part.segment)
}

/** Coordinates are zero-based physical cells: row increases down, column right.
 * Arabic across therefore has columnStep -1; the UI must not mirror the surface.
 */
export interface WordCell { row: number; column: number }
export interface WordDirection { rowStep: number; columnStep: number }
export interface WordBoardConfig {
  seed: number
  rows: number
  columns: number
  allowReverse?: boolean
  allowDiagonal?: boolean
  maxWork?: number
}
const configSchema = z.object({
  seed: z.number().int().min(0).max(0xffffffff), rows: z.number().int().min(1).max(20), columns: z.number().int().min(1).max(20),
  allowReverse: z.boolean().default(false), allowDiagonal: z.boolean().default(false), maxWork: z.number().int().min(1).max(100_000).default(50_000),
}).strict()
export interface WordPlacement {
  entryId: string
  word: string
  clue: string
  number: number
  direction: WordDirection
  cells: WordCell[]
  equivalentPaths: WordCell[][]
}
export interface SavedWordBoard {
  algorithmVersion: 1
  kind: 'word-search' | 'crossword'
  policy: WordSpellingPolicy
  config: Required<WordBoardConfig>
  matrix: Array<Array<string | null>>
  placements: WordPlacement[]
  unplaced: Array<{ entryId: string; word: string; reason: 'too-long' | 'no-placement' | 'work-limit' }>
  status: 'ready' | 'partial'
  workUsed: number
}

function directions(policy: WordSpellingPolicy, config: Required<WordBoardConfig>): WordDirection[] {
  const horizontal = policy.language === 'ar' ? -1 : 1
  const result = [{ rowStep: 0, columnStep: horizontal }, { rowStep: 1, columnStep: 0 }]
  if (config.allowDiagonal) result.push({ rowStep: 1, columnStep: horizontal }, { rowStep: 1, columnStep: -horizontal })
  if (config.allowReverse) result.push(...result.map(d => ({ rowStep: -d.rowStep || 0, columnStep: -d.columnStep || 0 })))
  return result
}

function cellsAt(row: number, column: number, length: number, direction: WordDirection): WordCell[] {
  return Array.from({ length }, (_, i) => ({ row: row + i * direction.rowStep, column: column + i * direction.columnStep }))
}

function candidates(length: number, config: Required<WordBoardConfig>, allowed: WordDirection[]) {
  const result: Array<{ direction: WordDirection; cells: WordCell[] }> = []
  for (const direction of allowed) for (let row = 0; row < config.rows; row++) for (let column = 0; column < config.columns; column++) {
    const endRow = row + (length - 1) * direction.rowStep
    const endColumn = column + (length - 1) * direction.columnStep
    if (endRow < 0 || endRow >= config.rows || endColumn < 0 || endColumn >= config.columns) continue
    result.push({ direction, cells: cellsAt(row, column, length, direction) })
  }
  return result
}

export function generateWordSearch(source: NativeVocabulary, input: WordBoardConfig): SavedWordBoard {
  checkedVocabulary(source)
  const config = configSchema.parse(input)
  const next = random(config.seed)
  const matrix: Array<Array<string | null>> = Array.from({ length: config.rows }, () => Array<string | null>(config.columns).fill(null))
  const placements: WordPlacement[] = []
  const unplaced: SavedWordBoard['unplaced'] = []
  let workUsed = 0
  const allowed = directions(source.policy, config)
  const words = source.entries.map(entry => ({ ...entry, letters: wordGraphemes(entry.word, source.policy) }))
    .sort((a, b) => b.letters.length - a.letters.length)
  for (const entry of words) {
    let placed = false
    const options = shuffle(candidates(entry.letters.length, config, allowed), next)
    for (const option of options) {
      if (workUsed >= config.maxWork) break
      workUsed++
      if (!option.cells.every((cell, index) => matrix[cell.row]![cell.column] === null || matrix[cell.row]![cell.column] === entry.letters[index])) continue
      option.cells.forEach((cell, index) => { matrix[cell.row]![cell.column] = entry.letters[index]! })
      placements.push({ entryId: entry.id, word: entry.word, clue: entry.clue ?? '', number: placements.length + 1, ...option, equivalentPaths: [option.cells] })
      placed = true
      break
    }
    if (!placed) unplaced.push({ entryId: entry.id, word: entry.word, reason: !options.length ? 'too-long' : workUsed >= config.maxWork ? 'work-limit' : 'no-placement' })
  }
  const alphabet = Array.from(source.policy.language === 'ar' ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي' : 'abcdefghijklmnopqrstuvwxyz')
  for (const row of matrix) for (let column = 0; column < row.length; column++) {
    if (row[column] === null) row[column] = alphabet[Math.floor(next() * alphabet.length)]!
  }
  // Enumerate equivalent occurrences in the actual saved matrix, including filler.
  // Independently bounded by 40 words × 400 starts × 8 directions × 20 cells.
  for (const placement of placements) {
    const letters = wordGraphemes(placement.word, source.policy)
    const unique = new Set<string>()
    placement.equivalentPaths = candidates(letters.length, config, allowed)
      .filter(option => option.cells.every((cell, index) => matrix[cell.row]![cell.column] === letters[index]))
      .map(option => option.cells)
      .filter(path => {
        const key = path.map(cell => `${cell.row}:${cell.column}`).join(',')
        if (unique.has(key)) return false
        unique.add(key)
        return true
      })
  }
  return { algorithmVersion: 1, kind: 'word-search', policy: { ...source.policy }, config, matrix, placements, unplaced, status: unplaced.length ? 'partial' : 'ready', workUsed }
}

/** Endpoint input supports taps and keyboard as well as dragging. Reversed selection
 * of an authorized path is accepted. Caller persists found IDs transactionally.
 */
export function findWordSearchSelection(saved: SavedWordBoard, start: WordCell, end: WordCell, foundEntryIds: readonly string[]): string | null {
  if (saved.kind !== 'word-search') return null
  const validCell = (cell: WordCell) => Number.isInteger(cell.row) && Number.isInteger(cell.column) && cell.row >= 0 && cell.row < saved.config.rows && cell.column >= 0 && cell.column < saved.config.columns
  if (!validCell(start) || !validCell(end)) return null
  const same = (a: WordCell, b: WordCell) => a.row === b.row && a.column === b.column
  const found = new Set(foundEntryIds)
  return saved.placements.find(placement => !found.has(placement.entryId) && placement.equivalentPaths.some(path =>
    (same(path[0]!, start) && same(path.at(-1)!, end)) || (same(path[0]!, end) && same(path.at(-1)!, start)),
  ))?.entryId ?? null
}

/** Bounded greedy crossword layout, not a proof of impossibility. Unplaced entries
 * require explicit subset approval or author revision before a run can start.
 * A crossword has a connected set of perpendicular crossings, no touching parallel
 * words, no collinear overlap, and an empty cell before/after each entry.
 */
export function generateCrossword(source: NativeVocabulary, input: WordBoardConfig): SavedWordBoard {
  checkedVocabulary(source)
  if (source.entries.some(entry => !entry.clue?.trim())) throw new Error('Every crossword entry requires a reviewed clue')
  const config = configSchema.parse(input)
  if (config.allowReverse || config.allowDiagonal) throw new Error('Crosswords support only across and down')
  const next = random(config.seed)
  const matrix: Array<Array<string | null>> = Array.from({ length: config.rows }, () => Array<string | null>(config.columns).fill(null))
  const placements: WordPlacement[] = []
  const unplaced: SavedWordBoard['unplaced'] = []
  const axes = new Map<string, Set<string>>()
  const occupied = (row: number, column: number) => matrix[row]?.[column] != null
  let workUsed = 0
  const words = source.entries.map(entry => ({ ...entry, letters: wordGraphemes(entry.word, source.policy) })).sort((a, b) => b.letters.length - a.letters.length)
  for (const entry of words) {
    let placed = false
    const options = shuffle(candidates(entry.letters.length, config, directions(source.policy, config)), next)
    if (!placements.length) options.sort((a, b) => {
      const distance = (cells: WordCell[]) => Math.abs(cells[0]!.row + cells.at(-1)!.row - config.rows + 1) + Math.abs(cells[0]!.column + cells.at(-1)!.column - config.columns + 1)
      return distance(a.cells) - distance(b.cells)
    })
    for (const option of options) {
      if (workUsed >= config.maxWork) break
      workUsed++
      const { rowStep, columnStep } = option.direction
      const start = option.cells[0]!
      const end = option.cells.at(-1)!
      if (occupied(start.row - rowStep, start.column - columnStep) || occupied(end.row + rowStep, end.column + columnStep)) continue
      const axis = rowStep === 0 ? 'across' : 'down'
      let crosses = false
      const valid = option.cells.every((cell, index) => {
        const existing = matrix[cell.row]![cell.column]
        if (existing !== null) {
          crosses = true
          return existing === entry.letters[index] && !axes.get(`${cell.row}:${cell.column}`)?.has(axis)
        }
        return rowStep === 0
          ? !occupied(cell.row - 1, cell.column) && !occupied(cell.row + 1, cell.column)
          : !occupied(cell.row, cell.column - 1) && !occupied(cell.row, cell.column + 1)
      })
      if (!valid || (placements.length > 0 && !crosses)) continue
      option.cells.forEach((cell, index) => {
        matrix[cell.row]![cell.column] = entry.letters[index]!
        const key = `${cell.row}:${cell.column}`
        const current = axes.get(key) ?? new Set<string>()
        current.add(axis)
        axes.set(key, current)
      })
      placements.push({ entryId: entry.id, word: entry.word, clue: entry.clue!, number: 0, ...option, equivalentPaths: [option.cells] })
      placed = true
      break
    }
    if (!placed) unplaced.push({ entryId: entry.id, word: entry.word, reason: !options.length ? 'too-long' : workUsed >= config.maxWork ? 'work-limit' : 'no-placement' })
  }
  const reading = source.policy.language === 'ar' ? -1 : 1
  const numbered = [...placements].sort((a, b) => a.cells[0]!.row - b.cells[0]!.row || reading * (a.cells[0]!.column - b.cells[0]!.column))
  let number = 0
  let lastStart = ''
  for (const placement of numbered) {
    const start = `${placement.cells[0]!.row}:${placement.cells[0]!.column}`
    if (start !== lastStart) number++
    placement.number = number
    lastStart = start
  }
  return { algorithmVersion: 1, kind: 'crossword', policy: { ...source.policy }, config, matrix, placements, unplaced, status: unplaced.length ? 'partial' : 'ready', workUsed }
}

export interface PublicWordBoard {
  algorithmVersion: 1
  kind: 'word-search' | 'crossword'
  language: 'ar' | 'en'
  rows: number
  columns: number
  matrix: Array<Array<string | null>>
  directions: WordDirection[]
  clues: Array<{ id: string; number: number; text: string; start: WordCell; direction: 'across' | 'down'; length: number }>
  targets?: Array<{ id: string; text: string }>
  solution?: { matrix: Array<Array<string | null>>; placements: WordPlacement[] }
}

/** Disclosure is a trusted server policy decision, never a learner query/body flag.
 * Only serialize this allowlisted DTO; SavedWordBoard is private authoring/answer data.
 * Search letters are inherently public, whereas a crossword exposes only open cells.
 * A word list is itself answer disclosure and must be independently authorized.
 */
export function projectWordBoard(saved: SavedWordBoard, disclosure: { revealSolutions: boolean; showWordList: boolean }): PublicWordBoard {
  const publicBoard: PublicWordBoard = {
    algorithmVersion: 1, kind: saved.kind, language: saved.policy.language,
    rows: saved.config.rows, columns: saved.config.columns,
    matrix: saved.matrix.map(row => row.map(cell => saved.kind === 'crossword' && cell !== null ? '' : cell)),
    directions: directions(saved.policy, saved.config),
    clues: saved.kind === 'crossword' ? saved.placements.map((placement, index) => ({
      id: `clue_${index + 1}`, number: placement.number, text: placement.clue,
      start: { ...placement.cells[0]! }, direction: placement.direction.rowStep === 0 ? 'across' : 'down', length: placement.cells.length,
    })) : [],
  }
  if (disclosure.showWordList) publicBoard.targets = saved.placements.map((entry, index) => ({ id: `target_${index + 1}`, text: entry.word }))
  if (disclosure.revealSolutions) publicBoard.solution = {
    matrix: saved.matrix.map(row => [...row]),
    placements: saved.placements.map(placement => ({ ...placement, direction: { ...placement.direction }, cells: placement.cells.map(cell => ({ ...cell })), equivalentPaths: placement.equivalentPaths.map(path => path.map(cell => ({ ...cell }))) })),
  }
  return publicBoard
}

export function projectWordBuilder(saved: SavedWordBuilder): { algorithmVersion: 1; clue: string; policy: WordSpellingPolicy; tiles: Array<{ id: string; text: string }> } {
  return { algorithmVersion: 1, clue: saved.entry.clue ?? '', policy: { ...saved.policy }, tiles: saved.tiles.map(tile => ({ ...tile })) }
}
