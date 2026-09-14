/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/word-board-contract.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {wordSpellingPolicySchema} from './word-boards.ts'

export const wordBoardKindSchema=z.enum(['word-search','crossword'])
export const wordBoardConfigSchema=z.object({seed:z.number().int().min(0).max(0xffffffff),rows:z.number().int().min(1).max(20),columns:z.number().int().min(1).max(20),allowReverse:z.boolean().default(false),allowDiagonal:z.boolean().default(false),maxWork:z.number().int().min(1).max(100000).default(50000)}).strict()
export const wordCellSchema=z.object({row:z.number().int().min(0).max(19),column:z.number().int().min(0).max(19)}).strict()
const direction=z.object({rowStep:z.number().int().min(-1).max(1),columnStep:z.number().int().min(-1).max(1)}).strict()
const placement=z.object({entryId:z.string().min(1).max(64),word:z.string().min(1).max(1024),clue:z.string().max(500),number:z.number().int().nonnegative(),direction,cells:z.array(wordCellSchema).min(1).max(20),equivalentPaths:z.array(z.array(wordCellSchema).min(1).max(20)).max(3200)}).strict()
export const savedWordBoardSchema=z.object({algorithmVersion:z.literal(1),kind:wordBoardKindSchema,policy:wordSpellingPolicySchema,config:wordBoardConfigSchema,matrix:z.array(z.array(z.string().max(1024).nullable()).min(1).max(20)).min(1).max(20),placements:z.array(placement).max(40),unplaced:z.array(z.object({entryId:z.string().max(64),word:z.string().max(1024),reason:z.enum(['too-long','no-placement','work-limit'])}).strict()).max(40),status:z.enum(['ready','partial']),workUsed:z.number().int().min(0).max(100000)}).strict()
export const authoredWordBoardSchema=z.object({requestId:z.uuid(),fingerprint:z.string().regex(/^[a-f0-9]{64}$/),sourceHash:z.string().regex(/^[a-f0-9]{64}$/),revision:z.number().int().positive(),board:savedWordBoardSchema}).strict()
export const authoredWordBoardsSchema=z.object({'word-search':authoredWordBoardSchema.optional(),crossword:authoredWordBoardSchema.optional()}).strict()
export type AuthoredWordBoards=z.infer<typeof authoredWordBoardsSchema>
export const wordBoardGenerateSchema=z.object({kind:wordBoardKindSchema,expectedRevision:z.number().int().positive(),requestId:z.uuid(),config:wordBoardConfigSchema}).strict()
export type WordBoardGenerate=z.infer<typeof wordBoardGenerateSchema>
export const publicWordBoardSchema=z.object({algorithmVersion:z.literal(1),kind:wordBoardKindSchema,language:z.enum(['ar','en']),rows:z.number().int().min(1).max(20),columns:z.number().int().min(1).max(20),matrix:z.array(z.array(z.string().max(1024).nullable()).max(20)).max(20),directions:z.array(direction).max(8),clues:z.array(z.object({id:z.string(),number:z.number().int(),text:z.string(),start:wordCellSchema,direction:z.enum(['across','down']),length:z.number().int().min(1).max(20)}).strict()).max(40),targets:z.array(z.object({id:z.string(),text:z.string()}).strict()).max(40).optional()}).strict()
export const wordGridProgressSchema=z.object({totalWords:z.number().int().min(1).max(40),wordsFound:z.number().int().min(0).max(40),checks:z.number().int().nonnegative(),assistance:z.literal(0),complete:z.boolean()}).strict()
export const attemptWordGridSchema=z.object({board:publicWordBoardSchema,found:z.array(z.object({id:z.string(),cells:z.array(wordCellSchema).max(20)}).strict()).max(40),values:z.record(z.string(),z.string().max(1024)),feedback:z.record(z.string(),z.enum(['correct','incorrect'])),conflicts:z.array(wordCellSchema).max(400),checks:z.number().int().nonnegative(),maxChecks:z.literal(100),complete:z.boolean()}).strict()
