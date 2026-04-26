import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { RevealWrapper, SectionLabel, SectionTitle, SolanaTag } from '../ui/UI'
import styles from './VisionCTA.module.css'

const VISION_CARDS = [
  {
    icon: 'Grid',
    title: 'Real devices in real cities',
    desc: 'BREEZO grows city by city through live AQI hardware deployments, not generic public feeds.',
    highlight: true,
  },
  {
    icon: 'Data',
    title: 'Everyone can access insights',
    desc: 'Device-backed dashboards bring street-level air quality visibility to communities and policymakers.',
    highlight: true,
  },
  {
    icon: 'Token',
    title: 'Contributors are directly rewarded',
    desc: '$BREEZO tokens reward every valid, high-quality device contribution.',
    highlight: true,
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
            Environmental data should be
            <br />
            real-time, hyperlocal, and open.
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
          <h2 className={styles.ctaTitle}>
            Want early access to
            <br />
            BREEZO launches?
          </h2>
          <p className={styles.ctaDesc}>
            Access the private operator area to review device-linked reward flow, settlement history,
            and tokenization metrics.
          </p>
          <div className={styles.ctaBtns}>
            <button className={styles.btnSky} onClick={() => navigate('/dashboard')}>
              View Live Data
            </button>
            <button className={styles.btnGhost} onClick={() => navigate('/tokenization')}>
               Login {'->'}
            </button>
          </div>
          {/* <div className={styles.solanaRow}><SolanaTag /></div> */}
        </div>
      </RevealWrapper>
    </section>
  )
}
