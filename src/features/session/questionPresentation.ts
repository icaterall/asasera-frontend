import type { PublicQuestion, Reveal } from '../../shared/session.ts'

/** Keep the timer tied to the server deadline, including after a hidden tab resumes. */
export function questionTime(endsAt: number, now: number, duration: number) {
  const remaining = Math.max(0, endsAt - now)
  return {
    remaining,
    seconds: Math.ceil(remaining / 1000),
    fraction: Math.min(1, remaining / Math.max(1, duration * 1000)),
    urgent: remaining > 0 && remaining <= 5000,
  }
}

export function answerProgress(accepted: number, participants: number) {
  return {
    fraction: participants > 0 ? Math.min(1, accepted / participants) : 0,
    complete: participants > 0 && accepted >= participants,
    unanswered: Math.max(0, participants - accepted),
  }
}

/** Chart identity follows the option's slot, never its popularity or the answer key. */
export function answerDistribution(question: PublicQuestion, reveal: Reveal, participants: number, ar: boolean) {
  const payload = question.payload
  const options = payload.kind === 'mcq' || payload.kind === 'tf' ? payload.options : null
  return reveal.distribution.map(item => {
    const index = options?.findIndex(option => option.key === item.key) ?? -1
    const option = index >= 0 ? options?.[index] : undefined
    const labels: Record<string, string> = {
      true: ar ? 'صح' : 'True', false: ar ? 'خطأ' : 'False',
      correct: ar ? 'إجابة صحيحة' : 'Correct', incorrect: ar ? 'إجابة غير صحيحة' : 'Incorrect',
    }
    return {
      ...item,
      label: payload.kind === 'mcq' ? option?.text ?? item.key : labels[item.key] ?? item.key,
      slot: index >= 0 ? Math.min(index, 5) + 1 : null,
      correct: options ? String(reveal.correct) === item.key : item.key === 'correct',
      fraction: participants > 0 ? Math.min(1, item.count / participants) : 0,
    }
  })
}
