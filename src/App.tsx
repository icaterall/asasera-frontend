import { Suspense, lazy } from 'react'
import { LoadingState } from '@/design/LoadingState'
import { loadingVariantForPath } from '@/design/loadingVariant'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { KeepQueryRedirect } from '@/components/KeepQueryRedirect'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { TeacherLayout } from '@/components/teacher/TeacherLayout'
import { RequireTeacher } from '@/components/teacher/RequireTeacher'
import { SignupProvider } from '@/context/SignupProvider'
import { Layout } from '@/components/layout/Layout'
import { AuthProvider } from '@/context/AuthProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import Landing from '@/pages/Landing'
import { useAuth } from '@/hooks/useAuth'
import { homePathFor } from '@/lib/afterAuth'
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout'))
const AdminUsers = lazy(() => import('@/features/admin/AdminUsers'))
const AdminUserDetail = lazy(() => import('@/features/admin/AdminUserDetail'))
const StudentLayout = lazy(() => import('@/features/student/StudentLayout'))
const StudentHome = lazy(() => import('@/features/student/StudentPages').then(m => ({ default: m.StudentHome })))
const StudentActivities = lazy(() => import('@/features/student/StudentPages').then(m => ({ default: m.StudentActivities })))
const StudentProgress = lazy(() => import('@/features/student/StudentPages').then(m => ({ default: m.StudentProgress })))
const StudentProfile = lazy(() => import('@/features/student/StudentPages').then(m => ({ default: m.StudentProfile })))
const StudentPractice = lazy(() => import('@/features/student/StudentPages').then(m => ({ default: m.StudentPractice })))

// The landing page is the common entry point, so it stays in the main
// chunk; everything else is split out.
/*
 * The v4 design gallery — W02's acceptance surface (§16 p25).
 *
 * Development only, and gated on `import.meta.env.DEV` rather than on a route
 * guard: a guard still ships the chunk, and Rollup drops this branch entirely
 * when the constant folds to false. Verified by grepping the production bundle
 * for the gallery marker — see scripts/assert-build.mjs.
 */
const Gallery = import.meta.env.DEV ? lazy(() => import('@/design/gallery/Gallery')) : null

const AccountPage = lazy(() => import('@/features/account/AccountPage'))
const ContactPage = lazy(() => import('@/features/support/ContactPage'))
const SharedActivity = lazy(() => import('@/features/community/SharedActivity'))
const FeedbackInbox = lazy(() => import('@/features/community/FeedbackInbox'))
const About = lazy(() => import('@/pages/About'))
const ChooseRole = lazy(() => import('@/pages/auth/ChooseRole'))
/*
 * One route, two screens: teachers are asked for a workplace, students for a
 * study level. FirstStep picks by `:role` — see the note there.
 */
