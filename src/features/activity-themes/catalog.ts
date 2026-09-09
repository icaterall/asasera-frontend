export type ActivityThemeId = 'classic' | 'jungle' | 'sky' | 'island' | 'ocean' | 'desert' | 'space' | 'aurora' | 'volcano' | 'candy' | 'arctic' | 'castle' | 'garden'
export type Ambience = 'none' | 'motes' | 'clouds' | 'bubbles' | 'stars' | 'snow' | 'embers'
export type ActivityTheme = { id: ActivityThemeId; en: string; ar: string; color: string; ambience: Ambience; accent: string; description: { en: string; ar: string } }
export const activityThemes: ActivityTheme[] = [
  { id:'classic', en:'Asasera Classic', ar:'أساسيرا الكلاسيكي', color:'#004ccc', ambience:'none', accent:'#ffcf36', description:{en:'The familiar blue stage. Clear, focused and ready to play.',ar:'المسرح الأزرق المألوف. واضح وجاهز للعب.'} },
  { id:'jungle', en:'Jungle', ar:'الغابة', color:'#123c2c', ambience:'motes', accent:'#dcf5a0', description:{en:'Step into a lush canopy of leaves, sunlight and hidden waterfalls.',ar:'ادخل عالمًا من الأوراق الوارفة وضوء الشمس والشلالات الخفية.'} },
  { id:'sky', en:'Sky Islands', ar:'جزر السماء', color:'#214e7a', ambience:'clouds', accent:'#dbf4ff', description:{en:'Take learning above the clouds, between floating islands.',ar:'حلّق بالتعلّم فوق السحب وبين الجزر العائمة.'} },
  { id:'island', en:'Tropical Island', ar:'الجزيرة الاستوائية', color:'#124750', ambience:'motes', accent:'#ffe5a7', description:{en:'A turquoise lagoon, palm-lined shores and a little adventure.',ar:'بحيرة فيروزية وشواطئ النخيل وقليل من المغامرة.'} },
  { id:'ocean', en:'Coral Ocean', ar:'عالم المحيط', color:'#063951', ambience:'bubbles', accent:'#a1f5f0', description:{en:'Dive into coral gardens and gentle underwater light.',ar:'اغص بين حدائق المرجان والضوء الهادئ تحت الماء.'} },
  { id:'desert', en:'Golden Desert', ar:'الصحراء الذهبية', color:'#624125', ambience:'motes', accent:'#ffdea0', description:{en:'Explore golden dunes and sandstone arches at sunset.',ar:'استكشف الكثبان الذهبية والأقواس الصخرية عند الغروب.'} },
  { id:'space', en:'Deep Space', ar:'أعماق الفضاء', color:'#121e49', ambience:'stars', accent:'#c4d4ff', description:{en:'A moonlit launch into planets, stars and new discoveries.',ar:'انطلق بين الكواكب والنجوم نحو اكتشافات جديدة.'} },
  { id:'aurora', en:'Northern Lights', ar:'الشفق القطبي', color:'#102f3d', ambience:'snow', accent:'#acffdf', description:{en:'A quiet frozen lake beneath a sky of dancing light.',ar:'بحيرة متجمّدة هادئة تحت سماء ترقص فيها الأضواء.'} },
  { id:'volcano', en:'Volcano Valley', ar:'وادي البراكين', color:'#402b40', ambience:'embers', accent:'#ffd1a4', description:{en:'Glowing lava and a dramatic twilight adventure.',ar:'حمم متوهّجة ومغامرة مدهشة وقت الشفق.'} },
  { id:'candy', en:'Candy Valley', ar:'وادي الحلوى', color:'#613653', ambience:'motes', accent:'#ffe0f0', description:{en:'A colorful world of sweet hills and playful paths.',ar:'عالم ملوّن من تلال الحلوى والدروب المرحة.'} },
  { id:'arctic', en:'Arctic Adventure', ar:'المغامرة القطبية', color:'#254959', ambience:'snow', accent:'#dcfaff', description:{en:'Crisp blue ice, snowy peaks and wide-open possibilities.',ar:'جليد أزرق وقمم ثلجية وآفاق واسعة للاكتشاف.'} },
  { id:'castle', en:'Castle Quest', ar:'مغامرة القلعة', color:'#314b37', ambience:'motes', accent:'#ffe8ad', description:{en:'Follow a winding path into your next storybook challenge.',ar:'اتبع الدرب المتعرّج نحو تحدّيك التالي في عالم الحكايات.'} },
  { id:'garden', en:'Secret Garden', ar:'الحديقة السرية', color:'#2a482d', ambience:'motes', accent:'#fff2b2', description:{en:'Find big discoveries among flowers, ferns and morning light.',ar:'اكتشف أشياء كبيرة بين الأزهار والسراخس وضوء الصباح.'} },
]
const aliases: Record<string, ActivityThemeId> = { forest:'jungle', cosmic:'space', coral:'ocean' }
export function getActivityTheme(value?: string | null): ActivityTheme {
  return activityThemes.find(theme => theme.id === (aliases[value ?? ''] ?? value)) ?? activityThemes[0]!
}
const assets = import.meta.glob<string>('../../assets/images/activity-themes/*.webp', { eager:true, query:'?url', import:'default' })
export function themeImage(value: string, size: 'hd'|'mobile'|'thumb' = 'hd'): string | undefined {
  const id = getActivityTheme(value).id
  return assets[`../../assets/images/activity-themes/${id}-${size}.webp`]
}
