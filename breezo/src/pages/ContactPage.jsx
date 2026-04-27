import { useState } from 'react'
import styles from './ContactPage.module.css'

const CONTACT_CHANNELS = [
  // {
  //   label: 'Email',
  //   value: 'hello@breezo.network',
  //   note: 'For partnerships, pilots, product questions, and general inquiries.',
  //   href: 'mailto:hello@breezo.network',
  // },
  {
    label: 'Twitter',
    value: '@breezonetwork',
    note: 'Follow product updates, deployments, and network progress.',
    href: 'https://twitter.com/breezonetwork',
  },
]

const CONTACT_TOPICS = [
  'Government or institution partnerships',
  'AQI dashboard and API questions',
  'Device deployment and pilot inquiries',
  'Developer and media outreach',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setForm({
      name: '',
      email: '',
      organization: '',
      message: '',
    })
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroLabel}>Contact Us</div>
        <h1 className={styles.heroTitle}>Let’s talk about cleaner-air infrastructure.</h1>
        <p className={styles.heroDesc}>
          Reach out to Breezo for partnerships, pilots, API access questions, hardware discussions,
          or product collaboration. We’re happy to connect.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.channelsCard}>
          <div className={styles.sectionKicker}>Direct Channels</div>
          <h2 className={styles.sectionTitle}>Best ways to reach the team</h2>
          <div className={styles.channelList}>
            {CONTACT_CHANNELS.map((channel) => (
              <a
                key={channel.label}
                className={styles.channelItem}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <span className={styles.channelLabel}>{channel.label}</span>
                <strong className={styles.channelValue}>{channel.value}</strong>
                <p className={styles.channelNote}>{channel.note}</p>
              </a>
            ))}
          </div>
        </article>

        <div className={styles.rightColumn}>
          <article className={styles.formCard}>
            <div className={styles.sectionKicker}>Send a Message</div>
            <h2 className={styles.sectionTitle}>Tell us what you need</h2>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Organization</span>
                <input
                  className={styles.input}
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Company, institution, or team"
                  autoComplete="organization"
                />
              </label>

              <label className={styles.field}>
                <span>Message</span>
                <textarea
                  className={styles.textarea}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your interest, question, or partnership idea"
                  rows="5"
                  required
                />
              </label>

              {submitted && (
                <div className={styles.successBox}>
                  Message captured. Connect this form to your backend or email service to deliver it.
                </div>
              )}

              <button className={styles.submitBtn} type="submit">Send Message</button>
            </form>
          </article>

          {/* <article className={styles.topicsCard}>
            <div className={styles.sectionKicker}>What We Handle</div>
            <h2 className={styles.sectionTitle}>Common contact topics</h2>
            <div className={styles.topicList}>
              {CONTACT_TOPICS.map((topic, index) => (
                <div className={styles.topicItem} key={topic}>
                  <span className={styles.topicIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.topicText}>{topic}</span>
                </div>
              ))}
            </div>
          </article> */}
        </div>
      </section>
    </div>
  )
}