const FirstStep = lazy(() => import('@/pages/signup/FirstStep'))
const MethodStep = lazy(() => import('@/pages/signup/MethodStep'))
const PasswordStep = lazy(() => import('@/pages/signup/PasswordStep'))
const CheckEmail = lazy(() => import('@/pages/signup/CheckEmail'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Forgot = lazy(() => import('@/pages/auth/Forgot'))
const Reset = lazy(() => import('@/pages/auth/Reset'))
const CompleteProfile = lazy(() => import('@/pages/auth/CompleteProfile'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
/* The signed-in workspace. Split out: a signed-out visitor reading the landing
   page never downloads the dashboard, its illustrations, or its guide prose. */
const TeacherDashboard = lazy(() => import('@/pages/teacher/Dashboard'))
const TeacherGuides = lazy(() => import('@/pages/teacher/Guides'))
const TeacherCourses = lazy(() => import('@/pages/teacher/Courses'))
const TeacherMaterials = lazy(() => import('@/pages/teacher/Materials'))
const TeacherLessons = lazy(() => import('@/pages/teacher/Lessons'))
const NewLesson = lazy(() => import('@/pages/teacher/NewLesson'))
/* Activity authoring (app-plan v4 §12). Split out: the editor pulls in the
   whole design layer and is never on a signed-out visitor's path. */
const ActivityList = lazy(() => import('@/features/editor/ActivityList'))
const ActivityEditor = lazy(() => import('@/features/editor/ActivityEditor'))
const DeliverySetup=lazy(()=>import('@/features/delivery/DeliverySetup'))
const LearnPage=lazy(()=>import('@/features/delivery/LearnPage'))
const Assignments=lazy(()=>import('@/features/delivery/Assignments'))
const SessionPage = lazy(() => import('@/features/session/SessionPage'))
const GamesPage=lazy(()=>import('@/features/games/GamesPage'))
const WheelPage=lazy(()=>import('@/features/wheel/WheelPage'))
const Shelf = lazy(() => import('@/features/shelf/Shelf'))
const TeacherHome = lazy(() => import('@/features/teacher-home/TeacherHome'))
const CreateActivity = lazy(() => import('@/features/editor/CreateActivity'))
const VerificationLinks=lazy(()=>import('./features/reports/VerificationLinks'))
const Reports = lazy(() => import('@/features/reports/Reports'))
const LessonEditor = lazy(() => import('@/pages/teacher/LessonEditor'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function RouteFallback() {
  const { pathname } = useLocation()
  return <LoadingState layout="page" variant={loadingVariantForPath(pathname)} />
}

function HomeEntry() {
  const {status, user} = useAuth()
  const {hash} = useLocation()
  if (status === 'loading') return <RouteFallback />
  return user && !hash ? <Navigate to={homePathFor(user)} replace /> : <Landing />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/*
          Inside the router, because the session-lost handler it registers
          with the api module calls `navigate` — a hook that has to be under a
          Router. Outside Layout's routes, because every route including the
          landing page needs to know whether someone is signed in, and because
          the boot refresh must run once per page load rather than once per
          route.
        */}
        <AuthProvider>
          <SignupProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="admin" element={<AdminLayout/>}>
                <Route index element={<Navigate to="/admin/users" replace/>}/>
                <Route path="users" element={<AdminUsers/>}/>
                <Route path="users/:id" element={<AdminUserDetail/>}/>
              </Route>
              <Route path="student" element={<StudentLayout />}>
                <Route index element={<StudentHome />} />
                <Route path="activities" element={<StudentActivities />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="practice" element={<StudentPractice />} />
              </Route>
              <Route path="games" element={<GamesPage/>}/>
              <Route path="learn/:id" element={<LearnPage/>}/>
              <Route path="join" element={<SessionPage role="player" />} />
              <Route path="projector/:id" element={<SessionPage role="projector" />} />
              <Route path="teacher/live/:id" element={<RequireTeacher><SessionPage role="host" /></RequireTeacher>} />
              {/*
                Every route shares one shell.

                The landing page used to sit outside Layout with its own nav and
                footer, which meant two navigations, two footers and two token
                systems in one app — and a visitor moving from the landing page
                to sign-in crossed a visible seam. It is inside now, so the
                header, the ambient gradient and the footer are literally the
                same components everywhere.
              */}
              {Gallery && (
                <Route path="__design" element={<Gallery />} />
              )}
              <Route element={<Layout />}>
                <Route index element={<HomeEntry />} />
                <Route path="about" element={<About />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="activities/:id" element={<SharedActivity />} />

                {/*
                  THE ROLE IS THE ROUTE.

                  These two paths are the only thing that decides whether an
                  account is a teacher or a student. Each posts to its own
                  endpoint, neither sends a `role` field, and there is no role
                  selector anywhere in the UI — a control that picks a
                  privilege is a control an attacker picks for themselves.
                */}
                {/* Kept mounted: existing deep links and password recovery. */}
                <Route path="complete-profile" element={<CompleteProfile />} />

                {/*
                  /auth/callback is where the backend sends people at the end of
                  BOTH federated flows. It must stay a real SPA route: the
                  backend redirects a browser here, and a 404 at this path turns
                  a successful sign-in into an apparent failure.
                */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/*
                The authentication shell: no marketing navigation, one task per
                screen. A person half-way through creating an account should not
                be offered Pricing.

                `/register` is the role choice (`/signup` remains an alias); `/signup/teacher` and
                `/signup/student` preselect it via a direct link. The old
                `/register/*` paths are kept as redirects rather than deleted —
                they are in the wild, and a 404 mid-signup is worse than a hop.
              */}
              <Route element={<AuthLayout />}>
                <Route path="register" element={<ChooseRole />} />
                <Route path="signup" element={<ChooseRole />} />

                {/*
                  The signup chain. `:role` is the only thing that decides
                  which register endpoint the last step calls, so the role
                  still comes from the URL and never from a form field.
                */}
                <Route path="signup/:role" element={<FirstStep />} />
                <Route path="signup/:role/method" element={<MethodStep />} />
                <Route path="signup/:role/password" element={<PasswordStep />} />
                <Route path="signup/:role/check-email" element={<CheckEmail />} />
                <Route path="login" element={<Login />} />
                <Route path="forgot" element={<Forgot />} />
                <Route path="reset" element={<Reset />} />
                {/*
                  Where the emailed link lands. It had no route at all, so
                  every verification link fell through to the 404 page — see
                  the note in VerifyEmail.tsx.
                */}
                <Route path="verify-email" element={<VerifyEmail />} />
                <Route path="auth/callback" element={<AuthCallback />} />
              </Route>

              {/*
                THE SIGNED-IN TEACHER WORKSPACE.

                Its own shell, not Layout: the marketing header, the ambient
                gradient and the footer belong to the public site, and a
                workspace needs a rail and a compact application header
                instead. TeacherLayout is what enforces the route — signed
                out goes to /login carrying where they were headed, and a
                student goes to the landing page.

                `/teacher` redirects rather than rendering, so the canonical
                URL is one string everywhere: /teacher/dashboard.
              */}
              <Route path="teacher" element={<TeacherLayout />}>
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherHome />} />
                <Route path="tools" element={<TeacherDashboard />} />
                <Route path="wheel" element={<WheelPage/>}/>
                <Route path="guides" element={<TeacherGuides />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="materials" element={<TeacherMaterials />} />
                {/* `new` before `:id`, so the literal wins the match. */}
                <Route path="lessons" element={<TeacherLessons />} />
                <Route path="lessons/new" element={<NewLesson />} />
                <Route path="activities" element={<ActivityList />} />
                <Route path="activities/new" element={<CreateActivity />} />
                <Route path="activities/:id/play" element={<DeliverySetup/>}/>
                <Route path="assignments" element={<Assignments/>}/>
                <Route path="shelf" element={<Navigate to="/teacher/discover" replace />} />
                <Route path="discover" element={<Shelf />} />
                <Route path="feedback" element={<FeedbackInbox />} />
                <Route path="verification" element={<VerificationLinks/>}/>
                <Route path="reports" element={<Reports />} />
                <Route path="reports/runs/:id" element={<Reports />} />
                <Route path="reports/authors/:id" element={<Reports author />} />
              </Route>

              {/*
                The editor is OUTSIDE TeacherLayout, deliberately.
                It owns the whole viewport: a 232px application sidebar sitting
                beside a 184px activity rail would spend a fifth of a laptop
                screen on two navigation columns, and the canvas is the only
                region whose content is the teacher's actual work. The toolbar
                carries an explicit way back to the library instead.
              */}
              {/* The editor is full-viewport: it owns the whole screen, so it
                  sits outside TeacherLayout rather than inside its chrome. §5
                  is explicit that no dashboard sidebar consumes an authoring
                  or presentation surface. */}
              <Route
                path="teacher/activities/:id"
                element={
                  <RequireTeacher>
                    <ActivityEditor />
                  </RequireTeacher>
                }
              />
              <Route
                path="teacher/lessons/:id"
                element={
                  <RequireTeacher>
                    <LessonEditor />
                  </RequireTeacher>
                }
              />

              {/* Preserved deep links. */}
              <Route path="register/teacher" element={<Navigate to="/signup/teacher" replace />} />
              <Route path="register/student" element={<Navigate to="/signup/student" replace />} />

              {/*
                COMPATIBILITY, FOR LINKS ALREADY IN INBOXES.

                Reset emails pointed at `/reset-password` while the app has
                only ever routed `/reset`, so every one of them 404'd. The
                builder is fixed, but a reset link lives for 30 minutes and
                some are still out there — and a person holding one has just
                been locked out, which is the worst moment to be handed a
                dead page.

                It must carry the query: the token IS the link, and a bare
                Navigate would drop it and land them on a form that says their
                link is incomplete. That reads as "expired", which is worse
                than the 404 because it sounds like their fault.
              */}
              <Route path="reset-password" element={<KeepQueryRedirect to="/reset" />} />
            </Routes>
          </Suspense>
          </SignupProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
