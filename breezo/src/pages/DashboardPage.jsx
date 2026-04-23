import { useState } from 'react'
import { useAirQuality } from '../hooks/useAirQuality'
import { CITIES } from '../lib/aqi'
import { LivePill } from '../components/ui/UI'
import CitySelector from '../components/dashboard/CitySelector'
import AQIHeroCard from '../components/dashboard/AQIHeroCard'
import MetricsGrid from '../components/dashboard/MetricsGrid'
import TrendChart from '../components/dashboard/TrendChart'
import WHOBars from '../components/dashboard/WHOBars'
import HealthCards from '../components/dashboard/HealthCards'
import CityCompareChart from '../components/dashboard/CityCompareChart'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const [activeCity, setActiveCity] = useState('ktm')
  const { data, loading, error, refetch } = useAirQuality(activeCity)

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Air Quality Dashboard</h1>
          <div className={styles.pageMeta}>
            <LivePill />
            <span className={styles.metaText}>
              {dateStr} · {timeStr} · BREEZO Network v1.0
            </span>
            {data?.sourceLabel && <span className={styles.metaText}>{data.sourceLabel}</span>}
            {error && (
              <span className={styles.errorBadge}>
                API error — showing cached data
              </span>
            )}
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={refetch} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 7A5 5 0 1 1 7 2M7 2l2.5 2.5M7 2L4.5 4.5" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <CitySelector activeCity={activeCity} onChange={setActiveCity} />

      <div className={styles.mainGrid}>
        <AQIHeroCard
          cityName={CITIES[activeCity].name}
          data={data}
          loading={loading && !data}
        />
        <MetricsGrid data={data} />
      </div>

      <WHOBars data={data} />
      <TrendChart trend={data?.trend} />
      <HealthCards data={data} />
      <CityCompareChart />

      <div className={styles.quickRef}>
        <div className={styles.qrHeader}>AQI Quick Reference</div>
        <div className={styles.qrGrid}>
          {[
            { range: '0 - 50', label: 'Good', color: '#4ADE80' },
            { range: '51 - 100', label: 'Moderate', color: '#FCD34D' },
            { range: '101 - 150', label: 'Unhealthy for Sensitive', color: '#FB923C' },
            { range: '151 - 200', label: 'Unhealthy', color: '#F87171' },
            { range: '201 - 300', label: 'Very Unhealthy', color: '#E879F9' },
            { range: '301+', label: 'Hazardous', color: '#F87171' },
          ].map((item) => (
            <div className={styles.qrItem} key={item.range}>
              <span className={styles.qrDot} style={{ background: item.color }} />
              <div>
                <div className={styles.qrRange} style={{ color: item.color }}>{item.range}</div>
                <div className={styles.qrLabel}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
