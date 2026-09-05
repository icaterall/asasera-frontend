/**
 * English is the source of truth for the message shape.
 * `ar.ts` is typed as `typeof en`, so a missing or misspelled Arabic key
 * is a compile error rather than a runtime fallback.
 *
 * The `hero`, `stats`, `features` and `platform` namespaces are gone. They
 * described a developer toolkit for bilingual interfaces, which is not what
 * Asasera is, and every figure in them — uptime, latency, a region count, a
 * customer rating — was invented for a product with no users. There is no
 * honest smaller version of an invented figure, so they were deleted rather
 * than softened, along with the unrouted page that rendered them.
 */
const en = {
  brand: {
    name: 'Asasera',
    tagline: 'A live tool for university lectures',
  },

  common: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToArabic: 'التبديل إلى العربية',
    switchToEnglish: 'Switch to English',
    toggleTheme: 'Toggle colour theme',
    lightMode: 'Light',
    darkMode: 'Dark',
    language: 'Language',
    backHome: 'Back to home',
    new: 'New',
  },

  nav: {
    home: 'Home',
    how: 'How it works',
    pricing: 'Pricing',
    about: 'About',
    signIn: 'Sign in',
  },

  /*
   * One call to action, not two. The page previously offered a primary and a
   * secondary button that both pointed at /about — two ways to do the same
   * nothing.
   */
  cta: {
    title: 'Bring it to your course',
    subtitle:
      'If you teach at a university and want to run Asasera in a real lecture, write to us. We are working with a small number of courses at a time.',
    primary: 'Write to us',
  },

  footer: {
    blurb:
      'A live tool for university lectures, for courses taught in Arabic or English.',
    product: {
      heading: 'Product',
      how: 'How it works',
      pricing: 'Pricing',
      departments: 'For departments',
    },
    company: {
      heading: 'Company',
      about: 'About',
      signIn: 'Sign in',
      contact: 'Contact',
    },
    legal: {
      heading: 'Legal',
      privacy: 'Privacy policy',
      dataDeletion: 'Delete your data',
    },
    rights: 'All rights reserved.',
  },

  about: {
    eyebrow: 'About Asasera',
    title: 'The minutes after the wrong answer',

    /* 1 — what Asasera is. */
    lead: 'Asasera is a live tool for university lectures. A teacher opens a link and finds their own course already mapped, lesson by lesson, then presses start. Students join with a code and a first name and spend five to ten minutes on interactive items drawn from the teacher’s own lesson pages.',
    body: 'Halfway through, the teacher gets one decision — eight students share the same error, fix it with them? — then a targeted fix, then verification on a new item. It ends with one sentence, not a dashboard. Two presses in total. The teacher wrote no questions and graded no papers.',

    /* 2 — why it exists. */
    why: {
      heading: 'Why it exists',
      first:
        'Feedback in a lecture stops at right or wrong. A student picks the wrong option, the screen turns red, and the class moves on — the one moment when the error is still fresh and still fixable goes unused.',
      second:
        'The tools that fill that gap ask the teacher to build the material a second time. Every item is written from scratch, disconnected from the lesson pages the course actually runs on, and the preparation costs more than the insight gives back.',
    },

    /* 3 — what we believe. Three, and only three. */
    beliefs: {
      heading: 'What we believe',
      recovery: {
        title: 'Something happens after the wrong answer',
        body: 'A wrong answer is where the work starts, not where it stops. We fix it from the student’s own material, in the room, and then verify with a new item — a correction nobody checks is only a hope.',
      },
      method: {
        title: 'The method of action reveals the thinking',
        body: 'A drag path, its direction, a hesitation, an undo — these say what a multiple-choice click cannot. Two students can reach the same wrong answer for entirely different reasons, and only the route there tells them apart.',
      },
      preparation: {
        title: 'Zero preparation',
        body: 'Every activity comes from the course material itself, mapped in advance. A teacher who has to write questions first will not do it in week nine.',
      },
    },

    /* 4 — where we are. Stated plainly, because it is early. */
    status: {
      heading: 'Where we are',
      body: 'Asasera has not launched and has no users. It is being built and tested in real university lectures, starting with the founder’s own course, and what happens in those rooms decides what ships next. We would rather tell a department that plainly than describe a company we are not yet.',
    },
  },

  /* ------------------------------------------------------------------ *
   * Auth screens
   *
   * One table, both languages, no string in JSX. Field labels are separate
   * from placeholders on purpose: the placeholder is an example, never the
   * label, because it vanishes on focus and takes the accessible name with
   * it if it is doing both jobs.
   * ------------------------------------------------------------------ */
  auth: {
    common: {
      emailLabel: 'Email address',
      emailPlaceholder: 'you@university.edu',
      passwordLabel: 'Password',
      nameLabel: 'Full name',
      namePlaceholder: 'As you want it shown',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      /* {{count}} of {{min}} — Western digits in both languages. */
      passwordCount: '{{count}} of {{min}} characters',
      submitting: 'Working…',
      or: 'or',
      google: 'Continue with Google',
      facebook: 'Continue with Facebook',
      required: 'Required',
      backToSignIn: 'Back to sign in',
    },

    errors: {
      nameRequired: 'Enter your name.',
      emailRequired: 'Enter your email address.',
      emailInvalid: 'Enter a valid email address.',
      passwordRequired: 'Enter a password.',
      passwordShort: 'Use at least 12 characters.',
      stageRequired: 'Choose a stage.',
      categoryRequired: 'Choose a subject.',
      generic: 'Something went wrong. Please try again.',
      network: 'Could not reach the server. Check your connection and try again.',
      loadFailed: 'Could not load the list. Reload the page to try again.',
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
      done: 'Your password has been changed. Sign in with it.',
      badToken: 'That link has expired or has already been used. Request a new one.',
      requestAnother: 'Request a new link',
    },

    verify: {
      title: 'Verifying your email',
      working: 'One moment.',
      done: 'Your email is verified. You can sign in now.',
      failed: 'That link has expired or has already been used.',
      missing: 'That link is incomplete.',
    },

    completeProfile: {
      title: 'Two more things',
      lead: 'Google did not tell us what you teach, and we will not guess.',
      submit: 'Save and continue',
    },

    callback: {
      working: 'Signing you in…',
      cancelled: 'Sign-in was cancelled. Nothing has changed, and you can try again whenever you like.',
      accountExists: 'This email is already registered. Sign in with your password, then connect Google from your account.',
      failed: 'We could not complete that sign-in. Please try again.',
    },

    /* The one authenticated screen. A single line, and nothing else. */
    home: {
      signedIn: 'You are signed in.',
      signOut: 'Sign out',
    },
  },

  signIn: {
    title: 'Sign in to Asasera',
    lead: 'Continue with an account you already have.',
    google: 'Continue with Google',
    facebook: 'Continue with Facebook',
    /*
     * The three states the Facebook callback can send someone back in, plus
     * the two that are not Facebook's fault. Each says what happened and what
     * to do next -- an error the reader cannot act on is just an apology.
     */
    errors: {
      cancelled: 'Sign-in was cancelled. Nothing has changed, and you can try again whenever you like.',
      accountExists:
        'An account already exists for that email address. Sign in with the method you used originally, then connect Facebook from your account settings.',
      badState: 'We could not verify that sign-in, so we stopped it. Please start again from this page.',
      expired: 'That sign-in took too long and expired. Please try again.',
      unavailable: 'Facebook sign-in is unavailable right now. Please try another method.',
      failed: 'Something went wrong signing you in. Please try again.',
    },
    notices: {
      /*
       * A prompt, never a blocker. A Facebook account created against a phone
       * number has no address to give us, and the account works fine without
       * one -- so this is phrased as an offer with a way past it.
       */
      needsEmail:
        'You are signed in. Facebook did not share an email address, so add one when you have a moment — it is how we send you sign-in links and receipts.',
      needsProfile: 'You are signed in. Tell us what you teach or study to finish setting up your account.',
    },
    signedIn: 'You are signed in.',
    retry: 'Back to sign in',
  },

  notFound: {
    code: '404',
    title: 'There is no page here',
    body: 'The link you followed may be broken, or the page may have been moved.',
  },
} satisfies Record<string, unknown>

export default en
