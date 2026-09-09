import type { AuthCopy } from './auth.en'

/**
 * Auth-screen copy.
 *
 * Lives here, not in the i18n bundle, because the project rule is that copy
 * lives in src/copy — the bundle imports this table rather than owning it.
 * The Arabic is written natively, not translated from the other.
 */
export const authAR: AuthCopy = {

  common: {
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    newPasswordLabel: 'كلمة المرور الجديدة',
    nameLabel: 'الاسم',
    namePlaceholder: 'كما تريده أن يظهر',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    submitting: 'جارٍ التنفيذ…',
    checking: 'جارٍ التحقّق…',
    or: 'أو',
    google: 'المتابعة عبر Google',
    facebook: 'المتابعة عبر Facebook',
    required: 'مطلوب',
    backToSignIn: 'العودة إلى تسجيل الدخول',
    noResults: 'لا نتائج',
    loading: 'جارٍ التحميل…',
    retry: 'إعادة المحاولة',
    unavailable: 'غير متاح بعد',
    loadError: 'تعذّر التحميل. اضغط لإعادة المحاولة.',
    apple: 'المتابعة عبر Apple',
    comingSoon: 'قريبًا',
  },

  errors: {
    nameRequired: 'اكتب اسمك.',
    emailRequired: 'اكتب بريدك الإلكتروني.',
    emailInvalid: 'اكتب بريدًا إلكترونيًا صحيحًا.',
    passwordRequired: 'اكتب كلمة مرور.',
    passwordShort: 'استخدم 12 حرفًا على الأقل.',
    stageRequired: 'اختر المرحلة.',
    categoryRequired: 'اختر المادة.',
    notFound: 'هذا غير متاح، أو ليس لك.',
    generic: 'حدث خطأ. أعد المحاولة من فضلك.',
    network: 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك وأعد المحاولة.',
    loadFailed: 'تعذّر تحميل هذه القائمة.',
    /* Same split. The placeholder sits where the link goes; the sentence
       around it stays one translated sentence rather than three fragments. */
    emailTaken: 'يوجد حساب مسجّل بهذا البريد الإلكتروني. {{signIn}} بدلًا من ذلك.',
    emailTakenAction: 'سجّل الدخول',
    emailCheckFailed: 'تعذّر التحقّق من هذا البريد. أعد المحاولة من فضلك.',
  },

  chooseRole: {
    title: 'أنشئ حسابك',
    lead: 'اختر نوع حسابك أولًا.',
    teacher: {
      title: 'معلّم',
      body: 'أنشئ أنشطة، قدّم ألعابًا تعليمية وتابع تقدّم طلابك.',
      action: 'متابعة كمعلّم',
    },
    student: {
      title: 'طالب',
      body: 'انضمّ إلى حصّتك، أكمل أنشطتك وتدرّب بالألعاب.',
      action: 'متابعة كطالب',
    },
    haveAccount: 'لديك حساب بالفعل؟',
  },

  signup: {
    workplace: {
      title: 'اختر بيئة العمل الأكثر ملاءمة لك.',
      lead: 'إذا لم تكن متأكدًا، يمكنك تغيير اختيارك لاحقًا.',
    },
    stage: {
      title: {
        teacher: 'أي مرحلة تُدرّس؟',
        student: 'أي مرحلة تدرس؟',
      },
      lead: {
        teacher: 'هذا يضبط ما تقترحه أساسيرا عليك، ويمكنك تغييره لاحقًا.',
        student: 'هذا يضبط ما تراه، ويمكنك تغييره لاحقًا.',
      },
      later: 'أختار لاحقًا',
    },
    method: {
      title: 'أنشئ حسابك',
      lead: 'تابع عبر Google، أو استخدم بريدًا إلكترونيًا.',
      submit: 'متابعة',
    },
    password: {
      title: 'أنشئ كلمة المرور',
      lead: 'خطوة واحدة ويصبح حسابك جاهزًا.',
      edit: 'تعديل',
      hint: '12 حرفًا على الأقل. لا رموز ولا أحرف كبيرة مطلوبة.',
      submit: 'إنشاء الحساب',
    },
    checkEmail: {
      title: 'تحقّق من بريدك',
      lead: 'حسابك جاهز. أكّد عنوانك لإتمام الإعداد.',
      body: 'أرسلنا رابطًا إلى العنوان أعلاه. يعمل مرّة واحدة ثم تنتهي صلاحيّته.',
      nextTeacher: 'بعد ذلك سنسألك عمّا تُدرّس، وكلّه اختياري.',
      nextStudent: 'بعد ذلك يمكنك إضافة اسمك متى شئت.',
    },
  },

  login: {
    title: 'تسجيل الدخول',
    lead: 'تابع بحسابٍ تملكه بالفعل.',
    submit: 'دخول',
    forgot: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    registerTeacher: 'تسجيل معلّم',
    registerStudent: 'تسجيل طالب',
    failed: 'البريد وكلمة المرور غير متطابقين.',
  },

  registerTeacher: {
    title: 'إنشاء حساب معلّم',
    lead: 'مقرّرك، وصفحات دروسك، وقاعتك.',
    categoryLabel: 'المادة',
    categoryPlaceholder: 'اختر المادة',
    salutationLabel: 'اللقب',
    salutationPlaceholder: 'اختياري',
    stageLabel: 'المرحلة',
    stagePlaceholder: 'اختر المرحلة',
    stageHint: 'أساسيرا مخصّصة للتعليم الجامعي وحده.',
    submit: 'إنشاء الحساب',
    switch: 'تسجّل كطالب بدلًا من ذلك؟',
    switchLink: 'تسجيل الطلاب',
  },

  registerStudent: {
    title: 'إنشاء حساب طالب',
    lead: 'انضمّ إلى صفّك برمزٍ بعد تجهيز حسابك.',
    submit: 'إنشاء الحساب',
    switch: 'هل أنت معلّم؟',
    switchLink: 'تسجيل المعلّمين',
  },

  registered: {
    title: 'تحقّق من بريدك',
    body: 'إن كان هذا العنوان يستقبل البريد، فرابط إكمال الحساب في طريقه إليك. الرابط يعمل مرّة واحدة ثم تنتهي صلاحيّته.',
  },

  forgot: {
    title: 'إعادة تعيين كلمة المرور',
    lead: 'اكتب بريدك الإلكتروني وسنرسل إليك رابطًا.',
    submit: 'أرسل الرابط',
    sent: 'إن كان لهذا العنوان حساب، فرابط إعادة التعيين في طريقه إليه.',
    remembered: 'تذكّرتها؟',
  },

  reset: {
    title: 'اختر كلمة مرور جديدة',
    lead: 'هذا يسجّل خروجك من كل الأجهزة الأخرى.',
    submit: 'حفظ كلمة المرور',
    doneTitle: 'تم تغيير كلمة المرور',
    done: 'تغيّرت كلمة مرورك. سجّل الدخول بها.',
    badTokenTitle: 'هذا الرابط لم يعمل',
    badToken: 'انتهت صلاحيّة هذا الرابط أو استُخدم من قبل. اطلب رابطًا جديدًا.',
    requestAnother: 'اطلب رابطًا جديدًا',
  },

  verify: {
    title: 'جارٍ تأكيد بريدك',
    working: 'جارٍ التحقّق من الرابط…',
    done: 'تم تأكيد بريدك الإلكتروني.',
    doneBody: 'شكرًا — حسابك في أساسيرا محمي الآن. يمكنك المتابعة.',
    failed: 'هذا الرابط لم يعمل.',
    failedBody:
      'قد يكون منتهي الصلاحية أو مستخدمًا من قبل أو استُبدل برابط أحدث. افتح الشريط في التطبيق وأرسل لنفسك رابطًا جديدًا.',
    missing: 'هذا الرابط ناقص.',
    continueAction: 'متابعة',

    banner: 'أكّد بريدك الإلكتروني لحماية حسابك في أساسيرا. تحقّق من صندوق الوارد على {{email}}.',
    verifyAction: 'تأكيد البريد الإلكتروني',
    changeAction: 'تغيير البريد الإلكتروني',

    panelTitle: 'تأكيد البريد الإلكتروني',
    panelBody:
      'أرسلنا رابطًا إلى العنوان أدناه. تحقّق من صندوق الوارد، ومن مجلد الرسائل غير المرغوب فيها إن لم تجده.',
    resend: 'إعادة إرسال رسالة التأكيد',
    resendSent: 'تم الإرسال. تحقّق من صندوق الوارد.',
    resendWait: 'أُرسلت رسالة للتو. حاول مرة أخرى بعد {{seconds}} ثانية.',
    resendFailed: 'تعذّر الإرسال الآن. حاول بعد قليل.',
    alreadyVerified: 'هذا العنوان مؤكَّد بالفعل.',

    changeTitle: 'تغيير البريد الإلكتروني',
    changeBody:
      'سنرسل رابط تأكيد جديدًا إلى العنوان الذي تُدخله. يبقى حسابك غير مؤكَّد حتى تؤكّده.',
    changeLabel: 'البريد الإلكتروني الجديد',
    changeSubmit: 'حفظ وإرسال الرابط',
    changeInUse: 'هذا العنوان مستخدم بالفعل.',
    changeUnchanged: 'هذا هو العنوان المسجَّل بالفعل على هذا الحساب.',
    close: 'إغلاق',
  },

  completeProfile: {
    title: 'أمران فقط',
    lead: 'هذا يضبط ما تقترحه أساسيرا. كلا الحقلين اختياري، ويمكنك تغييرهما لاحقًا.',
    workplaceLabel: 'بيئة العمل',
    workplacePlaceholder: 'اختر بيئة العمل',
    submit: 'حفظ ومتابعة',
    skip: 'تخطّي الآن',
  },

  callback: {
    working: 'جارٍ تسجيل دخولك…',
    cancelled: 'أُلغي تسجيل الدخول. لم يتغيّر شيء، ويمكنك المحاولة متى شئت.',
    accountExists: 'هذا البريد مسجّل بالفعل. سجّل الدخول بكلمة مرورك، ثم اربط Google من حسابك.',
    failed: 'تعذّر إكمال تسجيل الدخول. أعد المحاولة من فضلك.',
    badState: 'تعذّر التحقق من تسجيل الدخول. أعد المحاولة من فضلك.',
    expired: 'انتهت صلاحية تسجيل الدخول. أعد المحاولة من فضلك.',
    unavailable: 'تسجيل الدخول عبر Google غير متاح حاليًا.',
  },

  home: {
    signedIn: 'تمّ تسجيل دخولك.',
    signOut: 'تسجيل الخروج',
  },

}
