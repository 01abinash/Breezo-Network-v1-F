import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { buildTokenSession, readTokenSession, writeTokenSession } from '../lib/tokenization'
import { signupOperator } from '../lib/tokenizationApi'
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

export default function SignupPage() {
  const navigate = useNavigate()
  const session = readTokenSession()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
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
      const account = await signupOperator(form)
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
          <div className={styles.badge}>BREEZO operator onboarding</div>
          <div className={styles.orbitBadge}>Premium DePIN onboarding</div>
          <h1 className={styles.title}>Create your private node owner account.</h1>
          <p className={styles.subtitle}>
            Sign up once with your full name, email, and password. After that, your personal
            dashboard opens with your node telemetry and reward state only.
          </p>

          <div className={styles.signalRail}>
            <SignalCard label="Identity" value="Full name" note="Binds the private dashboard to one operator profile." />
            <SignalCard label="Access" value="Secure email login" note="The same credentials are used later on the login page." />
            <SignalCard label="Dashboard" value="Private node view" note="Telemetry, AQI, BMP, and rewards remain inside your own account." />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.formHeader}>
            <div>
              <div className={styles.eyebrow}>Signup</div>
              <div className={styles.formTitle}>Create account</div>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Full name</span>
              <input className={styles.input} type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>

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
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className={styles.switchRow}>
            <span className={styles.switchText}>Already have an account?</span>
            <Link className={styles.linkBtn} to="/login">Go to login</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
