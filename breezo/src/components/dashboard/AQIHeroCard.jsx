import { cigarettesPerDay } from '../../lib/aqi'
import styles from './AQIHeroCard.module.css'

export default function AQIHeroCard({ cityName, data, loading }) {
  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.cityLabel}>{cityName}</div>
        <div className={styles.bigNum} style={{ color: 'var(--t3)' }}>—</div>
        <div className={styles.statusLabel} style={{ color: 'var(--t3)' }}>Loading...</div>
        <div className={styles.unit}>AQI (US Standard)</div>
        <div className={styles.healthTip}>Fetching current conditions...</div>
      </div>
    )
  }

  if (!data) return null

  const { aqi, info, pm25 } = data
  const cigs = cigarettesPerDay(pm25)

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.cityLabel}>{cityName}</div>

        <div className={styles.bigNum} style={{ color: info.color }}>
          {aqi}
        </div>
        <div className={styles.statusLabel} style={{ color: info.color }}>
          {info.label}
        </div>
        <div className={styles.unit}>AQI (US Standard)</div>

        {/* Mini decorative AQI scale */}
        <div className={styles.scale}>
          {[
            { color: '#4ADE80', max: 50 },
            { color: '#FCD34D', max: 100 },
            { color: '#FB923C', max: 150 },
            { color: '#F87171', max: 200 },
            { color: '#E879F9', max: 300 },
          ].map((s, i) => (
            <div
              key={i}
              className={styles.scaleSegment}
              style={{
                background: s.color,
                opacity: aqi <= s.max && (i === 0 || aqi > [0, 50, 100, 150, 200][i]) ? 1 : 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Cigarette equivalent */}
      <div className={styles.cigRow}>
        <span className={styles.cigIcon}>🚬</span>
        <span className={styles.cigText}>
          Equivalent to smoking <strong>{cigs}</strong> cigarettes per day
        </span>
      </div>

      <div
        className={styles.healthTip}
        style={{ borderColor: info.borderColor, background: info.bgColor }}
      >
        <strong style={{ color: info.color }}>Health advice:</strong>{' '}
        <span style={{ color: 'var(--t2)' }}>{info.healthTip}</span>
      </div>
    </div>
  )
}
