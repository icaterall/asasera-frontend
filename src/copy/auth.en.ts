import type { authAr } from './auth.ar'

/**
 * English copy for the five auth screens.
 *
 * Typed as `Record<keyof typeof authAr, string>` so a key added to the Arabic
 * table and forgotten here fails `tsc` rather than shipping a blank label.
 * Arabic is the source of truth for the key set because it is the default
 * language of this product.
 */
export const authEn: Record<keyof typeof authAr, string> = {
  /* Shared ---------------------------------------------------------- */
  'or': 'or',
  'google.continue': 'Continue with Google',
  'facebook.continue': 'Continue with Facebook',

  /* Field labels ----------------------------------------------------- */
  'field.name.label': 'Full name',
  'field.name.placeholder': 'As you want your students to see it',
  'field.email.label': 'Email address',
  'field.email.placeholder': 'name@university.edu',
  'field.password.label': 'Password',
  'field.password.placeholder': 'A long phrase you will remember',
  'field.newPassword.label': 'New password',
  'field.subject.label': 'Subject',
  'field.subject.placeholder': 'Choose your subject',
  'field.stage.label': 'Education stage',
  'field.stage.placeholder': 'Choose a stage',

  /* Password affordances --------------------------------------------- */
  'password.show': 'Show password',
  'password.hide': 'Hide password',
  'password.count': '{count} of at least 12 characters',
  'password.countMet': '{count} characters',
  'password.hint': 'At least 12 characters. No symbols or capitals required.',

  /* Client-side validation ------------------------------------------- */
  'valid.name.required': 'Enter your name.',
  'valid.email.required': 'Enter your email address.',
  'valid.email.format': 'Enter a valid email address.',
  'valid.password.required': 'Enter a password.',
  'valid.password.short': 'Password must be at least 12 characters.',
  'valid.subject.required': 'Choose your subject.',
  'valid.stage.required': 'Choose an education stage.',

  /* Teacher registration --------------------------------------------- */
  'teacher.title': 'Create a lecturer account',
  'teacher.lead': 'For university lecturers. Registration is open to university stages only.',
  'teacher.submit': 'Create account',
  'teacher.switch.prompt': 'Are you a student?',
  'teacher.switch.link': 'Create a student account',

  /* Student registration --------------------------------------------- */
  'student.title': 'Create a student account',
  'student.lead': 'Join your lectures on Asasera.',
  'student.submit': 'Create account',
  'student.switch.prompt': 'Are you a lecturer?',
  'student.switch.link': 'Create a lecturer account',

  /* Shared registration outcome -------------------------------------- */
  'register.sent.title': 'Check your email',
  'register.sent.body':
    'We sent a confirmation link to {email}. Open it to finish setting up your account.',
  'register.haveAccount': 'Already have an account?',
  'register.signIn': 'Sign in',

  /* Login ------------------------------------------------------------- */
  'login.title': 'Sign in',
  'login.lead': 'Welcome back.',
  'login.submit': 'Sign in',
  'login.forgot': 'Forgot your password?',
  'login.switch.prompt': 'No account yet?',
  'login.switch.student': 'Create a student account',
  'login.switch.teacher': 'Create a lecturer account',

  /* Forgot ------------------------------------------------------------ */
  'forgot.title': 'Reset your password',
  'forgot.lead': 'Enter your email address and we will send you a reset link.',
  'forgot.submit': 'Send the link',
  'forgot.sent.title': 'Check your email',
  'forgot.sent.body': 'If that address has an account, a reset link is on its way.',
  'forgot.back': 'Back to sign in',

  /* Reset -------------------------------------------------------------- */
  'reset.title': 'Set a new password',
  'reset.lead': 'Choose a new password for your account.',
  'reset.submit': 'Save password',
  'reset.done.title': 'Password changed',
  'reset.done.body': 'You can now sign in with your new password.',
  'reset.missingToken': 'That link is incomplete. Ask for a new reset link.',
  'reset.requestNew': 'Request a new link',

  /* Profile completion -------------------------------------------------- */
  'profile.title': 'Complete your profile',
  'profile.lead': 'Two fields left before you start.',
  'profile.submit': 'Save and continue',

  /* Reference lists ------------------------------------------------------ */
  'options.loading': 'Loading…',
  'options.failed': 'That list could not be loaded.',
  'options.retry': 'Try again',

  /* Federated sign-in outcomes ------------------------------------------- */
  'error.cancelled': 'Sign-in was cancelled. You can try again.',
  'error.accountExists':
    'This address already has a password account. Sign in with your password first, then link Google from your account settings.',
  'error.badState': 'Sign-in could not be verified. Please try again.',
  'error.expired': 'That sign-in expired. Please try again.',
  'error.unavailable': 'Google sign-in is unavailable right now.',
  'error.failed': 'Sign-in could not be completed. Please try again.',
  'error.network': 'Could not reach the server. Check your connection.',
  'error.credentials': 'Email or password is incorrect.',
  'error.generic': 'Something went wrong. Please try again.',

  /* In-flight ------------------------------------------------------------ */
  'submitting': 'Working…',
}
