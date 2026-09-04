/**
 * Arabic copy for the landing page.
 *
 * Flat and dot-namespaced so `landing.en.ts` can be typed against it and fail
 * the build on a missing key.
 *
 * NUMERALS: Western digits (0-9) throughout, never Arabic-Indic. That is a
 * product decision, not a typographic accident — the audience is university
 * departments reading prices, durations and counts alongside Latin technical
 * terms, and mixing numeral systems inside one sentence costs more than it
 * buys. `font-feature-settings: 'anum' 0` in tokens.css stops the font
 * substituting them back at render time.
 *
 * Numbers inside Arabic prose are still isolated with <Bdi> at render time,
 * never here.
 */
export const landingAr = {
  /* Document ------------------------------------------------------- */
  'meta.title': 'أساسيرا — درسك جاهز. حصتك بضغطتين.',
  'meta.description':
    'حلقة حيّة داخل المحاضرة لأساتذة الجامعات. يفتح الأستاذ الرابط فيجد مقرره مقسّمًا درسًا درسًا، ويضغط «ابدأ». خمس دقائق، ثم تعرف من فهم ومن لم يفهم — بلا كتابة سؤال وبلا تصحيح ورقة.',
  'skipToContent': 'تخطَّ إلى المحتوى',

  /* 1 — Nav -------------------------------------------------------- */
  'nav.brandAlt': 'أساسيرا',
  'nav.howItWorks': 'كيف يعمل',
  'nav.types': 'الأنواع',
  'nav.pricing': 'الأسعار',
  'nav.departments': 'للأقسام',
  'nav.login': 'تسجيل الدخول',
  'nav.cta': 'ابدأ بدرسك',
  'nav.language': 'اللغة',
  'nav.switchToArabic': 'التبديل إلى العربية',
  'nav.switchToEnglish': 'Switch to English',
  'nav.arabicShort': 'ع',
  'nav.englishShort': 'EN',
  'nav.toggleTheme': 'تبديل مظهر الألوان',
  'nav.lightMode': 'فاتح',
  'nav.darkMode': 'داكن',
  'nav.openMenu': 'افتح القائمة',
  'nav.closeMenu': 'أغلق القائمة',
  'nav.menuLabel': 'القائمة الرئيسية',

  /* 2 — Hero ------------------------------------------------------- */
  'hero.title': 'درسك جاهز. حصتك بضغطتين.',
  'hero.subtitle':
    'خمس دقائق داخل المحاضرة — وتعرف من فهم ومن لم يفهم قبل أن تنتهي. لم تكتب سؤالًا، ولم تصحّح ورقة.',
  'hero.ctaPrimary': 'ابدأ بدرسك',
  'hero.ctaSecondary': 'شاهد الحلقة في 30 ثانية',
  'hero.trust': 'لا رفع • لا كتابة أسئلة • لا إنشاء شُعب',

  'hero.decisionLabel': 'قرار أثناء الحصة',
  'hero.decisionCount': '8',
  'hero.decisionTitle': 'طلاب يشتركون في الخطأ نفسه',
  'hero.decisionFix': 'عالجها معهم',
  'hero.decisionSkip': 'أكمل',

  'hero.summaryLabel': 'نهاية الجلسة',
  'hero.summaryMastered': 'أتقنوا',
  'hero.summaryRecovered': 'تعافوا',
  'hero.summaryNeedYou': 'يحتاجانك',
  'hero.summaryMasteredCount': '24',
  'hero.summaryRecoveredCount': '6',
  'hero.summaryNeedYouCount': '2',
  'hero.summaryReasonLabel': 'والسبب:',
  'hero.summaryReasonBefore': 'يخلطون بين المفتاح الأساسي',
  'hero.summaryReasonTermOne': 'Primary Key',
  'hero.summaryReasonMiddle': 'والأجنبي',
  'hero.summaryReasonTermTwo': 'Foreign Key',

  /* 3 — Join strip ------------------------------------------------- */
  'join.prompt': 'عندك رمز من معلمك؟',
  'join.inputLabel': 'رمز الانضمام',
  'join.inputHint': 'ستة أحرف وأرقام، كما يظهر على شاشة القاعة',
  'join.submit': 'انضم',
  'join.errorEmpty': 'أدخل الرمز الظاهر على الشاشة.',
  'join.errorShort': 'الرمز ستة رموز. أكمل الباقي.',

  /* 4 — The loop --------------------------------------------------- */
  'loop.overline': 'الحلقة',
  'loop.title': 'كيف تعمل الحصة',
  'loop.closing': 'مجموع عمل المعلم: ضغطتان.',

  'loop.1.index': '1',
  'loop.1.actor': 'المعلم',
  'loop.1.duration': '10 ثوانٍ',
  'loop.1.body': 'يفتح الرابط، يجد مقرره درسًا درسًا، يضغط «ابدأ»',

  'loop.2.index': '2',
  'loop.2.actor': 'الطالب',
  'loop.2.duration': 'دقيقة',
  'loop.2.body': 'رمز على الهاتف، واسم يُكتب مرة واحدة',

  'loop.3.index': '3',
  'loop.3.actor': 'اللعب',
  'loop.3.duration': '5 إلى 10 دقائق',
  'loop.3.body': 'أنشطة من صفحات الدرس نفسه، والشاشة تعرض التقدّم لا الترتيب',

  'loop.4.index': '4',
  'loop.4.actor': 'قرار أثناء الحصة',
  'loop.4.duration': 'لحظة',
  'loop.4.body': 'ثمانية يشتركون في الخطأ نفسه — عالجها معهم؟ والقرار لك',

  'loop.5.index': '5',
  'loop.5.actor': 'الإصلاح ثم التحقق',
  'loop.5.duration': '4 دقائق',
  'loop.5.body': 'إصلاح موجّه من المادة نفسها، ثم عنصر جديد يثبت أن الثغرة أُغلقت',

  'loop.6.index': '6',
  'loop.6.actor': 'سطر واحد',
  'loop.6.duration': 'النهاية',
  'loop.6.body': 'لا جدران رسوم بيانية. جملة قابلة للتصرّف.',

  /* 5 — Gap -------------------------------------------------------- */
  'gap.title': 'ما ينقص اليوم، وما نفعله',
  'gap.colGap': 'ما ينقص اليوم',
  'gap.colUs': 'ما نفعله',

  'gap.1.lack': 'لا شيء بعد الخطأ',
  'gap.1.us': 'نُصلح فورًا من مادة الطالب، ثم نتحقق بعنصر جديد',

  'gap.2.lack': 'اختيار من متعدد فقط',
  'gap.2.us': 'سحب وترتيب وبناء ومطابقة — لا تخمين',

  'gap.3.lack': 'لا ارتباط بالمادة',
  'gap.3.us': 'كل نشاط من مادة المقرر نفسها، محلَّلة مسبقًا',

  /* 6 — Interaction types ------------------------------------------ */
  'types.title': 'أنواع التفاعل',
  'types.lead': 'النوعان اللذان يفرّقاننا: السحب، والصور التفاعلية.',

  'types.drag.title': 'السحب',
  'types.drag.body':
    'في الاختيار من متعدد نعرف أن الطالب ضغط زرًا. في السحب نعرف المسار والاتجاه والتردد والتراجع.',

  'types.image.title': 'الصور التفاعلية',
  'types.image.body':
    'مناطق محدَّدة على صورة من مادتك — يضع الطالب الاسم على موضعه، فيظهر ما يعرفه وما يخلط بينه.',

  'types.mcq.title': 'اختيار من متعدد',
  'types.mcq.body': 'لكل خيار خاطئ سبب معروف، لا مجرد «غير صحيح».',

  'types.truefalse.title': 'صح وخطأ',
  'types.truefalse.body': 'للتمييز السريع بين مفهومين متقاربين.',

  'types.ordering.title': 'الترتيب',
  'types.ordering.body': 'حين يكون التسلسل نفسه هو المعرفة المطلوبة.',

  /* 7 — Image editor ----------------------------------------------- */
  'editor.title': 'النظام يرسم والمعلم يحذف',
  'editor.closing': 'أقل من دقيقة. وصفر رسم.',

  'editor.1.index': '1',
  'editor.1.title': 'أحضِر الصورة',
  'editor.1.body': 'تصوير بالهاتف، أو قص من ملفك، أو من معرض مادتك الجاهز',

  'editor.2.index': '2',
  'editor.2.title': 'النظام يقترح',
  'editor.2.body': 'حتى ست مناطق بتسمياتها ومشتتاتها — بلا أن تفعل شيئًا',

  'editor.3.index': '3',
  'editor.3.title': 'ثلاثة أفعال',
  'editor.3.body': 'احذف • عدّل تسمية • وافق. والمعلم لا يرسم أبدًا',

  'editor.actionDelete': 'احذف',
  'editor.actionRename': 'عدّل تسمية',
  'editor.actionApprove': 'وافق',
  'editor.regionOne': 'النواة',
  'editor.regionTwo': 'الغشاء',


  /* 9 — Zero prep --------------------------------------------------- */
  'zero.title': 'من أين يأتي المحتوى',
  'zero.closing': 'ليست «صفر عمل» — بل صفر عمل قبل أول فائدة.',

  'zero.1.title': 'ماذا تُدرّس',
  'zero.1.body': 'من خريطة مادتك',
  'zero.2.title': 'من طلابك',
  'zero.2.body': 'من رمز الانضمام',
  'zero.3.title': 'من أنت',
  'zero.3.body': 'ثلاثة حقول',

  /* 10 — Pricing ---------------------------------------------------- */
  'pricing.overline': 'الأسعار',
  'pricing.title': 'خطة لكل مرحلة',
  'pricing.featured': 'الأنسب للأقسام',
  'pricing.band': 'الطالب لا يدفع أبدًا. لا للعب، ولا للإصلاح، ولا للتحقق.',

  'pricing.free.name': 'مجاني',
  'pricing.free.price': 'مجانًا',
  'pricing.free.period': '',
  'pricing.free.features': 'مقرر واحد|3 أنشطة لكل درس|جلسات بلا حد|تقارير أساسية',

  'pricing.pro.name': 'احترافي',
  'pricing.pro.price': '8–12 $',
  'pricing.pro.period': 'شهريًا',
  'pricing.pro.features': 'مقررات وأنشطة بلا حد|رفع أوسع|تقارير ممتدة|تصدير',

  'pricing.dept.name': 'قسم',
  'pricing.dept.price': 'سعر لكل عضو',
  'pricing.dept.period': 'سنويًا',
  'pricing.dept.features': 'مقاعد|مكتبة داخلية|تقارير على مستوى المقرر|دعم',

  'pricing.org.name': 'مؤسسة',
  'pricing.org.price': 'عقد',
  'pricing.org.period': '',
  'pricing.org.features': 'تكامل|حساب موحّد|نزاهة التقييم',

  /* 11 — Departments ------------------------------------------------ */
  'dept.title': 'ضمان التعلّم',
  'dept.body':
    'دليل مباشر على ما يستطيع طالبك فعله، في القاعة، بالعربية والإنجليزية، خلال خمس دقائق.',
  'dept.cta': 'تحدّث إلينا عن قسمك',
  'dept.imageAlt': 'أستاذ جامعي مع مجموعة من طلابه داخل القاعة',

  'dept.form.title': 'تحدّث إلينا عن قسمك',
  'dept.form.name': 'الاسم',
  'dept.form.email': 'البريد الإلكتروني',
  'dept.form.org': 'الجامعة أو القسم',
  'dept.form.faculty': 'عدد أعضاء هيئة التدريس',
  'dept.form.sent': 'وصلتنا رسالتك. سنردّ خلال يوم عمل.',
  'dept.form.errName': 'اكتب اسمك.',
  'dept.form.errEmail': 'اكتب بريدًا إلكترونيًا صحيحًا، مثل name@university.edu',
  'dept.form.errOrg': 'اكتب اسم الجامعة أو القسم.',
  'dept.form.errFaculty': 'اكتب عددًا أكبر من صفر.',

  /* 12 — Footer ----------------------------------------------------- */
  'footer.brandAlt': 'أساسيرا',
  'footer.about': 'عن المنصة',
  'footer.support': 'الدعم',
  'footer.legal': 'قانوني',
  'footer.about.story': 'من نحن',
  'footer.about.method': 'المنهج',
  'footer.about.contact': 'اتصل بنا',
  'footer.support.help': 'مركز المساعدة',
  'footer.support.start': 'دليل البدء',
  'footer.support.status': 'حالة الخدمة',
  'footer.legal.privacy': 'الخصوصية',
  'footer.legal.terms': 'الشروط',
  'footer.legal.data': 'بيانات الطلبة',
  'footer.copyright': '© 2026 أساسيرا.',
} as const

export type LandingCopyKey = keyof typeof landingAr
export type LandingCopy = Record<LandingCopyKey, string>
