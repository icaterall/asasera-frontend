/**
 * Arabic copy for the five auth screens.
 *
 * Flat and dot-namespaced, exactly like `landing.ar.ts`, so `auth.en.ts` can
 * be typed against this table and the build fails on a missing key rather
 * than rendering `undefined` at someone who is trying to sign in.
 *
 * NUMERALS: Western digits (0-9), never Arabic-Indic — the same product rule
 * the landing copy follows. It matters more here than there, because the one
 * number on these screens is the live password counter, and a counter that
 * renders ١٢ while the rule says 12 is a counter nobody trusts. Nothing in
 * this file formats a number through `Intl`; the counter interpolates a plain
 * JavaScript number, which is ASCII by construction.
 *
 * Latin runs inside Arabic sentences (an email address, a provider name) are
 * isolated with <Bdi> at render time, never here — a copy table should not
 * carry markup.
 */
export const authAr = {
  /* Shared ---------------------------------------------------------- */
  'or': 'أو',
  'google.continue': 'المتابعة باستخدام Google',
  'facebook.continue': 'المتابعة باستخدام Facebook',

  /* Field labels — every one of these is a real <label>, never a placeholder */
  'field.name.label': 'الاسم الكامل',
  'field.name.placeholder': 'كما تريده أن يظهر لطلابك',
  'field.email.label': 'البريد الإلكتروني',
  'field.email.placeholder': 'name@university.edu',
  'field.password.label': 'كلمة المرور',
  'field.password.placeholder': 'اختر عبارة طويلة يسهل تذكرها',
  'field.newPassword.label': 'كلمة المرور الجديدة',
  'field.subject.label': 'التخصص',
  'field.subject.placeholder': 'اختر تخصصك',
  'field.stage.label': 'المرحلة الدراسية',
  'field.stage.placeholder': 'اختر المرحلة',

  /* Password affordances -------------------------------------------- */
  'password.show': 'إظهار كلمة المرور',
  'password.hide': 'إخفاء كلمة المرور',
  'password.count': '{count} من 12 حرفًا على الأقل',
  'password.countMet': '{count} حرفًا',
  'password.hint': '12 حرفًا على الأقل. لا نطلب رموزًا ولا أحرفًا كبيرة.',

  /* Client-side validation ------------------------------------------ */
  'valid.name.required': 'اكتب اسمك.',
  'valid.email.required': 'اكتب بريدك الإلكتروني.',
  'valid.email.format': 'اكتب بريدًا إلكترونيًا صحيحًا.',
  'valid.password.required': 'اكتب كلمة المرور.',
  'valid.password.short': 'كلمة المرور 12 حرفًا على الأقل.',
  'valid.subject.required': 'اختر تخصصك.',
  'valid.stage.required': 'اختر المرحلة الدراسية.',

  /* Teacher registration -------------------------------------------- */
  'teacher.title': 'إنشاء حساب مُحاضِر',
  'teacher.lead': 'للمحاضرين في الجامعات. التسجيل مفتوح للمراحل الجامعية فقط.',
  'teacher.submit': 'إنشاء الحساب',
  'teacher.switch.prompt': 'هل أنت طالب؟',
  'teacher.switch.link': 'أنشئ حساب طالب',

  /* Student registration -------------------------------------------- */
  'student.title': 'إنشاء حساب طالب',
  'student.lead': 'انضم إلى محاضراتك على أساسيرا.',
  'student.submit': 'إنشاء الحساب',
  'student.switch.prompt': 'هل أنت مُحاضِر؟',
  'student.switch.link': 'أنشئ حساب مُحاضِر',

  /* Shared registration outcome ------------------------------------- */
  'register.sent.title': 'تفقّد بريدك',
  'register.sent.body':
    'أرسلنا رابط تفعيل إلى {email}. افتحه لإكمال إنشاء حسابك.',
  'register.haveAccount': 'لديك حساب بالفعل؟',
  'register.signIn': 'تسجيل الدخول',

  /* Login ------------------------------------------------------------ */
  'login.title': 'تسجيل الدخول',
  'login.lead': 'أهلًا بعودتك.',
  'login.submit': 'تسجيل الدخول',
  'login.forgot': 'نسيت كلمة المرور؟',
  'login.switch.prompt': 'ليس لديك حساب؟',
  'login.switch.student': 'أنشئ حساب طالب',
  'login.switch.teacher': 'أنشئ حساب مُحاضِر',

  /* Forgot ----------------------------------------------------------- */
  'forgot.title': 'استعادة كلمة المرور',
  'forgot.lead': 'اكتب بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
  'forgot.submit': 'أرسل الرابط',
  'forgot.sent.title': 'تفقّد بريدك',
  'forgot.sent.body':
    'إن كان لهذا العنوان حساب، فرابط إعادة التعيين في طريقه إليه الآن.',
  'forgot.back': 'العودة إلى تسجيل الدخول',

  /* Reset ------------------------------------------------------------ */
  'reset.title': 'كلمة مرور جديدة',
  'reset.lead': 'اختر كلمة مرور جديدة لحسابك.',
  'reset.submit': 'حفظ كلمة المرور',
  'reset.done.title': 'تم تغيير كلمة المرور',
  'reset.done.body': 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
  'reset.missingToken':
    'هذا الرابط غير مكتمل. اطلب رابط إعادة تعيين جديدًا.',
  'reset.requestNew': 'اطلب رابطًا جديدًا',

  /* Profile completion (where a Google sign-in with no stage lands) --- */
  'profile.title': 'أكمل ملفك',
  'profile.lead': 'بقي حقلان فقط قبل أن تبدأ.',
  'profile.submit': 'حفظ ومتابعة',

  /* Reference lists -------------------------------------------------- */
  'options.loading': 'جارٍ التحميل…',
  'options.failed': 'تعذّر تحميل القائمة.',
  'options.retry': 'إعادة المحاولة',

  /* Federated sign-in outcomes --------------------------------------- */
  'error.cancelled': 'أُلغي تسجيل الدخول. يمكنك المحاولة مرة أخرى.',
  'error.accountExists':
    'لهذا البريد حساب بكلمة مرور. سجّل الدخول بكلمة مرورك أولًا، ثم اربط Google من إعدادات حسابك.',
  'error.badState': 'تعذّر التحقق من تسجيل الدخول. حاول مرة أخرى.',
  'error.expired': 'انتهت صلاحية الجلسة. حاول مرة أخرى.',
  'error.unavailable': 'تسجيل الدخول عبر Google غير متاح حاليًا.',
  'error.failed': 'تعذّر إكمال تسجيل الدخول. حاول مرة أخرى.',
  'error.network': 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك.',
  'error.credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'error.generic': 'حدث خطأ. حاول مرة أخرى.',

  /* In-flight -------------------------------------------------------- */
  'submitting': 'جارٍ الإرسال…',
} as const

export type AuthCopyKey = keyof typeof authAr
