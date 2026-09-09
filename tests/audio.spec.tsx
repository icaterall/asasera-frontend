import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const playback = vi.hoisted(() => ({
  created: vi.fn(), play: vi.fn(() => 1), stop: vi.fn(), mute: vi.fn(), unload: vi.fn(), resume: vi.fn(async () => {}),
}))
vi.mock('howler', () => ({
  Howl: class {
    constructor(options: unknown) { playback.created(options) }
    play = playback.play
    stop = playback.stop
    mute = playback.mute
    unload = playback.unload
  },
  Howler: { ctx: { resume: playback.resume }, usingWebAudio: true },
}))
import { SessionAudio } from '../src/design/audio'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.stubGlobal('AudioContext', class {})
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

it('waits for an explicit unlock and preserves the saved mute setting', () => {
  localStorage.setItem('asasera:mute', 'true')
  const audio = new SessionAudio()
  audio.play('correct')
  expect(playback.created).not.toHaveBeenCalled()
  expect(playback.play).not.toHaveBeenCalled()
  expect(audio.unlock()).toBe(true)
  expect(playback.created).toHaveBeenCalledWith(expect.objectContaining({ mute: true, html5: false }))
  audio.play('correct')
  expect(playback.play).not.toHaveBeenCalled()
  audio.setMuted(false)
  audio.play('select')
  expect(playback.play).toHaveBeenCalledExactlyOnceWith('select')
  expect(localStorage.getItem('asasera:mute')).toBe('false')
  audio.dispose()
  expect(playback.unload).toHaveBeenCalledOnce()
})

it('uses one join click without a repeating lobby soundtrack or duplicate count cue', () => {
  const audio = new SessionAudio()
  audio.unlock()
  audio.lobby(0)
  audio.lobby(1)
  audio.lobby(1)
  vi.advanceTimersByTime(60_000)
  expect(playback.play).toHaveBeenCalledExactlyOnceWith('lobby')
  expect(vi.getTimerCount()).toBe(0)
  audio.lobby(0)
  expect(playback.play).toHaveBeenCalledTimes(1)
  audio.stopLoop()
  expect(playback.stop).toHaveBeenCalledWith(1)
  audio.dispose()
})
