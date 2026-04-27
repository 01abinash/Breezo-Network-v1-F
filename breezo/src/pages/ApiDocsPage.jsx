import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ApiDocsPage.module.css'

const API_BASE = 'https://api.breezonetwork.xyz/api/v1'

const SIDEBAR_LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Auth' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'examples', label: 'Examples' },
]

const ENDPOINTS = [
  {
    id: 'current',
    title: 'Get Current Weather',
    method: 'GET',
    path: '/weather/current',
    params: ['nodeId (required)'],
    request: `GET ${API_BASE}/weather/current?nodeId=node_123
x-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "data": {
    "temperature": 28.5,
    "aqi": 90
  }
}`,
  },
  {
    id: 'nearby',
    title: 'Get Nearby Weather',
    method: 'GET',
    path: '/weather/nearby',
    params: ['lat (required)', 'lng (required)', 'radius (optional)'],
    request: `GET ${API_BASE}/weather/nearby?lat=27.7172&lng=85.3240&radius=5
x-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "data": [
    {
      "nodeId": "node_123",
      "temperature": 28.1,
      "aqi": 84
    }
  ]
}`,
  },
  {
    id: 'history',
    title: 'Get Weather History',
    method: 'GET',
    path: '/weather/history',
    params: ['nodeId (required)', 'days (optional)'],
    request: `GET ${API_BASE}/weather/history?nodeId=node_123&days=7
x-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "data": [
    {
      "date": "2026-04-21",
      "temperature": 27.2,
      "aqi": 101
    }
  ]
}`,
  },
]

const PRICING = [
  {
    id: 'basic',
    tone: 'basic',
    name: 'Basic Plan',
    requests: '10,000 requests/month',
    detail: 'Limited historical data',
    price: '50 Breezo Tokens',
    cta: 'Buy Now with Breezo Token',
    href: '/api-keys',
  },
  {
    id: 'intermediate',
    tone: 'featured',
    name: 'Intermediate Plan',
    requests: '100,000 requests/month',
    detail: 'Full history access and priority API',
    price: '250 Breezo Tokens',
    cta: 'Upgrade Now',
    href: '/api-keys',
  },
  {
    id: 'enterprise',
    tone: 'enterprise',
    name: 'Enterprise Plan',
    requests: 'Unlimited / custom limits',
    detail: 'SLA support and dedicated infrastructure',
    price: 'Custom (1000+ Tokens)',
    cta: 'Contact Sales',
    href: '/about',
  },
]

const JS_EXAMPLE = `fetch("${API_BASE}/weather/current?nodeId=node_123", {
  headers: {
    "x-api-key": "YOUR_API_KEY"
  }
})`

const PY_EXAMPLE = `import requests

res = requests.get(
  "${API_BASE}/weather/current",
  headers={"x-api-key": "YOUR_API_KEY"}
)`

function CopyButton({ onClick, copied, label = 'Copy' }) {
  return (
    <button className={styles.copyBtn} type="button" onClick={onClick}>
      {copied ? 'Copied' : label}
    </button>
  )
}

