import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { RevealWrapper, SectionLabel, SectionTitle, SolanaTag } from '../ui/UI'
import styles from './VisionCTA.module.css'

const VISION_CARDS = [
  {
    icon: '🌐',
    title: 'Anyone can deploy a node',
    desc: 'Low-cost hardware, simple setup. No permission, no gatekeepers.',
    highlight: false,
  },
  {
    icon: '📊',
    title: 'Everyone can access insights',
    desc: 'Open data layer. Public API. Real-time dashboards for citizens and policymakers.',
    highlight: true,
  },
  {
    icon: '💸',
    title: 'Contributors are directly rewarded',
    desc: '$BREEZ tokens for every byte of valid, high-quality data contributed.',
    highlight: false,
  },
]

export function VisionSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className={styles.visionSection}>
      <RevealWrapper visible={visible}>
        <div ref={ref} className={styles.visionInner}>
          <SectionLabel>Vision</SectionLabel>
          <SectionTitle center>
            Environmental data should be<br />real-time, hyperlocal, and open.
          </SectionTitle>

          <div className={styles.visionGrid}>
            {VISION_CARDS.map((card) => (
              <div
                className={`${styles.visionCard} ${card.highlight ? styles.highlighted : ''}`}
                key={card.title}
              >
                <span className={styles.visionIcon}>{card.icon}</span>
                <h3 className={styles.visionTitle}>{card.title}</h3>
                <p className={styles.visionDesc}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealWrapper>
    </section>
  )
}

export function HomeCTA() {
  const navigate = useNavigate()
  const { ref, visible } = useScrollReveal()

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaBg} />
      <RevealWrapper visible={visible}>
        <div ref={ref} className={styles.ctaInner}>
          <SectionLabel>Join the Network</SectionLabel>
          <h2 className={styles.ctaTitle}>Ready to become a<br />BREEZO node operator?</h2>
          <p className={styles.ctaDesc}>
            Deploy a sensor, earn $BREEZ, and help build the world's most comprehensive real-time
            air quality network — starting in South Asia.
          </p>
          <div className={styles.ctaBtns}>
            <button className={styles.btnSky} onClick={() => navigate('/dashboard')}>
              View Live Data
            </button>
            <button className={styles.btnGhost}>
              Deploy a Node →
            </button>
          </div>
          <div className={styles.solanaRow}><SolanaTag /></div>
        </div>
      </RevealWrapper>
    </section>
  )
}
