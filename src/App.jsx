import { Route, Routes, useLocation } from 'react-router'
import { MotionConfig, motion } from 'framer-motion'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import MoviesPage from './pages/MoviesPage.jsx'
import SeriesPage from './pages/SeriesPage.jsx'
import CastPage from './pages/CastPage.jsx'
import EntitiesPage from './pages/EntitiesPage.jsx'
import LabPage from './pages/LabPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  const { pathname } = useLocation()

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/cast" element={<CastPage />} />
            <Route path="/entities" element={<EntitiesPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.main>

        <Footer />
      </div>
    </MotionConfig>
  )
}

export default App
