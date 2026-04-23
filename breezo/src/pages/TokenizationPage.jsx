import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildTokenSession,
  clearTokenSession,
  readTokenSession,
  TOKEN_SESSION_EVENT,
  TOKEN_SESSION_KEY,
  writeTokenSession,
} from '../lib/tokenization'
import {
  getDemoOperatorAccounts,
  getOperatorDashboard,
  loginOperator,
} from '../lib/tokenizationApi'
import styles from './TokenizationPage.module.css'

function scoreColor(score) {
  if (score >= 95) return 'var(--sky)'
  if (score >= 88) return 'var(--teal)'
  if (score >= 78) return 'var(--amber)'
  return 'var(--red)'
}

function MetricTile({ label, value, note, tone = 'sky' }) {
  return (
    <div className={styles.metricTile}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue} style={{ color: `var(--${tone})` }}>{value}</div>
      <div className={styles.metricNote}>{note}</div>
    </div>
  )
}

export default function TokenizationPage() {
  const [session, setSession] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', deviceId: '' })
  const [error, setError] = useState('')
  const demoAccounts = getDemoOperatorAccounts()

  useEffect(() => {
    const syncSession = async () => {
      const stored = readTokenSession()
      setSession(stored)

      if (!stored) {
        setDashboard(null)
        setLoading(false)
        return
      }

      setForm({
        name: stored.ownerName ?? '',
        email: stored.ownerEmail ?? '',
        deviceId: stored.deviceId ?? '',
      })

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

      setForm({
        name: nextSession.ownerName ?? '',
        email: nextSession.ownerEmail ?? '',
        deviceId: nextSession.deviceId ?? '',
      })

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

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)
      const nextDashboard = await loginOperator({
        email: form.email,
        deviceId: form.deviceId,
      })
      const nextSession = buildTokenSession(nextDashboard)
      writeTokenSession(nextSession)
      setSession(nextSession)
      setDashboard(nextDashboard)
      setForm({
        name: nextDashboard.owner.name,
        email: nextDashboard.owner.email,
        deviceId: nextDashboard.device.deviceId,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearTokenSession()
    setSession(null)
    setDashboard(null)
    setLoading(false)
    setError('')
  }

  if (!session || !dashboard) {
    return (
      <div className={styles.page}>
        <section className={styles.authShell}>
          <div className={styles.authIntro}>
            <p className={styles.kicker}>Private Operator Area</p>
            <h1 className={styles.title}>Tokenization dashboard access</h1>
            <p className={styles.subtitle}>
              This frontend now uses a backend-ready dashboard shape: owner, device, metrics, epochs, transactions, and staking. Later, you can replace one API layer and keep the UI.
            </p>

            <div className={styles.introGrid}>
              <div className={styles.introCard}>
                <div className={styles.introTitle}>What backend will replace later</div>
                <p className={styles.introText}>
                  Login, operator profile, epoch scoring, claimable rewards, Solana transactions, and staking state should all come from your backend or indexer later.
                </p>
              </div>
              <div className={styles.introCard}>
                <div className={styles.introTitle}>What stays in frontend</div>
                <p className={styles.introText}>
                  Layout, charts, tables, session UX, dropdowns, and all the operator dashboard visuals can stay almost exactly as they are now.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.authCard}>
            <div className={styles.formHeader}>
              <div>
                <div className={styles.formLabel}>Operator sign-in</div>
                <div className={styles.formTitle}>Access your token dashboard</div>
              </div>
              <span className={styles.previewBadge}>Dummy API mode</span>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Operator name</span>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="operator@breezo.network"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Device ID</span>
                <input
                  className={styles.input}
                  type="text"
                  name="deviceId"
                  value={form.deviceId}
                  onChange={handleChange}
                  placeholder="KTM-01-8842"
                  autoComplete="off"
                  required
                />
              </label>

              {error && <div className={styles.errorBox} role="alert">{error}</div>}

              <button className={styles.primaryBtn} type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Open token dashboard'}
              </button>
            </form>

            <div className={styles.demoBlock}>
              <div className={styles.demoLabel}>Demo operator accounts</div>
              <div className={styles.demoList}>
                {demoAccounts.map((item) => (
                  <div className={styles.demoRow} key={item.deviceId}>
                    <span>{item.email}</span>
                    <span>{item.deviceId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const { owner, device, metrics, epochs, transactions, staking } = dashboard

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Authenticated Tokenization Dashboard</p>
          <h1 className={styles.title}>Solana-ready rewards for {owner.name}</h1>
          <p className={styles.subtitle}>
            This page is already shaped like a real backend response. Later, your backend can return the same sections and this UI can stay in place.
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.metaPill}>{owner.email}</span>
            <span className={styles.metaPill}>{device.wallet}</span>
            <button className={styles.secondaryBtn} onClick={handleLogout} type="button">
              Sign out
            </button>
          </div>
        </div>

        <div className={styles.identityCard}>
          <div className={styles.identityHeader}>
            <div>
              <div className={styles.formLabel}>Registered node</div>
              <div className={styles.identityTitle}>{device.deviceId}</div>
            </div>
            <span className={styles.tierBadge}>{device.tier} tier</span>
          </div>

          <div className={styles.identityGrid}>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>City</span>
              <span className={styles.identityVal}>{device.cityLabel}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Wallet</span>
              <span className={styles.identityVal}>{device.wallet}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Epoch status</span>
              <span className={styles.identityVal}>{metrics.epochStatus}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Node status</span>
              <span className={styles.identityVal}>{device.status}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricsGrid}>
        <MetricTile
          label="Claimable $BREEZ"
          value={metrics.claimableRewards.toFixed(1)}
          note="Ready for operator claim after settlement confirmation."
          tone="sky"
        />
        <MetricTile
          label="Pending $BREEZ"
          value={metrics.pendingRewards.toFixed(1)}
          note="Estimated rewards for the current settlement cycle."
          tone="teal"
        />
        <MetricTile
          label="Epoch score"
          value={metrics.epochScore.toFixed(1)}
          note="Combined uptime, quality, coverage, and verification score."
          tone="amber"
        />
        <MetricTile
          label="Reputation"
          value={`${metrics.reputation}`}
          note="Device-linked reputation used for future staking and routing trust."
          tone="purple"
        />
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.formLabel}>Score engine</div>
              <div className={styles.panelTitle}>How this device earns</div>
            </div>
            <span className={styles.panelHint}>Backend-computed later</span>
          </div>

          <div className={styles.scoreList}>
            {[
              { label: 'Uptime score', value: metrics.uptime },
              { label: 'Data quality', value: metrics.quality },
              { label: 'Coverage bonus', value: metrics.coverage },
              { label: 'Verification', value: metrics.verification },
            ].map((item) => (
              <div className={styles.scoreRow} key={item.label}>
                <div className={styles.scoreTop}>
                  <span className={styles.scoreLabel}>{item.label}</span>
                  <span className={styles.scoreValue} style={{ color: scoreColor(item.value) }}>
                    {item.value}%
                  </span>
                </div>
                <div className={styles.scoreTrack}>
                  <div
                    className={styles.scoreFill}
                    style={{ width: `${item.value}%`, background: scoreColor(item.value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.formLabel}>Treasury and staking</div>
              <div className={styles.panelTitle}>Capital state</div>
            </div>
            <span className={styles.panelHint}>Solana settlement ready</span>
          </div>

          <div className={styles.routeList}>
            <div className={styles.routeCard}>
              <div className={styles.routeTop}>
                <span className={styles.routeLabel}>Lifetime rewards</span>
                <span className={styles.routeValue}>{metrics.lifetimeRewards.toFixed(1)} $BREEZ</span>
              </div>
              <p className={styles.routeText}>Total settled and attributed rewards for this registered device.</p>
            </div>
            <div className={styles.routeCard}>
              <div className={styles.routeTop}>
                <span className={styles.routeLabel}>Climate pool route</span>
                <span className={styles.routeValue}>{metrics.climatePoolShare}%</span>
              </div>
              <p className={styles.routeText}>Reserved flow into tree plantation and broader clean-air mission campaigns.</p>
            </div>
            <div className={styles.routeCard}>
              <div className={styles.routeTop}>
                <span className={styles.routeLabel}>Staked amount</span>
                <span className={styles.routeValue}>{staking.stakedAmount} $BREEZ</span>
              </div>
              <p className={styles.routeText}>Lock status: {staking.lockStatus}. Slash risk: {staking.slashRisk}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <div className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.formLabel}>Settlement history</div>
              <div className={styles.panelTitle}>Recent reward epochs for {device.deviceId}</div>
            </div>
            <Link className={styles.linkBtn} to="/network">
              View roadmap
            </Link>
          </div>

          <div className={styles.historyTable}>
            <div className={styles.historyHead}>
              <span>Epoch</span>
              <span>Score</span>
              <span>Rewards</span>
              <span>Status</span>
            </div>
            {epochs.map((row) => (
              <div className={styles.historyRow} key={row.epoch}>
                <span>{row.epoch}</span>
                <span>{row.score}%</span>
                <span>{row.rewards.toFixed(1)} $BREEZ</span>
                <span>{row.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.formLabel}>Transaction history</div>
              <div className={styles.panelTitle}>Recent Solana-linked records</div>
            </div>
          </div>

          <div className={styles.historyTable}>
            <div className={styles.historyHead}>
              <span>Signature</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {transactions.map((row) => (
              <div className={styles.historyRow} key={row.signature}>
                <span>{row.signature}</span>
                <span>{row.type}</span>
                <span>{row.amount.toFixed(1)} $BREEZ</span>
                <span>{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
