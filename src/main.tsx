import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Imported first: it sets `<html lang>` / `<html dir>` before React paints.
import '@/i18n'
import '@/index.css'

import App from '@/App'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
