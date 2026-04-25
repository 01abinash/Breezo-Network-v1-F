import { Link } from 'react-router-dom'
import { SolanaTag } from '../ui/UI'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h3>BREEZO Network</h3>
          <p>Decentralized air quality infrastructure for the real world. Turning invisible air into visible truth.</p>
          <div className={styles.badgeRow}><SolanaTag /></div>
        </div>
        <div className={styles.col}>
          <h4>Network</h4>
          <ul>
            <li><Link to="/dashboard">Live Dashboard</Link></li>
            <li><Link to="/tokenization">Operator Login</Link></li>
            <li><a href="#">Data API</a></li>
            <li><a href="#">Node Registry</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Token</h4>
          <ul>
            <li><a href="#">$BREEZO Tokenomics</a></li>
            <li><a href="#">Reward Calculator</a></li>
            <li><a href="#">On-chain Explorer</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Community</h4>
          <ul>
            <li><a href="#">Discord</a></li>
            <li><a href="#">Twitter / X</a></li>
            <li><a href="#">Whitepaper</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2025 BREEZO Network. All rights reserved.</p>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
