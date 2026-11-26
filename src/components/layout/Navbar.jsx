import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import StatusBar from './StatusBar.jsx'

const NAV_LINKS = [
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/cast', label: 'Cast' },
  { to: '/entities', label: 'Entities' },
  { to: '/lab', label: 'Lab' },
  { to: '/network', label: 'Network' },
  { to: '/about', label: 'About' },
]

// Detail pages belong to a section, so the navbar still shows where you are.
const SECTION_PREFIXES = [
  ['/media/movie/', '/movies'],
  ['/media/tv/', '/series'],
  ['/person/', '/cast'],
  ['/entity/', '/entities'],
]

/**
 * 'page'    → this link is the current page (aria-current="page")
 * 'section' → a detail page inside this link's section (aria-current="true")
 * null      → not active
 */
function getLinkState(pathname, to) {
  if (pathname === to) return 'page'
  const section = SECTION_PREFIXES.find(([prefix]) => pathname.startsWith(prefix))?.[1]
  return section === to ? 'section' : null
}

// Active style is an underline + color (not color alone); same look for page and section.
const desktopLinkClass = (active) =>
  `label-mono relative py-2 transition-colors ${
    active
      ? 'text-signal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-signal'
      : 'text-ink-muted hover:text-ink'
  }`

const mobileLinkClass = (active) =>
  `label-mono block border-l-2 px-4 py-3 ${
    active ? 'border-signal bg-signal/10 text-signal' : 'border-transparent text-ink-muted hover:text-ink'
  }`

const ariaCurrent = (state) => (state === 'page' ? 'page' : state === 'section' ? 'true' : undefined)

function Navbar() {
  const { pathname } = useLocation()
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
        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const state = getLinkState(pathname, link.to)
            return (
              <li key={link.to}>
                <Link to={link.to} className={desktopLinkClass(state)} aria-current={ariaCurrent(state)}>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded p-2 text-ink-muted hover:text-ink lg:hidden"
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
        <ul id="mobile-menu" className="border-t border-line bg-panel py-2 lg:hidden">
          {NAV_LINKS.map((link) => {
            const state = getLinkState(pathname, link.to)
            return (
              <li key={link.to}>
                <Link to={link.to} className={mobileLinkClass(state)} aria-current={ariaCurrent(state)} onClick={closeMenu}>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </header>
  )
}

export default Navbar
