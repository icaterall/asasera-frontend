import { useOutletContext } from 'react-router-dom'
import type { StudentOverview } from '@/shared/student'
export const useStudentWorkspace = () => useOutletContext<{ data: StudentOverview; reload: () => Promise<unknown> }>()
