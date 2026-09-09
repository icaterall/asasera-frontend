/* The v4 design layer — plan §5. Import from here, not from the files. */
export { AnswerTile, ANSWER_SLOTS, type AnswerSlot, type AnswerState } from './AnswerTile.tsx'
export { Button, type ButtonProps, type ButtonVariant } from './Button.tsx'
export { Card, Field, Dialog } from './Surface.tsx'
export { EmptyState, FailureState, SuccessState, LoadingState } from './States.tsx'
export { LoadingIndicator, LoadingMark, type LoadingIndicatorProps } from './LoadingIndicator.tsx'
export type { LoadingStateProps } from './LoadingState.tsx'
export { loadingVariantForPath, type LoadingVariant } from './loadingVariant.ts'
export { Select, type SelectProps } from './Select.tsx'
