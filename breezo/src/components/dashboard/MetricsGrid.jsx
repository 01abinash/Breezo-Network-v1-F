import { WHO_LIMITS } from '../../lib/aqi'
import styles from './MetricsGrid.module.css'

const METRICS = [
  { key: 'pm25',  label: 'PM2.5', unit: 'μg/m³', whoKey: 'pm25', color: '#38BDF8', max: 150 },
  { key: 'pm10',  label: 'PM10',  unit: 'μg/m³', whoKey: 'pm10', color: '#2DD4BF', max: 250 },
  { key: 'no2',   label: 'NO₂',   unit: 'μg/m³', whoKey: 'no2',  color: '#FCD34D', max: 200 },
  { key: 'o3',    label: 'O₃',    unit: 'μg/m³', whoKey: 'o3',   color: '#A78BFA', max: 180 },
  { key: 'co',    label: 'CO',    unit: 'μg/m³', whoKey: 'co',   color: '#FB923C', max: 10000 },
  { key: 'so2',   label: 'SO₂',   unit: 'μg/m³', whoKey: 'so2',  color: '#F87171', max: 350 },
]

function MetricCard({ metric, value }) {
  const pct = value != null ? Math.min(100, (value / metric.max) * 100) : 0
  const whoLimit = WHO_LIMITS[metric.whoKey]
  const whoMultiple = value != null && whoLimit ? (value / whoLimit).toFixed(1) : null
  const isOverWHO = whoMultiple && parseFloat(whoMultiple) > 1

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.label}>{metric.label}</span>
        {isOverWHO && (
          <span className={styles.whoBadge} style={{ color: '#F87171', background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.2)' }}>
            {whoMultiple}× WHO
          </span>
        )}
      </div>
      <div className={styles.value}>
        {value != null ? parseFloat(value).toFixed(1) : '—'}
      </div>
      <div className={styles.unit}>{metric.unit}</div>
      <div className={styles.barWrap}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: metric.color, transition: 'width 0.8s ease' }}
        />
      </div>
      {whoLimit && (
        <div className={styles.whoLine}>
          WHO limit: <span>{whoLimit} {metric.unit}</span>
        </div>
      )}
    </div>
  )
}

export default function MetricsGrid({ data }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Pollutant Concentrations</div>
      <div className={styles.grid}>
        {METRICS.map(m => (
          <MetricCard key={m.key} metric={m} value={data?.[m.key]} />
        ))}
      </div>
    </div>
  )
}
