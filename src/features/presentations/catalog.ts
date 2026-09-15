import {PRESENTATION_QUESTION_KINDS,type PresentationId} from '@/shared/presentation'

/**
 * THE GAMES, NAMED ONCE.
 *
 * Both the launch picker and the create form offer the same set, so the names
 * live here rather than in each screen: a game renamed in one place and not
 * the other is two products to a teacher.
 *
 * `needs` says, in a teacher's words, what a game is fed — it is derived from
 * PRESENTATION_QUESTION_KINDS below rather than written out, so a game whose
 * contract changes cannot keep advertising the old one.
 */
export type GameChoice={id:PresentationId;ar:string;en:string;blurbAr:string;blurbEn:string}
export const GAME_CHOICES:readonly GameChoice[]=[
 {id:'question-wheel',ar:'عجلة الأسئلة',en:'Question wheel',blurbAr:'أدر العجلة ليظهر السؤال التالي أمام الصف.',blurbEn:'Spin the wheel to reveal the next question to the class.'},
 {id:'open-box',ar:'افتح الصندوق',en:'Open the box',blurbAr:'صناديق مرقّمة، وفي كل صندوق سؤال ينتظر.',blurbEn:'Numbered boxes, each hiding a question.'},
 {id:'challenge-cards',ar:'بطاقات التحدي',en:'Challenge cards',blurbAr:'بطاقات متتابعة بأنواع أسئلة مختلفة.',blurbEn:'A run of cards that mixes question types.'},
 {id:'class-competition',ar:'مسابقة الصف',en:'Class competition',blurbAr:'مسابقة جماعية بالنقاط في الحصة المباشرة.',blurbEn:'A live, scored competition for the whole class.'},
 {id:'flashcards',ar:'بطاقات المراجعة',en:'Flashcards',blurbAr:'وجه سؤال ووجه إجابة، للمراجعة الذاتية.',blurbEn:'A question on one side, the answer on the other.'},
 {id:'random-cards',ar:'بطاقات عشوائية',en:'Random cards',blurbAr:'بطاقة بعد بطاقة، بترتيب لا يتوقعه أحد.',blurbEn:'One card after another, in an order nobody can predict.'},
 {id:'match-up',ar:'المطابقة',en:'Match up',blurbAr:'صل كل عنصر بما يناسبه.',blurbEn:'Join each item to the one it belongs with.'},
 {id:'memory',ar:'لعبة الذاكرة',en:'Memory',blurbAr:'اقلب البطاقات وابحث عن الأزواج المتطابقة.',blurbEn:'Flip the cards and find the matching pairs.'},
 {id:'group-sort',ar:'التصنيف والمجموعات',en:'Group sort',blurbAr:'اسحب كل عنصر إلى مجموعته الصحيحة.',blurbEn:'Drag each item into the group it belongs to.'},
 {id:'sequence',ar:'الترتيب',en:'Sequence',blurbAr:'رتّب الخطوات أو الأحداث بالتسلسل الصحيح.',blurbEn:'Put the steps or events in the right order.'},
 {id:'sentence-completion',ar:'أكمل الجملة',en:'Complete the sentence',blurbAr:'فراغات تُملأ بالكلمة المناسبة.',blurbEn:'Blanks to fill with the right word.'},
 {id:'speaking-cards',ar:'بطاقات الحوار',en:'Speaking cards',blurbAr:'أسئلة مفتوحة للنقاش والتحدث.',blurbEn:'Open questions for discussion and speaking.'},
 {id:'word-builder',ar:'بناء الكلمات',en:'Word builder',blurbAr:'كوّن الكلمة من حروفها.',blurbEn:'Build the word from its letters.'},
 {id:'word-search',ar:'البحث عن الكلمات',en:'Word search',blurbAr:'ابحث عن كلمات الدرس داخل الشبكة.',blurbEn:'Find the lesson’s words hidden in a grid.'},
 {id:'crossword',ar:'الكلمات المتقاطعة',en:'Crossword',blurbAr:'كلمات متقاطعة من مفردات الدرس.',blurbEn:'A crossword built from the lesson’s vocabulary.'},
]
const KIND_NAMES:Record<string,[string,string]>={
 mcq:['اختيار من متعدد','multiple choice'],tf:['صح أو خطأ','true/false'],order:['ترتيب','ordering'],
 match:['مطابقة','matching'],hotspot:['تحديد على صورة','pin-on-image'],cloze:['إكمال الفراغ','fill-the-blank'],
 vocabulary:['كلمات','vocabulary'],discussion:['مناقشة','discussion'],
}
/** The question kinds this game plays, written the way the editor names them. */
export function gameNeeds(id:PresentationId,ar:boolean):string{
 return PRESENTATION_QUESTION_KINDS[id].map(kind=>KIND_NAMES[kind]?.[ar?0:1]??kind).join(ar?' · ':' · ')
}
export function gameName(id:PresentationId|null,ar:boolean):string{
 const found=GAME_CHOICES.find(game=>game.id===id)
 return found?(ar?found.ar:found.en):(ar?'أي لعبة':'Any game')
}
