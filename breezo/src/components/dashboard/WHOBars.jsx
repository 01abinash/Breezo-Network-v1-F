import styles from './WHOBars.module.css'

const PM25_LIMIT = 5

function getBarColor(multiple) {
  if (multiple <= 1) return '#4ADE80'
  if (multiple <= 2) return '#FCD34D'
  if (multiple <= 4) return '#FB923C'
  return '#F87171'
}

export default function WHOBars({ data }) {
  const val = data?.pm25
  const multiple = val != null ? val / PM25_LIMIT : 0
  const pct = Math.min(100, (multiple / 5) * 100)
  const color = getBarColor(multiple)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>PM2.5 Safety Reference</h3>
        <span className={styles.sub}>Instant comparison against WHO PM2.5 guideline</span>
      </div>

      <div className={styles.bars}>
        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span className={styles.pollutantName}>PM2.5</span>
            <span className={styles.pollutantVal}>
              {val != null ? `${parseFloat(val).toFixed(1)} ug/m3` : 'Awaiting sensor'}
            </span>
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${pct}%`, background: color, transition: 'width 1s ease' }}
            />
            <div className={styles.whoMarker} title={`WHO: ${PM25_LIMIT} ug/m3`} />
          </div>
          <div className={styles.multiple} style={{ color }}>
            {multiple > 0 ? `${multiple.toFixed(1)}x` : '—'}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#4ADE80' }} />Within WHO limit</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#FCD34D' }} />1-2x guideline</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#FB923C' }} />2-4x guideline</div>
        <div className={styles.footerItem}><span className={styles.dot} style={{ background: '#F87171' }} />4x+ guideline</div>
      </div>
    </div>
  )
}
