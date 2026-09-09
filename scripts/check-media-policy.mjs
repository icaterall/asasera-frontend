import { readFile, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MEDIA_GENERATION_POLICY } from '../src/shared/media-policy.ts'
import { DRY_SOUND_CUES } from '../src/design/dry-sounds.ts'

export function checkPrompt(prompt, location) {
  return typeof prompt === 'string' && prompt.startsWith(MEDIA_GENERATION_POLICY) && prompt.endsWith(MEDIA_GENERATION_POLICY)
    ? [] : [`${location}: missing mandatory media policy in the active generation prompt`]
}

export function checkPromptMetadata(value, location) {
  if (Array.isArray(value)) return value.flatMap((item, i) => checkPromptMetadata(item, `${location}[${i}]`))
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => key === 'prompt'
    ? checkPrompt(child, `${location}.prompt`)
    : checkPromptMetadata(child, `${location}.${key}`))
}

async function checkDirectory(directory) {
  const issues = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) issues.push(...await checkDirectory(file))
    else if (entry.name.endsWith('.json')) issues.push(...checkPromptMetadata(JSON.parse(await readFile(file, 'utf8')), file))
  }
  return issues
}

export async function checkMediaPolicy() {
  const root = resolve(import.meta.dirname, '..')
  return [
    ...await checkDirectory(join(root, 'src/assets')),
    ...await checkDirectory(join(root, 'public')),
    ...Object.entries(DRY_SOUND_CUES).flatMap(([name, cue]) => checkPrompt(cue.prompt, `sound:${name}`)),
  ]
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const issues = await checkMediaPolicy()
  if (issues.length) {
    console.error(issues.join('\n'))
    process.exitCode = 1
  } else console.log('Media policy: all active image and sound prompts include the mandatory rules.')
}
