import { mediaGenerationPrompt } from '../shared/media-policy.ts'

export type SoundEvent = 'lobby' | 'question' | 'tick' | 'select' | 'lock' | 'correct' | 'incorrect' | 'podium'
type Pulse = { at: number; ms: number; gain: number; body: number }
type Cue = { ms: number; pulses: Pulse[]; prompt: string }

const cue = (brief: string, ms: number, pulses: Pulse[]): Cue => ({
  ms, pulses, prompt: mediaGenerationPrompt(brief),
})

/** Dry, aperiodic noise impulses. There are no notes, oscillators, voices or musical loops. */
export const DRY_SOUND_CUES: Record<SoundEvent, Cue> = {
  lobby: cue('A single soft mechanical latch click when a participant joins.', 45, [{ at: 0, ms: 32, gain: .42, body: .35 }]),
  question: cue('A brief dry button press and release to open a question.', 100, [{ at: 0, ms: 40, gain: .58, body: .5 }, { at: 63, ms: 24, gain: .28, body: .2 }]),
  tick: cue('One quiet, dry mechanical clock tick for the countdown.', 22, [{ at: 0, ms: 14, gain: .3, body: .15 }]),
  select: cue('One crisp, gentle computer mouse click for answer selection.', 35, [{ at: 0, ms: 24, gain: .48, body: .2 }]),
  lock: cue('A short dry latch closing, with a muted mechanical body.', 90, [{ at: 0, ms: 70, gain: .7, body: .82 }]),
  correct: cue('A satisfying dry switch click followed by a softer release. Functional feedback only.', 130, [{ at: 0, ms: 38, gain: .55, body: .3 }, { at: 81, ms: 30, gain: .32, body: .5 }]),
  incorrect: cue('A single soft, muted dry impact indicating an incorrect answer.', 95, [{ at: 0, ms: 80, gain: .7, body: .92 }]),
  podium: cue('One dry mechanical stamp landing with a brief quiet latch release. No fanfare.', 180, [{ at: 0, ms: 105, gain: .65, body: .85 }, { at: 127, ms: 32, gain: .3, body: .35 }]),
}

export const SOUND_SAMPLE_RATE = 22050

/** Unpitched noise with a fast attack and decay; smoothing adds body without resonance. */
export function renderDryCue(event: SoundEvent): Float32Array {
  const definition = DRY_SOUND_CUES[event]
  const samples = new Float32Array(Math.ceil(definition.ms * SOUND_SAMPLE_RATE / 1000))
  let seed = 0x41a5e2 ^ Object.keys(DRY_SOUND_CUES).indexOf(event)
  for (const pulse of definition.pulses) {
    const start = Math.round(pulse.at * SOUND_SAMPLE_RATE / 1000)
    const count = Math.floor(pulse.ms * SOUND_SAMPLE_RATE / 1000)
    let body = 0
    for (let n = 0; n < count && start + n < samples.length; n++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      const noise = seed / 0xffffffff * 2 - 1
      body = body * pulse.body + noise * (1 - pulse.body)
      const progress = n / count
      const envelope = Math.min(1, n / 12) * Math.exp(-6 * progress) * (1 - progress)
      samples[start + n] += body * envelope * pulse.gain
    }
  }
  return samples
}

export function buildDrySoundSprite(): { bytes: Uint8Array; sprite: Record<string, [number, number]> } {
  const sprite: Record<string, [number, number]> = {}
  let duration = 0
  for (const [event, definition] of Object.entries(DRY_SOUND_CUES)) {
    sprite[event] = [duration, definition.ms]
    duration += definition.ms + 50
  }
  const count = Math.ceil(duration * SOUND_SAMPLE_RATE / 1000)
  const buffer = new ArrayBuffer(44 + count * 2), view = new DataView(buffer)
  const word = (at: number, text: string) => [...text].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)))
  word(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); word(8, 'WAVE'); word(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, SOUND_SAMPLE_RATE, true); view.setUint32(28, SOUND_SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); word(36, 'data'); view.setUint32(40, count * 2, true)
  for (const event of Object.keys(DRY_SOUND_CUES) as SoundEvent[]) {
    const start = Math.round(sprite[event]![0] * SOUND_SAMPLE_RATE / 1000)
    const samples = renderDryCue(event)
    for (let n = 0; n < samples.length; n++) view.setInt16(44 + (start + n) * 2, Math.round(samples[n]! * 32767), true)
  }
  return { bytes: new Uint8Array(buffer), sprite }
}
