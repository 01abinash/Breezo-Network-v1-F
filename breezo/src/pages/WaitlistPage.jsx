import { useEffect, useMemo, useState } from 'react'
import { addWaitlistEntry, getWaitlistCount, isSupabaseConfigured } from '../lib/waitlist'
import styles from './WaitlistPage.module.css'

const INITIAL_FORM = {
  name: '',
  email: '',
  location: '',
  organization: '',
  role: '',
  interest: '',
}

export default function WaitlistPage() {
  const usingSupabase = isSupabaseConfigured()
  const [count, setCount] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCount() {
      try {
        const nextCount = await getWaitlistCount()
        if (active) {
          setCount(nextCount)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load waitlist count right now.')
        }
      }
    }

    loadCount()
    return () => {
      active = false
    }
  }, [])

  const waitingLabel = useMemo(() => count.toLocaleString(), [count])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSubmitted(false)

    try {
      await addWaitlistEntry(form)
      const nextCount = await getWaitlistCount()
      setCount(nextCount)
      setSubmitted(true)
      setForm(INITIAL_FORM)
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit the waitlist form right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.kicker}>BREEZO waitlist</span>
        <h1 className={styles.title}>Join the next wave of device operators and climate partners.</h1>
        <p className={styles.copy}>
          Reserve your place for early access to hardware onboarding, tokenization updates, and city launch announcements.
        </p>
        <div className={styles.counterCard}>
          <span className={styles.counterLabel}>People waiting</span>
          <strong className={styles.counterValue}>{waitingLabel}</strong>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Waitlist details</h2>
            <p className={styles.panelText}>
              Tell us who you are and where you want BREEZO devices deployed next.
            </p>
          </div>

          {!usingSupabase && (
            <div className={styles.info}>
              Supabase is not configured yet. This form is currently saving to local browser storage only.
            </div>
          )}

          {submitted && (
            <div className={styles.success}>
              Your waitlist request was added. We will reach out when onboarding opens.
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </label>

            <label className={styles.field}>
              <span>Location</span>
              <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" required />
            </label>

            <label className={styles.field}>
              <span>Organization</span>
              <input name="organization" value={form.organization} onChange={handleChange} placeholder="School, NGO, company, or independent" />
            </label>

            <label className={styles.field}>
              <span>Role</span>
              <input name="role" value={form.role} onChange={handleChange} placeholder="Operator, researcher, donor, volunteer..." />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Why do you want to join?</span>
              <textarea
                name="interest"
                value={form.interest}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us the city, device deployment plan, or collaboration you're interested in."
              />
            </label>

            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Join Waitlist'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
