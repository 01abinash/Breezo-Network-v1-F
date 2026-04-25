import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  clearTokenSession,
  readTokenSession,
  TOKEN_SESSION_EVENT,
  TOKEN_SESSION_KEY,
} from '../lib/tokenization'
import { getOperatorDashboard } from '../lib/tokenizationApi'
import styles from './TokenizationPage.module.css'

const TIMING = {
  hero: 80,
  strip: 210,
  metrics: 360,
  details: 520,
}

function statusTone(level) {
  if (level === 'GOOD') return 'var(--teal)'
  if (level === 'MODERATE') return 'var(--amber)'
  return 'var(--red)'
}

function formatLastSeen(value) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function MetricCard({ label, value, note, tone = 'var(--sky)' }) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue} style={{ color: tone }}>{value}</div>
      <div className={styles.metricNote}>{note}</div>
    </article>
  )
}

export default function TokenizationPage() {
  /* --------------------------------------------------------
   * PAGE CONTENT STORYBOARD
   *
   *   0ms  shell visible
   *  80ms  hero fades in
   * 210ms  status strip reveals
   * 360ms  metric tiles cascade in
   * 520ms  detail panels settle in
   * -------------------------------------------------------- */
  const [session, setSession] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const syncSession = async () => {
      const stored = readTokenSession()
      setSession(stored)

      if (!stored) {
        setDashboard(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const nextDashboard = await getOperatorDashboard(stored)
        setDashboard(nextDashboard)
      } catch {
        clearTokenSession()
        setDashboard(null)
      } finally {
        setLoading(false)
      }
    }

    const onSessionChange = async (event) => {
      const nextSession = event.detail ?? null
      setSession(nextSession)

      if (!nextSession) {
        setDashboard(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const nextDashboard = await getOperatorDashboard(nextSession)
        setDashboard(nextDashboard)
      } catch {
        setDashboard(null)
      } finally {
        setLoading(false)
      }
    }

    const onStorage = (event) => {
      if (event.key === null || event.key === TOKEN_SESSION_KEY) {
        syncSession()
      }
    }

    syncSession()
    window.addEventListener(TOKEN_SESSION_EVENT, onSessionChange)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(TOKEN_SESSION_EVENT, onSessionChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (loading || !dashboard) return undefined

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReducedMotion) {
      setStage(4)
      return undefined
    }

    setStage(0)
    const timers = []
    timers.push(window.setTimeout(() => setStage(1), TIMING.hero))
    timers.push(window.setTimeout(() => setStage(2), TIMING.strip))
    timers.push(window.setTimeout(() => setStage(3), TIMING.metrics))
    timers.push(window.setTimeout(() => setStage(4), TIMING.details))

    return () => timers.forEach(window.clearTimeout)
  }, [loading, dashboard])

  if (!loading && !session) {
    return <Navigate to="/login" replace />
  }

  if (loading || !dashboard) {
    return (
      <div className={styles.page}>
        <section className={styles.loadingCard}>
          <div className={styles.kicker}>Private dashboard</div>
          <h1 className={styles.title}>Loading your node cockpit...</h1>
        </section>
      </div>
    )
  }

  const node = dashboard.data[0]

  function handleClaimReward() {
    setClaimMessage('')
    setClaiming(true)

    window.setTimeout(() => {
      setClaiming(false)
      setClaimMessage(`Reward claimed successfully for ${node.nodeId}.`)
    }, 900)
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.heroGrid} ${styles.revealBase} ${stage >= 1 ? styles.revealVisible : ''}`}>
        <div className={styles.heroCard}>
          <div className={styles.heroTopline}>
            <span className={styles.kicker}>Private node cockpit</span>
            <span className={styles.levelBadge} style={{ color: statusTone(node.aqiLevel) }}>
              {node.aqiLevel}
            </span>
          </div>

          <div className={styles.heroBody}>
            <div>
              <h1 className={styles.title}>{dashboard.owner.name}</h1>
              <p className={styles.subtitle}>
                Premium operator view for your personal AQI device, BMP pressure feed, sync health,
                and reward state.
              </p>
            </div>

            <div className={styles.heroActions}>
              <button className={styles.primaryBtn} onClick={handleClaimReward} type="button" disabled={claiming}>
                {claiming ? 'Claiming...' : 'Claim Reward'}
              </button>
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaPill}>{dashboard.owner.email}</span>
            <span className={styles.metaPill}>{node.nodeId}</span>
            <span className={styles.metaPill}>
              {node.location.lat}, {node.location.lng}
            </span>
            <span className={styles.metaPill}>Last seen {formatLastSeen(node.lastSeen)}</span>
          </div>

          {claimMessage && <div className={styles.successBox}>{claimMessage}</div>}
        </div>

        <aside className={styles.sideCard}>
          <div className={styles.sectionLabel}>Node state</div>
          <div className={styles.sideTitle}>Live operator summary</div>

          <div className={styles.sideStack}>
            <div className={styles.sideStat}>
              <span>Node ID</span>
              <strong>{node.nodeId}</strong>
            </div>
            <div className={styles.sideStat}>
              <span>Syncing</span>
              <strong>{node.syncing ? 'Syncing' : 'Synced'}</strong>
            </div>
            <div className={styles.sideStat}>
              <span>Reward</span>
              <strong>{node.reward.toFixed(2)} BREEZO</strong>
            </div>
            <div className={styles.sideStat}>
              <span>AQI Level</span>
              <strong style={{ color: statusTone(node.aqiLevel) }}>{node.aqiLevel}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={`${styles.statusStrip} ${styles.revealBase} ${stage >= 2 ? styles.revealVisible : ''}`}>
        <article className={styles.stripCard}>
          <span className={styles.stripLabel}>AQI Status</span>
          <strong style={{ color: statusTone(node.aqiLevel) }}>{node.aqiLevel}</strong>
          <p>{node.aqi} live AQI from your current node output.</p>
        </article>
        <article className={styles.stripCard}>
          <span className={styles.stripLabel}>BMP Pressure</span>
          <strong>{node.bmp.toFixed(1)}</strong>
          <p>Pressure reading captured from your BMP sensor.</p>
        </article>
        <article className={styles.stripCard}>
          <span className={styles.stripLabel}>Sync State</span>
          <strong>{node.syncing ? 'Syncing' : 'Synced'}</strong>
          <p>Live device state for the latest telemetry cycle.</p>
        </article>
        <article className={styles.stripCard}>
          <span className={styles.stripLabel}>Claim State</span>
          <strong>{claiming ? 'Processing' : 'Ready'}</strong>
          <p>Use the claim action when rewards are available.</p>
        </article>
      </section>

      <section className={`${styles.metricsGrid} ${styles.revealBase} ${stage >= 3 ? styles.revealVisible : ''}`}>
        <MetricCard label="AQI" value={node.aqi} note="Current air quality score from your node." tone={statusTone(node.aqiLevel)} />
        <MetricCard label="PM2.5" value={node.pm25.toFixed(1)} note="Fine particulate output from your device." tone="var(--sky)" />
        <MetricCard label="BMP" value={node.bmp.toFixed(1)} note="Pressure reading sourced from the BMP sensor." tone="var(--purple)" />
        <MetricCard label="Reward" value={node.reward.toFixed(2)} note="Current reward allocation for this active cycle." tone="var(--teal)" />
      </section>

      <section className={`${styles.dashboardGrid} ${styles.revealBase} ${stage >= 4 ? styles.revealVisible : ''}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.sectionLabel}>Telemetry</div>
              <div className={styles.panelTitle}>Personal dashboard fields</div>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.fieldCard}>
              <span>Node ID</span>
              <strong>{node.nodeId}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Temperature</span>
              <strong>{node.temperature.toFixed(1)} deg C</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Humidity</span>
              <strong>{node.humidity.toFixed(1)} %</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>PM2.5</span>
              <strong>{node.pm25.toFixed(1)}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>BMP</span>
              <strong>{node.bmp.toFixed(1)}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>AQI</span>
              <strong>{node.aqi}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>AQI Level</span>
              <strong style={{ color: statusTone(node.aqiLevel) }}>{node.aqiLevel}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Reward</span>
              <strong>{node.reward.toFixed(2)} BREEZO</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Syncing Status</span>
              <strong>{node.syncing ? 'Syncing' : 'Synced'}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Latitude</span>
              <strong>{node.location.lat}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Longitude</span>
              <strong>{node.location.lng}</strong>
            </div>
            <div className={styles.fieldCard}>
              <span>Last Seen</span>
              <strong>{formatLastSeen(node.lastSeen)}</strong>
            </div>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.sectionLabel}>Context</div>
              <div className={styles.panelTitle}>Operator overview</div>
            </div>
          </div>

          <div className={styles.contextStack}>
            <div className={styles.contextCard}>
              <span>Account owner</span>
              <strong>{dashboard.owner.name}</strong>
              <p>Private identity linked to this node telemetry stream.</p>
            </div>
            <div className={styles.contextCard}>
              <span>Email</span>
              <strong>{dashboard.owner.email}</strong>
              <p>Primary login for the premium operator surface.</p>
            </div>
            <div className={styles.contextCard}>
              <span>Claim state</span>
              <strong>{claiming ? 'Processing' : 'Available'}</strong>
              <p>Use the claim action in the hero area when rewards are ready.</p>
            </div>
            <div className={styles.contextCard}>
              <span>Dashboard data</span>
              <strong>{dashboard.success ? 'Connected' : 'Unavailable'}</strong>
              <p>Dummy frontend data for now, ready to be swapped with backend later.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
