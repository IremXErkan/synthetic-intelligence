import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Menu, X } from 'lucide-react'
import StatusBar from './StatusBar.jsx'

const NAV_LINKS = [
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/cast', label: 'Cast' },
  { to: '/entities', label: 'Entities' },
  { to: '/lab', label: 'Lab' },
  { to: '/about', label: 'About' },
]

// NavLink sets aria-current="page" on the active link automatically;
// the active style is a visible underline + color, not color alone.
const desktopLinkClass = ({ isActive }) =>
  `label-mono relative py-2 transition-colors ${
    isActive
      ? 'text-signal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-signal'
      : 'text-ink-muted hover:text-ink'
  }`

const mobileLinkClass = ({ isActive }) =>
  `label-mono block border-l-2 px-4 py-3 ${
    isActive ? 'border-signal bg-signal/10 text-signal' : 'border-transparent text-ink-muted hover:text-ink'
  }`

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-3" aria-label="Synthetic Intelligence — Command Center">
          <span
            aria-hidden="true"
            className="chamfer grid size-9 place-items-center bg-signal/15 font-mono text-sm font-medium text-signal transition-colors [--cut:8px] group-hover:bg-signal/25"
          >
            SI
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide text-ink">Synthetic Intelligence</span>
            <span className="label-mono block text-[0.625rem] text-ink-muted">Fictional AI Archive</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded p-2 text-ink-muted hover:text-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </nav>

      <StatusBar />

      {menuOpen && (
        <ul id="mobile-menu" className="border-t border-line bg-panel py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={mobileLinkClass} onClick={closeMenu}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

export default Navbar
