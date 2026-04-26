import { useScrollReveal } from '../hooks/useScrollReveal'
import { SectionLabel, SectionTitle, SolanaTag } from '../components/ui/UI'
import styles from './AboutPage.module.css'

const PROBLEM_POINTS = [
  { icon: '📍', title: 'Sparse coverage', desc: 'Existing monitoring relies on a handful of static stations spaced far apart — capturing none of the block-level variation in pollution.' },
  { icon: '🔒', title: 'Centralized control', desc: 'Government-run systems are expensive to expand, slow to update, and inaccessible to the communities they affect most.' },
  { icon: '💤', title: 'No incentive to grow', desc: 'Without economic incentives, there is no mechanism to rapidly scale monitoring infrastructure into the areas that need it most.' },
]

const SOLUTION_POINTS = [
  { icon: '🌐', label: 'Distributed', desc: 'Anyone can deploy a node. Network grows organically.' },
  { icon: '🔗', label: 'Transparent', desc: 'Data and rewards visible on-chain. No black box.' },
  { icon: '💸', label: 'Incentivized', desc: '$BREEZO tokens reward every quality data contribution.' },
  { icon: '📡', label: 'Real-time',   desc: 'Sub-minute latency from sensor to dashboard.' },
  { icon: '🗺️', label: 'Hyperlocal',  desc: 'Street-level resolution no central system can match.' },
  { icon: '🌍', label: 'Open',        desc: 'Public API, open data — for research, policy, and citizens.' },
]

const TEAM = [
  { initials: 'AY', name: 'Abinash Yadav',   role: 'Founder, Hardware Lead & marketing',   bg: '#0EA5E9' },
  { initials: 'LM', name: 'Looneva Maharjan',  role: 'Developer',  bg: '#2DD4BF' },
  // { initials: 'RB', name: 'Rohan Bajracharya', role: 'Blockchain & Tokenomics', bg: '#A78BFA' },
  // { initials: 'PP', name: 'Priya Pandey',   role: 'Community & Partnerships',  bg: '#FCD34D' },
]

function RevealSection({ children }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} className={`${styles.reveal} ${visible ? styles.visible : ''}`}>
      {children}
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`fade-up d1 ${styles.heroInner}`}>
          <SectionLabel>About BREEZO Network</SectionLabel>
          <h1 className={styles.heroTitle}>
            We believe access to<br />
            <span className={styles.sky}>environmental data</span><br />
            is a public good.
          </h1>
          <p className={styles.heroDesc}>
            BREEZO Network was born in Kathmandu — a city where on a bad day you can taste the
            air, but until now you couldn't measure it at street level. We're building the
            infrastructure layer that South Asia has been missing.
          </p>
          <div className={styles.heroBadges}>
            {/* <SolanaTag /> */}
            <span className={styles.heroBadge}>🇳🇵 Built in Nepal</span>
            <span className={styles.heroBadge}>🌏 For South Asia</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <RevealSection>
        <section className={styles.section}>
          <SectionLabel>The Problem</SectionLabel>
          <div className={styles.problemGrid}>
            <div>
              <SectionTitle>The missing layer of environmental intelligence.</SectionTitle>
              <p className={styles.problemLead}>
                Urban environments across South Asia face a critical and under-addressed challenge:
                the lack of accurate, real-time, hyperlocal air quality data. The consequence is a
                systemic gap — individuals lack visibility, communities cannot respond proactively,
                and policymakers operate on incomplete datasets.
              </p>
            </div>
            <div className={styles.problemCards}>
              {PROBLEM_POINTS.map(p => (
                <div className={styles.problemCard} key={p.title}>
                  <span className={styles.problemIcon}>{p.icon}</span>
                  <div>
                    <div className={styles.problemTitle}>{p.title}</div>
                    <div className={styles.problemDesc}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Solution */}
      <RevealSection>
        <section className={`${styles.section} ${styles.darkSection}`}>
          <SectionLabel>The Solution</SectionLabel>
          <SectionTitle>Decentralized. Incentivized. Community-owned.</SectionTitle>
          <div className={styles.solutionGrid}>
            {SOLUTION_POINTS.map(s => (
              <div className={styles.solutionCard} key={s.label}>
                <span className={styles.solutionIcon}>{s.icon}</span>
                <div className={styles.solutionLabel}>{s.label}</div>
                <div className={styles.solutionDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* Mission statement */}
      <RevealSection>
        <section className={styles.missionSection}>
          <div className={styles.missionInner}>
            <div className={styles.missionQuote}>
              "The future of environmental monitoring is not centralized. It is distributed,
              incentivized, and community-owned."
            </div>
            <div className={styles.missionSub}>— BREEZO Network Whitepaper, 2025</div>
          </div>
        </section>
      </RevealSection>

      {/* Team */}
      <RevealSection>
        <section className={styles.section}>
          <SectionLabel>The Team</SectionLabel>
          <SectionTitle>Built by people who breathe this air.</SectionTitle>
          <div className={styles.teamGrid}>
            {TEAM.map(member => (
              <div className={styles.teamCard} key={member.name}>
                <div className={styles.teamAvatar} style={{ background: member.bg + '28', borderColor: member.bg + '66', color: member.bg }}>
                  {member.initials}
                </div>
                <div className={styles.teamName}>{member.name}</div>
                <div className={styles.teamRole}>{member.role}</div>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* CTA */}
      <RevealSection>
        <section className={styles.ctaSection}>
          <div className={styles.ctaBg} />
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Join us in making air visible.</h2>
            <p className={styles.ctaDesc}>
              Whether you want to deploy a node, contribute code, partner with us, or just
              follow our progress — we'd love to hear from you.
            </p>
            <div className={styles.ctaBtns}>
              <a href="mailto:hello@breezo.network" className={styles.btnSky}>Get in Touch</a>
              <button className={styles.btnGhost}>Read the Whitepaper →</button>
            </div>
          </div>
        </section>
      </RevealSection>

    </div>
  )
}
