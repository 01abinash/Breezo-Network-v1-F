import { SectionLabel, SectionTitle, SectionSubtitle } from '../components/ui/UI'
import styles from './ProductPage.module.css'

const DEVICE_PRODUCTS = [
  {
    name: 'BREEZO Street Node',
    type: 'Urban AQI device',
    summary:
      'Outdoor-ready air quality node for roadside deployment, public zones, and dense city coverage.',
    specs: [
      ['Sensors', 'PM2.5, DHT22, MQ135, BMP180, GPS'],
      ['Controller', 'ESP32 low-power WiFi microcontroller'],
      ['Connectivity', 'WiFi / hotspot uplink'],
      ['Use case', 'Street-level AQI mapping and public monitoring'],
    ],
  },
  {
    name: 'BREEZO Campus Node',
    type: 'Institutional device',
    summary:
      'Stable indoor-outdoor unit for schools, offices, campuses, and public institutions needing continuous AQI visibility.',
    specs: [
      ['Sensors', 'PM2.5, DHT22, MQ135, BMP180'],
      ['Controller', 'ESP32 with scheduled sync'],
      ['Power', 'Continuous USB / regulated supply'],
      ['Use case', 'Schools, hospitals, municipal compounds'],
    ],
  },
  {
    name: 'BREEZO Portable Kit',
    type: 'Mobile diagnostics',
    summary:
      'Compact AQI kit for rapid deployment, field validation, temporary studies, and hyperlocal mobile readings.',
    specs: [
      ['Sensors', 'PM2.5, DHT22, MQ135, BMP180, GPS'],
      ['Controller', 'ESP32 compact board'],
      ['Mobility', 'Portable enclosure with GPS tagging'],
      ['Use case', 'Field surveys, pilots, pop-up monitoring'],
    ],
  },
]

const DEVICE_SPEC_ROWS = [
  { label: 'PM2.5 sensor', value: 'Primary AQI particulate feed' },
  { label: 'DHT22', value: 'Temperature and humidity' },
  { label: 'MQ135', value: 'Air quality gas trend indicator' },
  { label: 'BMP180', value: 'Pressure / BMP atmospheric data' },
  { label: 'GPS', value: 'Exact device latitude and longitude' },
  { label: 'ESP32', value: 'Telemetry controller and network transport' },
]

const DASHBOARD_AUDIENCES = [
  {
    title: 'For Governments',
    copy:
      'AQI dashboards help governments identify pollution hotspots, guide policy, prioritize interventions, and create transparent public reporting for city air quality.',
    points: ['Ward-level pollution visibility', 'Evidence for policy action', 'Public health alerting'],
  },
  {
    title: 'For Business',
    copy:
      'Businesses need AQI visibility to protect workers, manage indoor-outdoor operations, assess site quality, and build trust through measurable environmental data.',
    points: ['Workplace safety insight', 'Location quality signals', 'ESG and reporting support'],
  },
  {
    title: 'For Individuals',
    copy:
      'Individuals need AQI data to decide when to go outside, use masks or purifiers, protect children and elders, and understand the real conditions around them.',
    points: ['Daily health decisions', 'Family protection', 'Hyperlocal air awareness'],
  },
]

const UPCOMING_ITEMS = [
  {
    title: 'Live node fleet expansion',
    detail: 'More deployed AQI devices across dense neighborhoods, institutions, and public roads.',
  },
  {
    title: 'Government-grade reporting views',
    detail: 'Policy-oriented dashboards with trends, hotspot comparison, and intervention visibility.',
  },
  {
    title: 'Business environment modules',
    detail: 'Operational AQI reporting for campuses, offices, and facilities monitoring.',
  },
  {
    title: 'Operator tokenization layer',
    detail: 'Wallet-linked node rewards, sync validation, and private operator dashboards.',
  },
]

function DeviceVisual({ label }) {
  return (
    <div className={styles.deviceVisual} aria-hidden="true">
      <div className={styles.deviceShell}>
        <div className={styles.deviceCap} />
        <div className={styles.deviceScreen}>
          <span className={styles.deviceBrand}>BREEZO</span>
          <span className={styles.deviceValue}>AQI</span>
        </div>
        <div className={styles.devicePorts}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={styles.deviceLabel}>{label}</div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <SectionLabel>Product</SectionLabel>
          <h1 className={styles.heroTitle}>Devices, dashboards, and the next layer of clean-air infrastructure.</h1>
          <p className={styles.heroDesc}>
            BREEZO combines AQI sensing devices, actionable dashboard intelligence, and an upcoming
            operator ecosystem into one environmental product stack.
          </p>
        </div>

        <nav className={styles.sectionNav} aria-label="Product sections">
          <a href="#devices" className={styles.sectionLink}>Devices</a>
          <a href="#dashboard" className={styles.sectionLink}>Dashboard</a>
          <a href="#upcoming" className={styles.sectionLink}>Upcoming</a>
        </nav>
      </section>

      <section id="devices" className={styles.section}>
        <SectionLabel>Devices</SectionLabel>
        <SectionTitle>AQI devices built for real deployment.</SectionTitle>
        <SectionSubtitle>
          BREEZO devices are designed around practical air quality sensing, reliable telemetry, and
          city-scale deployment needs.
        </SectionSubtitle>

        <div className={styles.deviceGrid}>
          {DEVICE_PRODUCTS.map((device) => (
            <article key={device.name} className={styles.deviceCard}>
              <DeviceVisual label={device.type} />
              <div className={styles.deviceInfo}>
                <div className={styles.deviceType}>{device.type}</div>
                <h3 className={styles.deviceName}>{device.name}</h3>
                <p className={styles.deviceSummary}>{device.summary}</p>
                <div className={styles.specList}>
                  {device.specs.map(([label, value]) => (
                    <div className={styles.specItem} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.techPanel}>
          <div>
            <div className={styles.miniLabel}>Technical Specifications</div>
            <h3 className={styles.panelTitle}>Core hardware stack</h3>
          </div>
          <div className={styles.techGrid}>
            {DEVICE_SPEC_ROWS.map((row) => (
              <div className={styles.techRow} key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className={`${styles.section} ${styles.altSection}`}>
        <SectionLabel>Dashboard</SectionLabel>
        <SectionTitle>Why AQI matters across every decision layer.</SectionTitle>
        <SectionSubtitle>
          AQI is not just a reading. It is a decision signal for governments, businesses, and
          individuals who need to act on air quality in real time.
        </SectionSubtitle>

        <div className={styles.audienceGrid}>
          {DASHBOARD_AUDIENCES.map((audience) => (
            <article className={styles.audienceCard} key={audience.title}>
              <div className={styles.audienceTitle}>{audience.title}</div>
              <p className={styles.audienceCopy}>{audience.copy}</p>
              <div className={styles.audiencePoints}>
                {audience.points.map((point) => (
                  <span key={point} className={styles.pointTag}>{point}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="upcoming" className={styles.section}>
        <SectionLabel>Upcoming</SectionLabel>
        <SectionTitle>What’s coming next in BREEZO.</SectionTitle>
        <SectionSubtitle>
          The next stage expands the device network, deepens AQI intelligence, and prepares the
          operator ecosystem for broader adoption.
        </SectionSubtitle>

        <div className={styles.upcomingList}>
          {UPCOMING_ITEMS.map((item, index) => (
            <article className={styles.upcomingCard} key={item.title}>
              <div className={styles.upcomingIndex}>{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h3 className={styles.upcomingTitle}>{item.title}</h3>
                <p className={styles.upcomingDetail}>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
