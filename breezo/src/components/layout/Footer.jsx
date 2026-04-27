import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h3>BREEZO Network</h3>
          <p>Decentralized air quality infrastructure for the real world. Turning invisible air into visible truth.</p>
        </div>

        <div className={styles.col}>
          <h4>Product</h4>
          <ul>
            <li><Link to="/dashboard">Live Dashboard</Link></li>
            <li><Link to="/map">Map</Link></li>
            <li><Link to="/docs">API Docs</Link></li>
            <li><Link to="/product">AQI Devices</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Operator</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/tokenization">Token Dashboard</Link></li>
            <li><Link to="/api-keys">API Keys</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">AQI Dashboard</Link></li>
            <li><Link to="/map">Network Map</Link></li>
            <li><Link to="/docs">Developer Docs</Link></li>
            <li><Link to="/product">Product</Link></li>
            <li><a href="https://twitter.com/breezonetwork" target="_blank" rel="noreferrer">Twitter / X</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2025 BREEZO Network. All rights reserved.</p>
      </div>
    </footer>
  )
}
