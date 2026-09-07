import { useContext } from 'react'

import { SignupContext } from '@/context/signup-context'

export function useSignup() {
  const value = useContext(SignupContext)
  if (!value) throw new Error('useSignup must be used inside <SignupProvider>')
  return value
}
