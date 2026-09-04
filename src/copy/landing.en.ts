import type { LandingCopy } from './landing.ar'

/**
 * English copy for the landing page.
 *
 * Written as English, not translated from the Arabic. The Arabic leads with
 * rhythm and repetition; English of this kind sells better short and flat, so
 * several lines are shorter here and one or two are restructured entirely.
 * Where the Arabic says "لم تكتب سؤالًا، ولم تصحّح ورقة" as two balanced
 * clauses, the English lands harder as one.
 *
 * Typed as `LandingCopy`, so a key added to the Arabic table and forgotten
 * here is a compile error rather than an `undefined` rendered into the page.
 */
export const landingEn: LandingCopy = {
  /* Document ------------------------------------------------------- */
  'meta.title': 'Asasera — Your lesson is ready. Class takes two taps.',
  'meta.description':
    'A live in-class loop for university teachers. Open a link, find your course already mapped lesson by lesson, press start. Five minutes later you know who understood and who did not — without writing a question or marking a paper.',
  'skipToContent': 'Skip to content',

  /* 1 — Nav -------------------------------------------------------- */
  'nav.brandAlt': 'Asasera',
  'nav.howItWorks': 'How it works',
  'nav.types': 'Interactions',
  'nav.pricing': 'Pricing',
  'nav.departments': 'For departments',
  'nav.login': 'Log in',
  'nav.cta': 'Start with your lesson',
  'nav.language': 'Language',
  'nav.switchToArabic': 'التبديل إلى العربية',
  'nav.switchToEnglish': 'Switch to English',
  'nav.arabicShort': 'ع',
  'nav.englishShort': 'EN',
  'nav.toggleTheme': 'Toggle colour theme',
  'nav.lightMode': 'Light',
  'nav.darkMode': 'Dark',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.menuLabel': 'Main navigation',

  /* 2 — Hero ------------------------------------------------------- */
  'hero.title': 'Your lesson is ready. Class takes two taps.',
  'hero.subtitle':
    'Five minutes inside the lecture, and you know who understood before it ends. You wrote no questions and marked no papers.',
  'hero.ctaPrimary': 'Start with your lesson',
  'hero.ctaSecondary': 'See the loop in 30 seconds',
  'hero.trust': 'No uploads • No question writing • No class setup',

  'hero.decisionLabel': 'Mid-class decision',
  'hero.decisionCount': '8',
  'hero.decisionTitle': 'students share the same error',
  'hero.decisionFix': 'Fix it with them',
  'hero.decisionSkip': 'Carry on',

  'hero.summaryLabel': 'End of session',
  'hero.summaryMastered': 'mastered',
  'hero.summaryRecovered': 'recovered',
  'hero.summaryNeedYou': 'need you',
  'hero.summaryMasteredCount': '24',
  'hero.summaryRecoveredCount': '6',
  'hero.summaryNeedYouCount': '2',
  'hero.summaryReasonLabel': 'Because:',
  'hero.summaryReasonBefore': 'they confuse the primary key',
  'hero.summaryReasonTermOne': 'Primary Key',
  'hero.summaryReasonMiddle': 'with the foreign one',
  'hero.summaryReasonTermTwo': 'Foreign Key',

  /* 3 — Join strip ------------------------------------------------- */
  'join.prompt': 'Got a code from your teacher?',
  'join.inputLabel': 'Join code',
  'join.inputHint': 'Six letters and digits, as shown on the room screen',
  'join.submit': 'Join',
  'join.errorEmpty': 'Enter the code shown on the screen.',
  'join.errorShort': 'The code is six characters. Finish the rest.',

  /* 4 — The loop --------------------------------------------------- */
  'loop.overline': 'The loop',
  'loop.title': 'How a session runs',
  'loop.closing': 'Total teacher effort: two taps.',

  'loop.1.index': '1',
  'loop.1.actor': 'The teacher',
  'loop.1.duration': '10 seconds',
  'loop.1.body': 'Opens the link, finds the course mapped lesson by lesson, presses start',

  'loop.2.index': '2',
  'loop.2.actor': 'The student',
  'loop.2.duration': 'One minute',
  'loop.2.body': 'A code on the phone, and a first name typed once',

  'loop.3.index': '3',
  'loop.3.actor': 'Play',
  'loop.3.duration': '5 to 10 minutes',
  'loop.3.body': 'Items drawn from the lesson pages themselves; the screen shows progress, not rank',

  'loop.4.index': '4',
  'loop.4.actor': 'A decision, mid-class',
  'loop.4.duration': 'One moment',
  'loop.4.body': 'Eight students share the same error — fix it with them? The call is yours',

  'loop.5.index': '5',
  'loop.5.actor': 'Fix, then verify',
  'loop.5.duration': '4 minutes',
  'loop.5.body': 'A targeted fix from the same material, then a fresh item proving the gap closed',

  'loop.6.index': '6',
  'loop.6.actor': 'One sentence',
  'loop.6.duration': 'The end',
  'loop.6.body': 'No wall of charts. Something you can act on.',

  /* 5 — Gap -------------------------------------------------------- */
  'gap.title': 'What is missing today, and what we do',
  'gap.colGap': 'Missing today',
  'gap.colUs': 'What we do',

  'gap.1.lack': 'Nothing happens after the wrong answer',
  'gap.1.us': 'We fix it immediately from the student’s own material, then verify with a new item',

  'gap.2.lack': 'Multiple choice only',
  'gap.2.us': 'Drag, order, build and match — no guessing',

  'gap.3.lack': 'No link to the course',
  'gap.3.us': 'Every item comes from the course material itself, mapped in advance',

  /* 6 — Interaction types ------------------------------------------ */
  'types.title': 'Interaction types',
  'types.lead': 'The two that set us apart: drag, and interactive images.',

  'types.drag.title': 'Drag',
  'types.drag.body':
    'With multiple choice we know a student pressed a button. With drag we know the path, the direction, the hesitation and the backtrack.',

  'types.image.title': 'Interactive images',
  'types.image.body':
    'Marked regions on an image from your own material — the student places each label, and what they know and what they confuse both show.',

  'types.mcq.title': 'Multiple choice',
  'types.mcq.body': 'Every wrong option maps to a known error, not just “incorrect”.',

  'types.truefalse.title': 'True or false',
  'types.truefalse.body': 'For telling two close concepts apart, quickly.',

  'types.ordering.title': 'Ordering',
  'types.ordering.body': 'When the sequence itself is the knowledge being tested.',

  /* 7 — Image editor ----------------------------------------------- */
  'editor.title': 'The system draws. The teacher deletes.',
  'editor.closing': 'Under a minute. And zero drawing.',

  'editor.1.index': '1',
  'editor.1.title': 'Bring the image',
  'editor.1.body': 'Shoot it on your phone, crop it from your file, or take it from your course library',

  'editor.2.index': '2',
  'editor.2.title': 'The system proposes',
  'editor.2.body': 'Up to six regions with their labels and distractors — without you doing anything',

  'editor.3.index': '3',
  'editor.3.title': 'Three actions',
  'editor.3.body': 'Delete, rename, approve. The teacher never draws.',

  'editor.actionDelete': 'Delete',
  'editor.actionRename': 'Rename',
  'editor.actionApprove': 'Approve',
  'editor.regionOne': 'Nucleus',
  'editor.regionTwo': 'Membrane',


  /* 9 — Zero prep --------------------------------------------------- */
  'zero.title': 'Where the content comes from',
  'zero.closing': 'Not “zero work” — zero work before the first benefit.',

  'zero.1.title': 'What you teach',
  'zero.1.body': 'From your course map',
  'zero.2.title': 'Who your students are',
  'zero.2.body': 'From the join code',
  'zero.3.title': 'Who you are',
  'zero.3.body': 'Three fields',

  /* 10 — Pricing ---------------------------------------------------- */
  'pricing.overline': 'Pricing',
  'pricing.title': 'A plan for each stage',
  'pricing.featured': 'Best for departments',
  'pricing.band': 'Students never pay. Not to play, not to be fixed, not to be verified.',

  'pricing.free.name': 'Free',
  'pricing.free.price': 'Free',
  'pricing.free.period': '',
  'pricing.free.features': 'One course|3 items per lesson|Unlimited sessions|Basic reports',

  'pricing.pro.name': 'Pro',
  'pricing.pro.price': '$8–12',
  'pricing.pro.period': 'per month',
  'pricing.pro.features': 'Unlimited courses and items|Wider uploads|Extended reports|Export',

  'pricing.dept.name': 'Department',
  'pricing.dept.price': 'Per member',
  'pricing.dept.period': 'per year',
  'pricing.dept.features': 'Seats|Internal library|Course-level reports|Support',

  'pricing.org.name': 'Institution',
  'pricing.org.price': 'Contract',
  'pricing.org.period': '',
  'pricing.org.features': 'Integration|Single sign-on|Assessment integrity',

  /* 11 — Departments ------------------------------------------------ */
  'dept.title': 'Proof of learning',
  'dept.body':
    'Direct evidence of what your students can actually do — in the room, in Arabic and English, inside five minutes.',
  'dept.cta': 'Talk to us about your department',
  'dept.imageAlt': 'A university teacher with a group of students in a lecture room',

  'dept.form.title': 'Talk to us about your department',
  'dept.form.name': 'Name',
  'dept.form.email': 'Email',
  'dept.form.org': 'University or department',
  'dept.form.faculty': 'Number of faculty members',
  'dept.form.sent': 'We have your message. We will reply within one working day.',
  'dept.form.errName': 'Enter your name.',
  'dept.form.errEmail': 'Enter a valid email, such as name@university.edu',
  'dept.form.errOrg': 'Enter the university or department.',
  'dept.form.errFaculty': 'Enter a number greater than zero.',

  /* 12 — Footer ----------------------------------------------------- */
  'footer.brandAlt': 'Asasera',
  'footer.about': 'About',
  'footer.support': 'Support',
  'footer.legal': 'Legal',
  'footer.about.story': 'Who we are',
  'footer.about.method': 'The method',
  'footer.about.contact': 'Contact',
  'footer.support.help': 'Help centre',
  'footer.support.start': 'Getting started',
  'footer.support.status': 'Service status',
  'footer.legal.privacy': 'Privacy',
  'footer.legal.terms': 'Terms',
  'footer.legal.data': 'Student data',
  'footer.copyright': '© 2026 Asasera.',
}
