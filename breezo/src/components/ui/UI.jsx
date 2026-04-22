import styles from './UI.module.css'

export function Button({ variant = 'sky', children, onClick, className = '' }) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function Chip({ children }) {
  return <div className={styles.chip}><span className={styles.pulseDot} />{children}</div>
}

export function LivePill() {
  return <span className={styles.livePill}><span className={styles.pulseDot} />LIVE</span>
}

export function SectionLabel({ children }) {
  return <p className={styles.sectionLabel}>{children}</p>
}

export function SectionTitle({ children, center = false }) {
  return (
    <h2 className={`${styles.sectionTitle} ${center ? styles.center : ''}`}>
      {children}
    </h2>
  )
}

export function SectionSubtitle({ children, center = false }) {
  return (
    <p className={`${styles.sectionSub} ${center ? styles.center : ''}`}>
      {children}
    </p>
  )
}

export function RevealWrapper({ children, visible, className = '' }) {
  return (
    <div className={`${styles.reveal} ${visible ? styles.visible : ''} ${className}`}>
      {children}
    </div>
  )
}

export function MonoTag({ children, color = 'sky' }) {
  return <span className={`${styles.monoTag} ${styles[`tag_${color}`]}`}>{children}</span>
}

export function SolanaTag() {
  return <span className={styles.solanaBadge}>⬡ Built on Solana</span>
}
