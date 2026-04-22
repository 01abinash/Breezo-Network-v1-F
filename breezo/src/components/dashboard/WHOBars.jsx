import { WHO_LIMITS } from '../../lib/aqi'
import styles from './WHOBars.module.css'

const COMPLIANCE_METRICS = [
  { key: 'pm25', label: 'PM2.5', unit: 'μg/m³' },
  { key: 'pm10', label: 'PM10',  unit: 'μg/m³' },
  { key: 'no2',  label: 'NO₂',   unit: 'μg/m³' },
  { key: 'o3',   label: 'O₃',    unit: 'μg/m³' },
]

function getBarColor(multiple) {
  if (multiple <= 1)  return '#4ADE80'
  if (multiple <= 2)  return '#FCD34D'
  if (multiple <= 4)  return '#FB923C'
  return '#F87171'
}

export default function WHOBars({ data }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>WHO Guideline Compliance</h3>
        <span className={styles.sub}>Annual mean guidelines</span>
      </div>

      <div className={styles.bars}>
        {COMPLIANCE_METRICS.map((m) => {
          const val = data?.[m.key]
          const limit = WHO_LIMITS[m.key]
          const multiple = val != null && limit ? val / limit : 0
          const pct = Math.min(100, (multiple / 5) * 100)
          const color = getBarColor(multiple)

          return (
            <div className={styles.row} key={m.key}>
              <div className={styles.rowLabel}>
                <span className={styles.pollutantName}>{m.label}</span>
                <span className={styles.pollutantVal}>
                  {val != null ? `${parseFloat(val).toFixed(1)} ${m.unit}` : '—'}
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${pct}%`, background: color, transition: 'width 1s ease' }}
                />
                {/* WHO limit marker at 20% (1× limit out of 5×) */}
                <div className={styles.whoMarker} title={`WHO: ${limit} ${m.unit}`} />
              </div>
              <div className={styles.multiple} style={{ color }}>
                {multiple > 0 ? `${multiple.toFixed(1)}×` : '—'}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#4ADE80' }} />Within WHO limit</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#FCD34D' }} />1–2× WHO limit</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#FB923C' }} />2–4× WHO limit</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#F87171' }} />4×+ WHO limit</div>
      </div>
    </div>
  )
}
