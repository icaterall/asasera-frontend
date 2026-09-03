import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/context/ThemeProvider'
import Home from '@/pages/Home'

// The landing page is the common entry point, so it stays in the main
// chunk; everything else is split out.
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function RouteFallback() {
  return (
    <div className="grid min-h-svh place-items-center" role="status" aria-live="polite">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
