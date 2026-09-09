/**
 * Auth-screen copy.
 *
 * Lives here, not in the i18n bundle, because the project rule is that copy
 * lives in src/copy — the bundle imports this table rather than owning it.
 * The English is written natively, not translated from the other.
 */
export const authEN = {

  common: {
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    /* The reset screen only. "Password" there would read as the old one. */
    newPasswordLabel: 'New password',
    nameLabel: 'Full name',
    namePlaceholder: 'As you want it shown',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    /* {{count}} of {{min}} — Western digits in both languages. */
    submitting: 'Working…',
    /* The address step's own busy label. "Working…" is true but vague; this
       says which of the two things the button is doing. */
    checking: 'Checking…',
    or: 'or',
    google: 'Continue with Google',
    facebook: 'Continue with Facebook',
    required: 'Required',
    backToSignIn: 'Back to sign in',
    noResults: 'No match',
    loading: 'Loading…',
    /* The <select> lists offer an inline retry, so this is a button label. */
    retry: 'Try again',
    unavailable: 'Not available yet',
    loadError: 'Could not load. Tap to retry.',
    apple: 'Continue with Apple',
    comingSoon: 'Coming soon',
  },

  errors: {
    nameRequired: 'Enter your name.',
    emailRequired: 'Enter your email address.',
    emailInvalid: 'Enter a valid email address.',
    passwordRequired: 'Enter a password.',
    passwordShort: 'Use at least 12 characters.',
    stageRequired: 'Choose a stage.',
    categoryRequired: 'Choose a subject.',
    notFound: 'That is not available, or it is not yours.',
    generic: 'Something went wrong. Please try again.',
    network: 'Could not reach the server. Check your connection and try again.',
    loadFailed: 'Could not load that list.',
    /*
     * The duplicate-address message, split on its own placeholder so the
     * middle can be a real <Link> rather than text that looks like one.
     * `emailTakenAction` is the link's words and nothing else.
     */
    emailTaken: 'An account with this email already exists. {{signIn}} instead.',
    emailTakenAction: 'Sign in',
    /* The availability check failed to answer. Deliberately NOT "that address
       is available" — an unanswered question is not a yes. */
    emailCheckFailed: 'Could not check that address. Please try again.',
  },

  chooseRole: {
    title: 'Create your account',
    lead: 'First, choose your account type.',
    teacher: {
      title: 'Teacher',
      body: 'Create activities, host games and follow your students’ progress.',
      action: 'Continue as a teacher',
    },
    student: {
      title: 'Student',
      body: 'Join your class, complete activities and practice with games.',
      action: 'Continue as a student',
    },
    haveAccount: 'Already have an account?',
  },

  signup: {
    /*
     * The teacher's first question. Exactly four choices and no descriptions
     * under them — the labels are the whole content, which is what lets the
     * step be answered in a glance instead of read.
     */
    workplace: {
      title: 'Choose the workplace that is most relevant to you.',
      lead: "If you're not sure, you can change this later.",
    },
    stage: {
      title: {
        teacher: 'Which level do you teach?',
        student: 'Which level are you studying?',
      },
      lead: {
        teacher: 'This tailors what Asasera suggests. You can change it later.',
        student: 'This tailors what you see. You can change it later.',
      },
      later: 'Choose later',
    },
    method: {
      title: 'Create your account',
      lead: 'Continue with Google, or use an email address.',
      submit: 'Continue',
    },
    password: {
      title: 'Create your password',
      lead: 'One more step and your account is ready.',
      edit: 'Edit',
      hint: 'At least 12 characters. No symbols or capitals required.',
      submit: 'Create account',
    },
    checkEmail: {
      title: 'Check your email',
      lead: 'Your account is ready. Confirm your address to finish.',
      body: 'We sent a link to the address above. It works once, and expires.',
      nextTeacher: 'Next, we will ask what you teach — all of it optional.',
      nextStudent: 'Next, you can add your name whenever you like.',
    },
  },

  login: {
    title: 'Sign in',
    lead: 'Continue with an account you already have.',
    submit: 'Sign in',
    forgot: 'Forgot your password?',
    noAccount: 'No account yet?',
    registerTeacher: 'Register as a teacher',
    registerStudent: 'Register as a student',
    failed: 'That email and password do not match.',
  },

  registerTeacher: {
    title: 'Create a teacher account',
    lead: 'Your course, your lesson pages, your class.',
    categoryLabel: 'Subject',
    categoryPlaceholder: 'Choose a subject',
    salutationLabel: 'Title',
    salutationPlaceholder: 'Optional',
    stageLabel: 'Stage',
    stagePlaceholder: 'Choose a stage',
    /*
     * Says why the list is short before anyone wonders. The gate is
     * server-side; this only explains it.
     */
    stageHint: 'Asasera is open to university teaching only.',
    submit: 'Create account',
    switch: 'Registering as a student instead?',
    switchLink: 'Student registration',
  },

  registerStudent: {
    title: 'Create a student account',
    lead: 'Join your class with a code once your account is ready.',
    submit: 'Create account',
    switch: 'Are you a teacher?',
    switchLink: 'Teacher registration',
  },

  registered: {
    title: 'Check your email',
    body: 'If that address can receive mail, a link to finish setting up your account is on its way. The link works once and expires.',
  },

  forgot: {
    title: 'Reset your password',
    lead: 'Enter your email address and we will send you a link.',
    submit: 'Send the link',
    /* Deliberately does not say whether the address exists. */
    sent: 'If that address has an account, a reset link is on its way.',
    remembered: 'Remembered it?',
  },

  reset: {
    title: 'Choose a new password',
    lead: 'This signs you out everywhere else.',
    submit: 'Save the new password',
    /* Its own heading: the card used to keep saying "Choose a new password"
       after the password had been changed, which reads as if nothing happened. */
    doneTitle: 'Password changed',
    done: 'Your password has been changed. Sign in with it.',
    badTokenTitle: 'That link did not work',
    badToken: 'That link has expired or has already been used. Request a new one.',
    requestAnother: 'Request a new link',
  },

  /*
   * Verification, in three places: the sticky banner, the two panels it
   * opens, and the page the emailed link lands on. One block, because they
   * are one subject and a teacher meets them minutes apart.
   */
  verify: {
    /* The page the emailed link opens. */
    title: 'Verifying your email',
    working: 'Checking your link…',
    done: 'Your email is verified.',
    doneBody: 'Thanks — your Asasera account is secured. You can carry on.',
    failed: 'That link did not work.',
    failedBody:
      'It may have expired, been used already, or been replaced by a newer one. Open the banner in the app and send yourself a fresh link.',
    missing: 'That link is incomplete.',
    continueAction: 'Continue',

    /* The sticky banner. */
    banner: 'Verify your email to secure your Asasera account. Check your inbox at {{email}}.',
    verifyAction: 'Verify email',
    changeAction: 'Change email',

    /* The "Verify email" panel. */
    panelTitle: 'Verify your email',
    panelBody:
      'We sent a link to the address below. Check your inbox, and your spam folder if it is not there.',
    resend: 'Resend verification email',
    resendSent: 'Sent. Check your inbox.',
    resendWait: 'A message was just sent. Try again in {{seconds}} seconds.',
    resendFailed: 'Could not send just now. Try again shortly.',
    alreadyVerified: 'This address is already verified.',

    /* The "Change email" panel. */
    changeTitle: 'Change email',
    changeBody:
      'We will send a new verification link to the address you enter. Your account stays unverified until you confirm it.',
    changeLabel: 'New email address',
    changeSubmit: 'Save and send link',
    changeInUse: 'That address is already in use.',
    changeUnchanged: 'That is already the address on this account.',
    close: 'Close',
  },

  completeProfile: {
    title: 'Two more things',
    /*
     * This used to read "Google did not tell us what you teach". It was
     * written when the screen only ever followed a Google sign-in; it now
     * follows every signup, and told someone who had just typed an email and
     * a password about a provider they never used.
     */
    lead: 'This tailors what Asasera suggests. Both are optional, and you can change them later.',
    workplaceLabel: 'Workplace',
    workplacePlaceholder: 'Choose a workplace',
    submit: 'Save and continue',
    skip: 'Skip for now',
  },

  callback: {
    working: 'Signing you in…',
    cancelled: 'Sign-in was cancelled. Nothing has changed, and you can try again whenever you like.',
    accountExists: 'This email is already registered. Sign in with your password, then connect Google from your account.',
    failed: 'We could not complete that sign-in. Please try again.',
    /* The remaining reasons the callback can return, each from a fixed set. */
    badState: 'That sign-in could not be verified. Please try again.',
    expired: 'That sign-in expired. Please try again.',
    unavailable: 'Google sign-in is unavailable right now.',
  },

  /* The one authenticated screen. A single line, and nothing else. */
  home: {
    signedIn: 'You are signed in.',
    signOut: 'Sign out',
  },

}

export type AuthCopy = typeof authEN
