import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearTokenSession, readTokenSession, TOKEN_SESSION_EVENT } from '../../lib/tokenization'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [session, setSession] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const profileRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  useEffect(() => {
    const syncSession = () => setSession(readTokenSession())
    const onSessionChange = (event) => setSession(event.detail ?? null)
    const onStorage = (event) => {
      if (event.key === null || event.key === 'breezo-token-session') {
        syncSession()
      }
    }
    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    syncSession()
    window.addEventListener(TOKEN_SESSION_EVENT, onSessionChange)
    window.addEventListener('storage', onStorage)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener(TOKEN_SESSION_EVENT, onSessionChange)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  const isActive = (path) => location.pathname === path
  const profileLabel = String(session?.ownerName || session?.ownerEmail || 'Profile').trim()

  function handleLogout() {
    clearTokenSession()
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>
        <img src="/logo2.png" alt="BREEZO" className={styles.logoImg} />
        BREEZO NETWORK
      </Link>

      <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <li><Link to="/"          className={isActive('/')          ? styles.active : ''}>Home</Link></li>
        <li><Link to="/dashboard" className={isActive('/dashboard') ? styles.active : ''}>Dashboard</Link></li>
        <li><Link to="/map"       className={isActive('/map')       ? styles.active : ''}>Map</Link></li>
        <li><Link to="/docs"      className={isActive('/docs')      ? styles.active : ''}>Docs</Link></li>
        <li><Link to="/product"   className={isActive('/product') || isActive('/network') ? styles.active : ''}>Product</Link></li>
        <li><Link to="/about"     className={isActive('/about')     ? styles.active : ''}>About</Link></li>
        <li><Link to="/contact"   className={isActive('/contact')   ? styles.active : ''}>Contact Us</Link></li>
      </ul>

      <div className={styles.right}>
        {session ? (
          <div className={styles.profileWrap} ref={profileRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setProfileOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              type="button"
            >
              <span className={styles.profileName}>{profileLabel}</span>
              <span className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`}>▾</span>
            </button>

            {profileOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownMeta}>
                  <span className={styles.dropdownName}>{profileLabel}</span>
                  <span className={styles.dropdownSub}>{session.ownerEmail}</span>
                </div>
                <button className={styles.dropdownItem} onClick={() => navigate('/tokenization')} type="button" role="menuitem">
                  Open dashboard
                </button>
                <button className={styles.dropdownItem} onClick={() => navigate('/api-keys')} type="button" role="menuitem">
                  API keys
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout} type="button" role="menuitem">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.ctaBtn} onClick={() => navigate('/login')}>
            Login
          </button>
        )}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
