import 'i18next'

import type en from './locales/en'
import type { en as adminAi } from './locales/adminAi'

/**
 * Makes `t()` autocomplete every key and reject the ones that do not exist.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
      adminAi: typeof adminAi
    }
  }
}
