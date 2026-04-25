import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { buildTokenSession, readTokenSession, writeTokenSession } from '../lib/tokenization'
import { loginOperator } from '../lib/tokenizationApi'
import styles from './AuthPage.module.css'

function SignalCard({ label, value, note }) {
  return (
    <article className={styles.signalCard}>
      <div className={styles.signalLabel}>{label}</div>
      <div className={styles.signalValue}>{value}</div>
      <div className={styles.signalNote}>{note}</div>
    </article>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const session = readTokenSession()
  const [form, setForm] = useState({
    email: 'owner@breezo.io',
    password: 'SecurePass123!',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to="/tokenization" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)
      const account = await loginOperator(form)
      writeTokenSession(buildTokenSession(account))
      navigate('/tokenization')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.showcase}>
          <div className={styles.badge}>BREEZO private access</div>
          <div className={styles.orbitBadge}>AI-tech x DePIN</div>
          <h1 className={styles.title}>Operator access to your private node cockpit.</h1>
          <p className={styles.subtitle}>
            A tighter premium login surface for BREEZO node owners. Sign in to open your personal
            AQI, BMP, sync, and reward dashboard.
          </p>

          <div className={styles.signalRail}>
            <SignalCard label="Identity" value="Email + password" note="Minimal secure access for your operator profile." />
            <SignalCard label="Telemetry" value="Private device view" note="Only your node data appears after authentication." />
            <SignalCard label="Rewards" value="Claim-ready panel" note="Track AQI-linked rewards and sync state privately." />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.formHeader}>
            <div>
              <div className={styles.eyebrow}>Login</div>
              <div className={styles.formTitle}>Welcome back</div>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Password</span>
              <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button className={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? 'Opening dashboard...' : 'Login'}
            </button>
          </form>

          <div className={styles.switchRow}>
            <span className={styles.switchText}>New operator?</span>
            <Link className={styles.linkBtn} to="/signup">Create account</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
