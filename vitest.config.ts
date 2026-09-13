import {defineConfig} from 'vitest/config'
import {fileURLToPath} from 'node:url'

export default defineConfig({
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  test:{environment:'jsdom',/* .spec.* is vitest; .test.ts is node:test and runs under `npm run test:unit`.
       Before this split, seven files matched neither runner and never ran. */
    include:['tests/**/*.spec.tsx','tests/**/*.spec.ts'],setupFiles:['./tests/setup.ts'],restoreMocks:true},
})
