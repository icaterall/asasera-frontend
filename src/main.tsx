import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Imported first: it sets `<html lang>` / `<html dir>` before React paints.
import '@/i18n'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@fontsource/montserrat/latin-900.css'
import '@/index.css'

import App from '@/App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:true}}})

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
  </StrictMode>,
)
