import reef from '@/assets/images/landing-quiz/reef.webp'
import bee from '@/assets/images/landing-quiz/bee.webp'
import space from '@/assets/images/landing-quiz/space.webp'
import desert from '@/assets/images/landing-quiz/desert.webp'
import balloon from '@/assets/images/landing-quiz/balloon.webp'
import waterfall from '@/assets/images/landing-quiz/waterfall.webp'
import bicycle from '@/assets/images/landing-quiz/bicycle.webp'
import seedling from '@/assets/images/landing-quiz/seedling.webp'
import type { DemoMediaId } from './demo-question-bank'

type QuizPhoto = { src: string; en: string; ar: string }
export const demoMedia: Record<DemoMediaId, QuizPhoto> = {
  reef: { src: reef, en: 'A sea turtle swimming above a colorful coral reef', ar: 'سلحفاة بحرية تسبح فوق شعاب مرجانية ملوّنة' },
  bee: { src: bee, en: 'A honeybee collecting pollen on a sunflower', ar: 'نحلة عسل تجمع حبوب اللقاح على زهرة دوّار الشمس' },
  space: { src: space, en: 'A ringed planet against a starry background', ar: 'كوكب تحيط به حلقات أمام خلفية من النجوم' },
  desert: { src: desert, en: 'A camel walking across golden desert dunes', ar: 'جمل يمشي عبر كثبان صحراوية ذهبية' },
  balloon: { src: balloon, en: 'A colorful hot-air balloon above a mountain valley', ar: 'منطاد هواء ساخن ملوّن فوق وادٍ جبلي' },
  waterfall: { src: waterfall, en: 'A waterfall surrounded by green plants flowing into a turquoise pool', ar: 'شلال تحيط به نباتات خضراء ويتدفّق إلى بركة فيروزية' },
  bicycle: { src: bicycle, en: 'A blue bicycle standing beside a leafy park path', ar: 'دراجة زرقاء بجانب ممر في حديقة خضراء' },
  seedling: { src: seedling, en: 'A small seedling with a dew drop growing in dark soil', ar: 'نبتة صغيرة عليها قطرة ندى تنمو في تربة داكنة' },
}
