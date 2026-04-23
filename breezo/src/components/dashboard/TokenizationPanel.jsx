import { Link } from 'react-router-dom'
import styles from './TokenizationPanel.module.css'

const REWARD_WEIGHTS = [
  { label: 'Uptime score', value: 40, color: 'var(--sky)' },
  { label: 'Data quality', value: 30, color: 'var(--teal)' },
  { label: 'Coverage bonus', value: 20, color: 'var(--amber)' },
  { label: 'Verification', value: 10, color: 'var(--purple)' },
]

const TREASURY_SPLIT = [
  { label: 'Node operators', value: 60, note: 'Primary reward pool for valid sensor contributors.' },
  { label: 'Network expansion', value: 25, note: 'Hardware rollout, maintenance, and deployments.' },
  { label: 'Climate campaign', value: 15, note: 'Tree plantation and clean-air community programs.' },
]

const FLOW_STEPS = [
  'Sensor nodes submit air quality readings.',
  'An off-chain verifier scores uptime, consistency, and coverage.',
  'A Solana reward epoch settles the approved allocation.',
  'Treasury routes rewards to operators and mission pools.',
]

function getPriorityMessage(cityName, info, aqi) {
  if (!info) {
    return {
      badge: 'Awaiting live feed',
      title: 'No live allocation signal yet',
      desc: 'Once current AQI data loads, this panel can show how the city would be prioritized in a tokenized reward epoch.',
    }
  }

  if (aqi >= 200) {
    return {
      badge: 'Emergency priority',
      title: `${cityName} should receive maximum response weighting`,
      desc: 'In a real tokenized network, severe pollution zones should unlock stronger operator incentives and faster community action funding.',
    }
  }

  if (aqi >= 100) {
    return {
      badge: 'High priority',
      title: `${cityName} would be a strong incentive zone`,
      desc: 'Reward multipliers can be raised here to encourage denser node deployment and faster environmental interventions.',
    }
  }

  return {
    badge: 'Baseline priority',
    title: `${cityName} can anchor long-term network quality`,
    desc: 'Cleaner zones still matter for calibration, trend comparison, and proving the value of high-integrity coverage across the region.',
  }
}

export default function TokenizationPanel({ cityName, data }) {
  const priority = getPriorityMessage(cityName, data?.info, data?.aqi)

  return (
    <section className={styles.panel} aria-labelledby="tokenization-title">
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Solana Reward Layer</p>
          <h3 id="tokenization-title" className={styles.title}>Tokenization Dashboard</h3>
          <p className={styles.subtitle}>
            A product preview for how BREEZO can score nodes, route treasury funds, and connect AQI data to on-chain incentives.
          </p>
        </div>
        <div className={styles.headerBadges}>
          <span className={styles.badge}>Preview mode</span>
          <span className={`${styles.badge} ${styles.badgeMuted}`}>No wallet connected</span>
        </div>
      </div>

      <div className={styles.topGrid}>
        <div className={styles.heroCard}>
          <div className={styles.heroTop}>
            <div>
              <div className={styles.heroLabel}>Settlement layer</div>
              <div className={styles.heroValue}>Solana + $BREEZ</div>
            </div>
            <span className={styles.heroState}>Designing tokenomics</span>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Reward epochs</span>
              <span className={styles.statValue}>Daily</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Node scoring</span>
              <span className={styles.statValue}>Off-chain verifier</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Treasury action</span>
              <span className={styles.statValue}>Operators + campaigns</span>
            </div>
          </div>

          <div className={styles.heroNote}>
            This section is intentionally framed as a preview so the dashboard can show the tokenization direction without implying the Solana reward rails are live today.
          </div>
        </div>

        <div className={styles.signalCard} style={data?.info ? { borderColor: data.info.borderColor, background: data.info.bgColor } : undefined}>
          <div className={styles.signalBadge} style={data?.info ? { color: data.info.color, borderColor: data.info.borderColor } : undefined}>
            {priority.badge}
          </div>
          <div className={styles.signalTitle}>{priority.title}</div>
          <div className={styles.signalDesc}>{priority.desc}</div>
          <div className={styles.signalMeta}>
            <div className={styles.signalMetaItem}>
              <span className={styles.signalMetaLabel}>Live AQI</span>
              <span className={styles.signalMetaValue} style={data?.info ? { color: data.info.color } : undefined}>
                {data?.aqi ?? '—'}
              </span>
            </div>
            <div className={styles.signalMetaItem}>
              <span className={styles.signalMetaLabel}>City status</span>
              <span className={styles.signalMetaValue}>{data?.info?.label ?? 'Loading'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Proposed reward weights</div>
          <div className={styles.weightList}>
            {REWARD_WEIGHTS.map((item) => (
              <div className={styles.weightRow} key={item.label}>
                <div className={styles.weightTop}>
                  <span className={styles.weightLabel}>{item.label}</span>
                  <span className={styles.weightValue}>{item.value}%</span>
                </div>
                <div className={styles.weightTrack}>
                  <div className={styles.weightFill} style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Proposed treasury split</div>
          <div className={styles.splitList}>
            {TREASURY_SPLIT.map((item) => (
              <div className={styles.splitRow} key={item.label}>
                <div className={styles.splitHeader}>
                  <span className={styles.splitLabel}>{item.label}</span>
                  <span className={styles.splitValue}>{item.value}%</span>
                </div>
                <p className={styles.splitNote}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.flowCard}`}>
          <div className={styles.cardTitle}>Tokenization flow</div>
          <div className={styles.flowList}>
            {FLOW_STEPS.map((step, index) => (
              <div className={styles.flowRow} key={step}>
                <span className={styles.flowIndex}>0{index + 1}</span>
                <span className={styles.flowText}>{step}</span>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <Link to="/network" className={styles.primaryLink}>
              Open network roadmap
            </Link>
            <Link to="/about" className={styles.secondaryLink}>
              Mission + campaign context
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
