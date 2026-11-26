import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { MotionConfig, motion } from 'framer-motion'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import { SkeletonGrid } from './components/common/Skeleton.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Route-level code splitting: each page (and heavy libraries such as Recharts
// on /lab) is downloaded only when it is first visited. Home and 404 stay in
// the main bundle because they are the most common entry points.
const MoviesPage = lazy(() => import('./pages/MoviesPage.jsx'))
const SeriesPage = lazy(() => import('./pages/SeriesPage.jsx'))
const CastPage = lazy(() => import('./pages/CastPage.jsx'))
const EntitiesPage = lazy(() => import('./pages/EntitiesPage.jsx'))
const LabPage = lazy(() => import('./pages/LabPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const MediaDetailPage = lazy(() => import('./pages/MediaDetailPage.jsx'))
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage.jsx'))
const EntityDetailPage = lazy(() => import('./pages/EntityDetailPage.jsx'))

function PageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <SkeletonGrid count={5} label="Loading page" />
    </div>
  )
}

function App() {
  const { pathname } = useLocation()

  // New page → start at the top (filter changes keep the scroll position, since
  // they only change the query string, not the pathname).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    // reducedMotion="user": animations are skipped when the OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-signal focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        <Navbar />

        {/* Enter-only fade on route change (no exit animation, so no AnimatePresence needed). */}
        <motion.main
          id="main"
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/cast" element={<CastPage />} />
            <Route path="/entities" element={<EntitiesPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/media/:type/:id" element={<MediaDetailPage />} />
            <Route path="/person/:id" element={<PersonDetailPage />} />
            <Route path="/entity/:slug" element={<EntityDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </motion.main>

        <Footer />
      </div>
    </MotionConfig>
  )
}

export default App
