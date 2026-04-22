import { useScrollReveal } from '../../hooks/useScrollReveal'
import { RevealWrapper, SectionLabel, SectionTitle } from '../ui/UI'
import styles from './CrisisSection.module.css'

const SOUTH_ASIA_STATS = [
  { num: '22/30', label: 'Most polluted cities' },
  { num: '1.8B',  label: 'People at risk' },
  { num: '5×',    label: 'WHO safe limits exceeded' },
  { num: '2M+',   label: 'Annual deaths' },
]

export default function CrisisSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className={styles.section}>
      <RevealWrapper visible={visible}>
        <div ref={ref} className={styles.inner}>
          <div className={styles.header}>
            <div>
              <SectionLabel>Global Crisis</SectionLabel>
              <SectionTitle>The air pollution emergency.</SectionTitle>
            </div>
            <p className={styles.headerDesc}>
              Air pollution is the world's leading environmental health risk, disproportionately
              devastating the Global South — communities with the least resources to fight back.
            </p>
          </div>

          <div className={styles.southAsiaBox}>
            <div className={styles.saLeft}>
              <h3>South Asia: the epicenter of the crisis.</h3>
              <p>
                Home to 22 of the world's 30 most polluted cities, South Asia faces an unprecedented
                air quality emergency. With over 1.8 billion people breathing toxic air daily, the
                region needs immediate, scalable, and affordable solutions built for its specific
                challenges — not hand-me-down tech from wealthier nations.
              </p>
            </div>
            <div className={styles.miniGrid}>
              {SOUTH_ASIA_STATS.map((s) => (
                <div className={styles.miniStat} key={s.label}>
                  <span className={styles.miniNum}>{s.num}</span>
                  <span className={styles.miniLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealWrapper>
    </section>
  )
}
