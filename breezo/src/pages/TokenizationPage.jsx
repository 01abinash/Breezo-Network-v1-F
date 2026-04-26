import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  readTokenSession,
  TOKEN_SESSION_EVENT,
  TOKEN_SESSION_KEY,
} from '../lib/tokenization'
import {
  connectOperatorWallet,
  disconnectOperatorWallet,
  getOperatorDashboard,
} from '../lib/tokenizationApi'
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

function formatWalletLabel(value) {
  const wallet = String(value || '').trim()
  if (!wallet) return 'Not connected'
  if (wallet.includes('...')) return wallet
  if (wallet.length <= 14) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-6)}`
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
  const [walletBusy, setWalletBusy] = useState(false)
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
  const displayName = String(session?.ownerName || dashboard.owner.name || 'Profile').trim()
  const walletAddress = String(dashboard.owner.walletAddress || '').trim()
  const walletConnected = Boolean(walletAddress)

  function handleClaimReward() {
    setClaimMessage('')
    setClaiming(true)

    window.setTimeout(() => {
      setClaiming(false)
      setClaimMessage(`Reward claimed successfully for ${node.nodeId}.`)
    }, 900)
  }

  async function handleWalletToggle() {
    if (!session) return

    setClaimMessage('')
    setWalletBusy(true)

    try {
      const nextDashboard = walletConnected
        ? await disconnectOperatorWallet(session)
        : await connectOperatorWallet(session)

      setDashboard(nextDashboard)
      setClaimMessage(
        walletConnected
          ? 'Wallet disconnected from this operator profile.'
          : `Wallet connected: ${formatWalletLabel(nextDashboard.owner.walletAddress)}.`
      )
    } finally {
      setWalletBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.commandDeck} ${styles.revealBase} ${stage >= 1 ? styles.revealVisible : ''}`}>
        <div className={styles.identityPanel}>
          <div className={styles.panelTopline}>
            <span className={styles.kicker}>Private node cockpit</span>
            <span className={styles.levelBadge} style={{ color: statusTone(node.aqiLevel) }}>
              {node.aqiLevel}
            </span>
          </div>

          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>
            Personal command surface for your AQI device, BMP pressure telemetry, sync state, and
            reward lifecycle.
          </p>

          <div className={styles.snapshotGrid}>
            <div className={styles.snapshotCard}>
              <span>AQI signal</span>
              <strong style={{ color: statusTone(node.aqiLevel) }}>{node.aqi}</strong>
              <p>{node.aqiLevel.toLowerCase()} live output from your node.</p>
            </div>
            <div className={styles.snapshotCard}>
              <span>Reward stream</span>
              <strong>{node.reward.toFixed(2)}</strong>
              <p>BREEZO ready in the current cycle.</p>
            </div>
            <div className={styles.snapshotCard}>
              <span>Sync state</span>
              <strong>{node.syncing ? 'Syncing' : 'Synced'}</strong>
              <p>Latest device transmission condition.</p>
            </div>
            <div className={styles.snapshotCard}>
              <span>Wallet route</span>
              <strong>{walletConnected ? formatWalletLabel(walletAddress) : 'Not connected'}</strong>
              <p>{walletConnected ? 'Reward destination bound.' : 'Connect before claims go live.'}</p>
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

        <aside className={styles.actionPanel}>
          <div className={styles.sectionLabel}>Operator actions</div>
          <div className={styles.panelTitle}>Wallet and claims</div>

          <div className={styles.actionGroup}>
            <button
              className={styles.secondaryBtn}
              onClick={handleWalletToggle}
              type="button"
              disabled={walletBusy}
            >
              {walletBusy
                ? (walletConnected ? 'Disconnecting...' : 'Connecting...')
                : (walletConnected ? 'Disconnect Wallet' : 'Connect Wallet')}
            </button>
            <button className={styles.primaryBtn} onClick={handleClaimReward} type="button" disabled={claiming}>
              {claiming ? 'Claiming...' : 'Claim Reward'}
            </button>
          </div>

          <div className={styles.actionStack}>
            <div className={styles.actionStat}>
              <span>Wallet</span>
              <strong>{walletConnected ? formatWalletLabel(walletAddress) : 'Disconnected'}</strong>
            </div>
            <div className={styles.actionStat}>
              <span>Node</span>
              <strong>{node.nodeId}</strong>
            </div>
            <div className={styles.actionStat}>
              <span>Reward</span>
              <strong>{node.reward.toFixed(2)} BREEZO</strong>
            </div>
            <div className={styles.actionStat}>
              <span>AQI level</span>
              <strong style={{ color: statusTone(node.aqiLevel) }}>{node.aqiLevel}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={`${styles.statusBand} ${styles.revealBase} ${stage >= 2 ? styles.revealVisible : ''}`}>
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
          <span className={styles.stripLabel}>Wallet</span>
          <strong>{walletConnected ? 'Connected' : 'Disconnected'}</strong>
          <p>{walletConnected ? formatWalletLabel(walletAddress) : 'Connect a wallet to prepare reward claiming.'}</p>
        </article>
        <article className={styles.stripCard}>
          <span className={styles.stripLabel}>Claim State</span>
          <strong>{claiming ? 'Processing' : 'Ready'}</strong>
          <p>Use the claim action when rewards are available.</p>
        </article>
      </section>

      {/* <section className={`${styles.metricsGrid} ${styles.revealBase} ${stage >= 3 ? styles.revealVisible : ''}`}>
        <MetricCard label="AQI" value={node.aqi} note="Current air quality score from your node." tone={statusTone(node.aqiLevel)} />
        <MetricCard label="PM2.5" value={node.pm25.toFixed(1)} note="Fine particulate output from your device." tone="var(--sky)" />
        <MetricCard label="BMP" value={node.bmp.toFixed(1)} note="Pressure reading sourced from the BMP sensor." tone="var(--purple)" />
        <MetricCard label="Reward" value={node.reward.toFixed(2)} note="Current reward allocation for this active cycle." tone="var(--teal)" />
      </section> */}

      <section className={`${styles.contentGrid} ${styles.revealBase} ${stage >= 4 ? styles.revealVisible : ''}`}>
        <article className={styles.telemetryPanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.sectionLabel}>Telemetry</div>
              <div className={styles.panelTitle}>Sensor field grid</div>
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

        <article className={styles.contextPanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.sectionLabel}>Context</div>
              <div className={styles.panelTitle}>Operator overview</div>
            </div>
          </div>

          <div className={styles.contextStack}>
            <div className={styles.contextCard}>
              <span>Account owner</span>
              <strong>{displayName}</strong>
              <p>Private identity linked to this node telemetry stream.</p>
            </div>
            <div className={styles.contextCard}>
              <span>Email</span>
              <strong>{dashboard.owner.email}</strong>
              <p>Primary login for the premium operator surface.</p>
            </div>
            <div className={styles.contextCard}>
              <span>Wallet</span>
              <strong>{walletConnected ? formatWalletLabel(walletAddress) : 'Not connected'}</strong>
              <p>Use the wallet action in the hero area to connect your payout address.</p>
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
