import { useState } from 'react'
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
      {payload.map((p) => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className={styles.tooltipVal}>{p.value != null ? `${p.value} μg/m³` : '—'}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ trend }) {
  const [activeMetric, setActiveMetric] = useState('pm25')

  if (!trend) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>Loading trend data...</div>
      </div>
    )
  }

  // Build recharts-friendly data array
  const chartData = trend.labels.map((label, i) => ({
    time: label,
    pm25: trend.pm25[i],
    pm10: trend.pm10[i],
  }))

  const metrics = [
    { key: 'pm25', label: 'PM2.5', color: '#38BDF8' },
    { key: 'pm10', label: 'PM10',  color: '#2DD4BF' },
  ]

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>24-Hour Pollutant Trend</h3>
        <div className={styles.tabs}>
          {metrics.map((m) => (
            <button
              key={m.key}
              className={`${styles.tab} ${activeMetric === m.key ? styles.tabActive : ''}`}
              style={activeMetric === m.key ? { color: m.color, borderColor: m.color + '55', background: m.color + '18' } : {}}
              onClick={() => setActiveMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: metrics.find(m => m.key === activeMetric)?.color }} />
          {metrics.find(m => m.key === activeMetric)?.label} (μg/m³)
        </span>
        {activeMetric === 'pm25' && (
          <span className={styles.legendItem}>
            <span className={styles.legendDash} />
            WHO limit ({WHO_PM25} μg/m³)
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="gradPM25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38BDF8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPM10" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2DD4BF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
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
            unit=" μg"
          />

          <Tooltip content={<CustomTooltip />} />

          {activeMetric === 'pm25' && (
            <ReferenceLine
              y={WHO_PM25}
              stroke="rgba(248,113,113,0.5)"
              strokeDasharray="4 4"
              label={{ value: 'WHO', fill: '#F87171', fontSize: 9, fontFamily: 'DM Mono' }}
            />
          )}

          {activeMetric === 'pm25' && (
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
          )}
          {activeMetric === 'pm10' && (
            <Area
              type="monotone"
              dataKey="pm10"
              name="PM10"
              stroke="#2DD4BF"
              strokeWidth={2}
              fill="url(#gradPM10)"
              dot={false}
              activeDot={{ r: 4, fill: '#2DD4BF' }}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
