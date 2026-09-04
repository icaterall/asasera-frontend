import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/context/ThemeProvider'
import Landing from '@/pages/Landing'

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
            {/*
              The landing page sits outside Layout: it ships its own nav and
              footer, and in a single light rendition with no language or
              theme toggle. Everything else keeps the shared shell.
            */}
            <Route index element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
