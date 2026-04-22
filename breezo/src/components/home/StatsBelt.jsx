import { useCountUp } from '../../hooks/useScrollReveal'
import styles from './StatsBelt.module.css'

const STATS = [
  { target: 7,    suffix: 'M+',   desc: 'Annual premature deaths from air pollution. South Asia alone: over 2 million.' },
  { target: 8.1,  prefix: '$', suffix: 'T', desc: 'Annual global economic loss through healthcare, productivity, and shortened lives.' },
  { target: 99,   suffix: '%',   desc: 'Of the world breathes air exceeding WHO safe limits. Children most vulnerable.' },
  { target: 22,   suffix: '/30', desc: 'Most polluted cities globally are in South Asia. 1.8 billion people at risk.' },
]

function StatCell({ target, prefix = '', suffix = '', desc }) {
  const { ref, value } = useCountUp(target)
  return (
    <div className={styles.cell} ref={ref}>
      <div className={styles.num}>
        {prefix}<span className={styles.accent}>{value}</span>{suffix}
      </div>
      <p className={styles.desc}>{desc}</p>
    </div>
  )
}

export default function StatsBelt() {
  return (
    <div className={styles.belt}>
      {STATS.map((s, i) => <StatCell key={i} {...s} />)}
    </div>
  )
}
