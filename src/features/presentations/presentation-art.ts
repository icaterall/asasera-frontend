/*
 * THE GAMES' FACE, IN ONE PLACE.
 *
 * The launch picker and the create form offer the same games, so they draw
 * them from the same artwork, the same one-line purpose and the same accent
 * tone. Two screens that describe one product must not disagree about what a
 * game is called, what it looks like, or what colour it wears.
 */
import questionsInOrderArt from '@/assets/images/presentation-modes/questions-in-order.webp'
import flashcardsArt from '@/assets/images/presentation-modes/flashcards.webp'
import questionWheelArt from '@/assets/images/presentation-modes/question-wheel.webp'
import randomCardsArt from '@/assets/images/presentation-modes/random-cards.webp'
import openBoxArt from '@/assets/images/presentation-modes/open-box.webp'
import challengeCardsArt from '@/assets/images/presentation-modes/challenge-cards.webp'
import classCompetitionArt from '@/assets/images/presentation-modes/class-competition.webp'
import matchUpArt from '@/assets/images/presentation-modes/match-up.webp'
import memoryArt from '@/assets/images/presentation-modes/memory.webp'
import groupSortArt from '@/assets/images/presentation-modes/group-sort.webp'
import sequenceArt from '@/assets/images/presentation-modes/sequence.webp'
import sentenceCompletionArt from '@/assets/images/presentation-modes/sentence-completion.webp'

export const presentationPurpose:Record<string,[string,string]>={
 flashcards:['استرجاع الإجابة ثم تقييم التذكّر.','Recall an answer, then rate your memory.'],
 'question-wheel':['اختر سؤالًا عشوائيًا دون تكرار.','Spin to choose a question without repeats.'],
 'random-cards':['اسحب سؤالًا من مجموعة البطاقات.','Draw and answer a card from the deck.'],
 'open-box':['افتح صندوقًا لعرض سؤاله كاملًا.','Open a numbered box to reveal its question.'],
 'challenge-cards':['قدّم تحديات مع تلميحات معتمدة.','Present challenges with reviewed support.'],
 'class-competition':['تنافس بقواعد معلنة ودرجات مستقلة.','Compete with disclosed rules and separate marks.'],
 'match-up':['صل كل عنصر بما يناسبه.','Connect each item with its matching meaning.'],
 memory:['اكشف البطاقات وتذكّر مواقع الأزواج.','Reveal cards and remember matching pairs.'],
 'group-sort':['ضع العناصر في مجموعاتها المناسبة.','Place items in their reviewed groups.'],
 sequence:['رتّب الخطوات أو العبارات.','Put steps or phrases in the right order.'],
 'sentence-completion':['أكمل فراغات النص بالإجابة المناسبة.','Fill a passage’s blanks with accepted answers.'],
 'word-builder':['كوّن الكلمة من حروفها.','Build a word from its letter tiles.'],
 'word-search':['اعثر على الكلمات في اللوحة المحفوظة.','Find words in the saved letter grid.'],
 crossword:['حل التلميحات المتقاطعة.','Solve clues in the reviewed crossword.'],
}

export const presentationArtwork:Record<string,string>={
 quiz:questionsInOrderArt,flashcards:flashcardsArt,'question-wheel':questionWheelArt,'random-cards':randomCardsArt,
 'open-box':openBoxArt,'challenge-cards':challengeCardsArt,
 'class-competition':classCompetitionArt,'match-up':matchUpArt,memory:memoryArt,'group-sort':groupSortArt,
 sequence:sequenceArt,'sentence-completion':sentenceCompletionArt,
}

export const presentationTones:Record<string,string>={quiz:'blue',flashcards:'teal','question-wheel':'amber','random-cards':'coral','open-box':'violet','challenge-cards':'coral','class-competition':'amber','match-up':'teal',memory:'coral','group-sort':'blue',sequence:'violet','sentence-completion':'teal','word-builder':'amber','word-search':'blue',crossword:'violet'}
