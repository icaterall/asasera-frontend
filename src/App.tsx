import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/context/ThemeProvider'
import Landing from '@/pages/Landing'

// The landing page is the common entry point, so it stays in the main
// chunk; everything else is split out.
const About = lazy(() => import('@/pages/About'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
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
              Every route shares one shell.
              
              The landing page used to sit outside Layout with its own nav and
              footer, which meant two navigations, two footers and two token
              systems in one app — and a visitor moving from the landing page
              to sign-in crossed a visible seam. It is inside now, so the
              header, the ambient gradient and the footer are literally the
              same components everywhere.
            */}
            <Route element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="about" element={<About />} />
              {/*
                The nav has linked to /login since the landing page shipped;
                until now it fell through to the 404. Both routes are inside
                Layout so a half-finished sign-in still has the nav, the
                language toggle and a way out.

                /auth/callback is where the backend sends people at the end of
                BOTH federated flows. It must stay a real SPA route: the
                backend redirects a browser here, and a 404 at this path turns
                a successful sign-in into an apparent failure.
              */}
              <Route path="login" element={<SignIn />} />
              <Route path="auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
