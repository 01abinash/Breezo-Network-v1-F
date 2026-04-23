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

  function handleLogout() {
    clearTokenSession()
    setProfileOpen(false)
    navigate('/tokenization')
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>
        <img src="/logo2.png" alt="BREEZO" className={styles.logoImg} />
        BREEZO
      </Link>

      <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <li><Link to="/"          className={isActive('/')          ? styles.active : ''}>Home</Link></li>
        <li><Link to="/dashboard" className={isActive('/dashboard') ? styles.active : ''}>Dashboard</Link></li>
        {/* <li><Link to="/tokenization" className={isActive('/tokenization') ? styles.active : ''}>Tokenization</Link></li> */}
        <li><Link to="/network"   className={isActive('/network')   ? styles.active : ''}>Network</Link></li>
        <li><Link to="/about"     className={isActive('/about')     ? styles.active : ''}>About</Link></li>
      </ul>

      <div className={styles.right}>
        <button className={styles.waitlistBtn} onClick={() => navigate('/waitlist')}>
          Join Waitlist
        </button>
        {/* {session ? (
          <div className={styles.profileWrap} ref={profileRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setProfileOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              type="button"
            >
              <span className={styles.profileName}>{session.ownerName}</span>
              <span className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`}>▾</span>
            </button>

            {profileOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownMeta}>
                  <span className={styles.dropdownName}>{session.ownerName}</span>
                  <span className={styles.dropdownSub}>{session.deviceId}</span>
                </div>
                <button className={styles.dropdownItem} onClick={() => navigate('/tokenization')} type="button" role="menuitem">
                  Open dashboard
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout} type="button" role="menuitem">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.ctaBtn} onClick={() => navigate('/tokenization')}>
            Login
          </button>
        )} */}
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
