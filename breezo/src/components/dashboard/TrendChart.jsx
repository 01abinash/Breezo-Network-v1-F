import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import styles from './TrendChart.module.css'

const WHO_PM25 = 5

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      {payload.map((point) => (
        <div key={point.dataKey} className={styles.tooltipRow}>
          <span style={{ color: point.color }}>{point.name}:</span>
          <span className={styles.tooltipVal}>{point.value != null ? `${point.value} ug/m3` : '—'}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ trend }) {
  if (!trend) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>Loading trend data...</div>
      </div>
    )
  }

  const chartData = trend.labels.map((label, index) => ({
    time: label,
    pm25: trend.pm25[index],
  }))

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>24-Hour PM2.5 Trend</h3>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#38BDF8' }} />
          PM2.5 (ug/m3)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDash} />
          WHO reference ({WHO_PM25} ug/m3)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="gradPM25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="time"
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'DM Mono' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.07)' }}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            unit=" ug"
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            y={WHO_PM25}
            stroke="rgba(248,113,113,0.5)"
            strokeDasharray="4 4"
            label={{ value: 'WHO', fill: '#F87171', fontSize: 9, fontFamily: 'DM Mono' }}
          />

          <Area
            type="monotone"
            dataKey="pm25"
            name="PM2.5"
            stroke="#38BDF8"
            strokeWidth={2}
            fill="url(#gradPM25)"
            dot={false}
            activeDot={{ r: 4, fill: '#38BDF8' }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
