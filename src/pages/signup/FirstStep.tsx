import { useParams } from 'react-router-dom'

import StageStep from './StageStep'
import WorkplaceStep from './WorkplaceStep'

/**
 * The first question of a signup, which is a different question per role.
 *
 * A teacher is asked where they work — four cards, `WorkplaceStep`. A student
 * is asked what level they study — the education-stage list, `StageStep`,
 * unchanged.
 *
 * THE SPLIT LIVES HERE rather than inside one component with a branch in it,
 * so that neither screen has to carry the other's concerns. The two ask
 * different questions, load different lists, and write to different columns;
 * the only thing they share is a position in the chain, and a position is
 * exactly what a route is for.
 *
 * `:role` is still the only thing that decides any of it, and it is still the
 * URL. Nothing about the role is read from a form field.
 */
export default function FirstStep() {
  const { role } = useParams<{ role: string }>()
  return role === 'student' ? <StageStep /> : <WorkplaceStep />
}