function CodeBlock({ title, code, copied, onCopy }) {
  return (
    <div className={styles.codeCard}>
      <div className={styles.codeHeader}>
        <span>{title}</span>
        <CopyButton onClick={onCopy} copied={copied} />
      </div>
      <pre className={styles.codeBlock}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState(ENDPOINTS[0].id)
  const [copiedKey, setCopiedKey] = useState('')

  const exampleCards = useMemo(
    () => [
      { id: 'js', title: 'JavaScript', code: JS_EXAMPLE },
      { id: 'py', title: 'Python', code: PY_EXAMPLE },
    ],
    []
  )

  async function handleCopy(id, value) {
    await navigator.clipboard.writeText(value)
    setCopiedKey(id)
    window.setTimeout(() => {
      setCopiedKey((current) => (current === id ? '' : current))
    }, 1600)
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarLabel}>Breezo API Docs</div>
            <nav className={styles.sidebarNav} aria-label="API documentation sections">
              {SIDEBAR_LINKS.map((item) => (
                <a key={item.id} href={`#${item.id}`} className={styles.sidebarLink}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className={styles.content}>
          <section id="overview" className={styles.section}>
            <div className={styles.hero}>
              <div className={styles.heroLabel}>Developer Platform</div>
              <h1 className={styles.heroTitle}>Breezo API Documentation</h1>
              <p className={styles.heroDesc}>
                Breezo API gives developers, researchers, businesses, and public-sector teams
                access to live environmental intelligence from the Breezo air-quality device network.
                Use it to query current conditions, nearby node readings, and historical weather and
                AQI data.
              </p>

              <div className={styles.heroMeta}>
                <div className={styles.metaCard}>
                  <span>What it provides</span>
                  <strong>Live AQI, temperature, history, and nearby node data</strong>
                </div>
                <div className={styles.metaCard}>
                  <span>Who it is for</span>
                  <strong>Apps, dashboards, research pipelines, and institutional reporting</strong>
                </div>
              </div>

              <div className={styles.heroActions}>
                <Link to="/api-keys" className={styles.primaryAction}>Get API Key</Link>
                <a href="#endpoints" className={styles.secondaryAction}>Browse Endpoints</a>
              </div>
            </div>
          </section>

          <section id="auth" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Authentication</div>
              <h2 className={styles.sectionTitle}>Secure every request with your API key.</h2>
              <p className={styles.sectionDesc}>
                Every Breezo API request requires an API key passed in the request headers.
                Missing or invalid keys will return a `401 Unauthorized` response.
              </p>
            </div>

            <div className={styles.authGrid}>
              <div className={styles.authCard}>
                <div className={styles.authLabel}>Required Header</div>
                <div className={styles.authHeaderRow}>
                  <code className={styles.authHeaderValue}>x-api-key: YOUR_API_KEY</code>
                  <CopyButton
                    onClick={() => handleCopy('auth-header', 'x-api-key: YOUR_API_KEY')}
                    copied={copiedKey === 'auth-header'}
                  />
                </div>
              </div>

              <div className={styles.authNotes}>
                <div className={styles.noteItem}>Every request requires an API key.</div>
                <div className={styles.noteItem}>Keys must be sent in request headers.</div>
                <div className={styles.noteItem}>Requests without a key return `401`.</div>
              </div>
            </div>
          </section>

          <section id="endpoints" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>API Reference</div>
              <h2 className={styles.sectionTitle}>Live endpoint reference</h2>
              <p className={styles.sectionDesc}>
                Explore the current Breezo API endpoints for device-backed air quality and weather
                access. Expand each endpoint for query parameters, sample request, and response.
              </p>
            </div>

            <div className={styles.endpointList}>
              {ENDPOINTS.map((endpoint) => {
                const isOpen = expanded === endpoint.id
                const endpointUrl = `${API_BASE}${endpoint.path}`

                return (
                  <article className={styles.endpointCard} key={endpoint.id}>
                    <button
                      className={styles.endpointToggle}
                      type="button"
                      onClick={() => setExpanded(isOpen ? '' : endpoint.id)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.endpointLead}>
                        <span className={styles.methodPill}>{endpoint.method}</span>
                        <div>
                          <div className={styles.endpointTitle}>{endpoint.title}</div>
                          <div className={styles.endpointPath}>{endpoint.path}</div>
                        </div>
                      </div>
                      <span className={styles.endpointChevron}>{isOpen ? '−' : '+'}</span>
                    </button>

                    {isOpen && (
                      <div className={styles.endpointBody}>
                        <div className={styles.endpointMeta}>
                          <div className={styles.metaBlock}>
                            <span className={styles.metaLabel}>Endpoint URL</span>
                            <div className={styles.inlineCopyRow}>
                              <code className={styles.inlineCode}>{endpointUrl}</code>
                              <CopyButton
                                onClick={() => handleCopy(`${endpoint.id}-url`, endpointUrl)}
                                copied={copiedKey === `${endpoint.id}-url`}
                              />
                            </div>
                          </div>

                          <div className={styles.metaBlock}>
                            <span className={styles.metaLabel}>Query Params</span>
                            <ul className={styles.paramList}>
                              {endpoint.params.map((param) => (
                                <li key={param}>{param}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className={styles.endpointExamples}>
                          <CodeBlock
                            title="Example Request"
                            code={endpoint.request}
                            copied={copiedKey === `${endpoint.id}-request`}
                            onCopy={() => handleCopy(`${endpoint.id}-request`, endpoint.request)}
                          />
                          <CodeBlock
                            title="Example Response"
                            code={endpoint.response}
                            copied={copiedKey === `${endpoint.id}-response`}
                            onCopy={() => handleCopy(`${endpoint.id}-response`, endpoint.response)}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>

          <section id="pricing" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Pricing</div>
              <h2 className={styles.sectionTitle}>Token-based API access plans</h2>
              <p className={styles.sectionDesc}>
                Breezo API access is priced in Breezo Tokens, making request usage and access
                tiers easy to manage from the same operator stack.
              </p>
            </div>

            <div className={styles.pricingGrid}>
              {PRICING.map((plan) => (
                <article
                  key={plan.id}
                  className={`${styles.pricingCard} ${plan.tone === 'featured' ? styles.pricingFeatured : ''}`}
                >
                  <div className={styles.pricingName}>{plan.name}</div>
                  <div className={styles.pricingRequests}>{plan.requests}</div>
                  <p className={styles.pricingDetail}>{plan.detail}</p>
                  <div className={styles.tokenPrice}>
                    <span className={styles.tokenIcon}>◈</span>
                    <strong>{plan.price}</strong>
                  </div>
                  <Link to={plan.href} className={styles.planBtn}>
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section id="examples" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Usage Examples</div>
              <h2 className={styles.sectionTitle}>Start integrating in minutes</h2>
              <p className={styles.sectionDesc}>
                Use the following examples as a starting point for JavaScript and Python
                integrations. Replace the placeholder key with your own generated credential.
              </p>
            </div>

            <div className={styles.examplesGrid}>
              {exampleCards.map((example) => (
                <CodeBlock
                  key={example.id}
                  title={example.title}
                  code={example.code}
                  copied={copiedKey === example.id}
                  onCopy={() => handleCopy(example.id, example.code)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
