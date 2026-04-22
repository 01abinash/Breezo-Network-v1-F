import { useScrollReveal } from '../../hooks/useScrollReveal'
import { RevealWrapper, SectionLabel, SectionTitle, SectionSubtitle } from '../ui/UI'
import styles from './HowItWorks.module.css'

const STEPS = [
  {
    num: '01',
    icon: '📡',
    title: 'Deploy & Monitor',
    desc: 'Install precision multi-parameter sensor nodes across urban areas. Each node measures PM2.5, PM10, CO₂, NO₂, temperature, humidity, and atmospheric pressure — continuously, in real time.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Transmit & Process',
    desc: 'Data streams from every node via WiFi/4G to our cloud pipeline. Aggregated, validated, and structured with sub-minute latency. Accessible via dashboard and REST API.',
  },
  {
    num: '03',
    icon: '🧠',
    title: 'Analyze & Predict',
    desc: 'AI models analyze historical patterns with weather data to deliver 7-day AQI forecasts. Proactive health planning instead of reactive emergency response.',
  },
  {
    num: '04',
    icon: '🪙',
    title: 'Earn & Expand',
    desc: 'Node operators earn $BREEZ tokens on Solana based on uptime, data consistency, and coverage quality. Economic incentives drive rapid, community-owned network expansion.',
  },
]

export default function HowItWorks() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className={styles.section}>
      <div ref={ref}>
        <RevealWrapper visible={visible}>
          <div className={styles.header}>
            <SectionLabel>How It Works</SectionLabel>
            <SectionTitle>Four layers, one network.</SectionTitle>
            <SectionSubtitle>
              From hardware on a rooftop to token rewards on-chain — the complete BREEZO loop.
            </SectionSubtitle>
          </div>

          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div className={styles.stepCard} key={step.num}>
                <span className={styles.stepNum}>{step.num}</span>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </RevealWrapper>
      </div>
    </section>
  )

}
