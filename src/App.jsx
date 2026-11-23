import { NavLink, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Temporary setup shell: verifies Tailwind and client-side routing.
// Replaced by the real Navbar / PageShell layout on day 2.
const linkClass = ({ isActive }) =>
  `font-mono text-sm uppercase tracking-widest ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="flex gap-6 border-b border-slate-800 px-6 py-4">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
      </nav>
      <main className="px-6 py-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
