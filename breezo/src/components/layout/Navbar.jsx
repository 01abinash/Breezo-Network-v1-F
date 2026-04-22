import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>
        <img src="/logo2.png" alt="BREEZO" className={styles.logoImg} />
        BREEZO
      </Link>

      <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <li><Link to="/"          className={isActive('/')          ? styles.active : ''}>Home</Link></li>
        <li><Link to="/dashboard" className={isActive('/dashboard') ? styles.active : ''}>Dashboard</Link></li>
        <li><Link to="/network"   className={isActive('/network')   ? styles.active : ''}>Network</Link></li>
        <li><Link to="/about"     className={isActive('/about')     ? styles.active : ''}>About</Link></li>
      </ul>

      <div className={styles.right}>
        <button className={styles.ctaBtn} onClick={() => navigate('/dashboard')}>
          Live Dashboard
        </button>
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
