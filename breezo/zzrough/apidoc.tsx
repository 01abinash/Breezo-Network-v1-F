import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction } from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token'
import {useProgram} from '../hooks/useProgram'
import BN from 'bn.js'
import {
  getTreasuryPDA,
  toBaseUnits,
} from '../solana/program/breezo.method'
import { purchaseCredits } from '../api/apiKey.api' // ← adjust if needed
import idl from '../idl/breezo.json'
import styles from './ApiDocsPage.module.css'

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE    = 'https://api.breezonetwork.xyz/api/v1'
const BREEZO_MINT = new PublicKey('soQUnxjoEMCMxBroyS4AvrtVn2JCtPZnR3N53NA5AvU')

// ─── STATIC DATA ───────────────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'auth',      label: 'Auth'      },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'pricing',   label: 'Pricing'   },
  { id: 'examples',  label: 'Examples'  },
]

const ENDPOINTS = [
  {
    id: 'current',
    title: 'Get Current Conditions',
    method: 'GET',
    path: '/weather/current',
    desc: 'Returns the latest air quality and weather reading from a specific node.',
    params: [
      { name: 'nodeId', required: true,  desc: 'Unique identifier of the target node' },
    ],
    request: `GET ${API_BASE}/weather/current?nodeId=node_abc123\nx-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "data": {
    "nodeId": "node_abc123",
    "temperature": 28.5,
    "humidity": 64,
    "pm25": 12.4,
    "pm10": 18.7,
    "aqi": 90,
    "aqiLevel": "MODERATE",
    "timestamp": "2026-04-28T09:12:00Z"
  }
}`,
  },
  {
    id: 'nearby',
    title: 'Get Nearby Nodes',
    method: 'GET',
    path: '/weather/nearby',
    desc: 'Returns readings from all active nodes within a given radius of a coordinate.',
    params: [
      { name: 'lat',    required: true,  desc: 'Latitude of the center point' },
      { name: 'lng',    required: true,  desc: 'Longitude of the center point' },
      { name: 'radius', required: false, desc: 'Search radius in km (default: 5)' },
    ],
    request: `GET ${API_BASE}/weather/nearby?lat=27.7172&lng=85.3240&radius=5\nx-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "count": 2,
  "data": [
    {
      "nodeId": "node_abc123",
      "distance": 1.2,
      "temperature": 28.1,
      "pm25": 11.0,
      "aqi": 84,
      "aqiLevel": "GOOD"
    }
  ]
}`,
  },
  {
    id: 'history',
    title: 'Get Historical Data',
    method: 'GET',
    path: '/weather/history',
    desc: 'Returns historical environmental readings for a node, aggregated by day.',
    params: [
      { name: 'nodeId', required: true,  desc: 'Target node identifier' },
      { name: 'days',   required: false, desc: 'Days to look back (default: 7, max: 30)' },
      { name: 'from',   required: false, desc: 'ISO date string — start of range' },
      { name: 'to',     required: false, desc: 'ISO date string — end of range' },
    ],
    request: `GET ${API_BASE}/weather/history?nodeId=node_abc123&days=7\nx-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "nodeId": "node_abc123",
  "data": [
    {
      "date": "2026-04-21",
      "avgTemperature": 27.2,
      "avgPm25": 10.8,
      "avgAqi": 101,
      "readings": 144
    }
  ]
}`,
  },
  {
    id: 'nodes',
    title: 'List All Nodes',
    method: 'GET',
    path: '/nodes',
    desc: 'Returns a list of all active Breezo nodes and their last known status.',
    params: [
      { name: 'status', required: false, desc: 'Filter: active | inactive | all' },
      { name: 'limit',  required: false, desc: 'Max results to return (default: 50)' },
    ],
    request: `GET ${API_BASE}/nodes?status=active&limit=20\nx-api-key: YOUR_API_KEY`,
    response: `{
  "success": true,
  "count": 1,
  "data": [
    {
      "nodeId": "node_abc123",
      "lat": 27.7172,
      "lng": 85.3240,
      "status": "active",
      "lastSeen": "2026-04-28T09:12:00Z"
    }
  ]
}`,
  },
]

// creditAmount = API request credits the plan grants (sent to backend)
const PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    tokens: 50,          // BREEZO tokens user pays
    requests: '10,000',
    creditAmount: 10000, // API credits backend will activate
    detail: 'Current conditions, 7-day history, standard rate limit.',
    highlight: false,
    cta: 'Buy Basic Plan',
  },
  {
    id: 'intermediate',
    name: 'Intermediate Plan',
    tokens: 250,
    requests: '100,000',
    creditAmount: 100000,
    detail: 'Full history access, nearby nodes API, priority rate limit.',
    highlight: true,
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    tokens: 1000,
    requests: 'Unlimited',
    creditAmount: null,   // handled via sales
    detail: 'SLA support, dedicated infrastructure, custom limits.',
    highlight: false,
    cta: 'Contact Sales',
  },
]

const EXAMPLES = [
  {
    id: 'js',
    title: 'JavaScript',
    code: `fetch("${API_BASE}/weather/current?nodeId=node_abc123", {
  headers: { "x-api-key": "YOUR_API_KEY" }
})
  .then(r => r.json())
  .then(({ data }) => console.log(\`AQI: \${data.aqi} — \${data.aqiLevel}\`))`,
  },
  {
    id: 'py',
    title: 'Python',
    code: `import requests

r = requests.get(
    "${API_BASE}/weather/current",
    params={"nodeId": "node_abc123"},
    headers={"x-api-key": "YOUR_API_KEY"}
)
data = r.json()["data"]
print(f"AQI: {data['aqi']} — {data['aqiLevel']}")`,
  },
]

// ─── COPY HOOK ─────────────────────────────────────────────────────────────────
function useCopy() {
  const [copiedKey, setCopiedKey] = useState('')
  const copy = async (id, text) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(c => (c === id ? '' : c)), 1800)
  }
  return { copiedKey, copy }
}

// ─── REUSABLE COMPONENTS ───────────────────────────────────────────────────────
function CopyButton({ id, text, copy, copiedKey, label = 'Copy' }) {
  return (
    <button className={styles.copyBtn} onClick={() => copy(id, text)}>
      {copiedKey === id ? '✓ Copied' : label}
    </button>
  )
}

function CodeBlock({ id, title, code, copy, copiedKey }) {
  return (
    <div className={styles.codeCard}>
      <div className={styles.codeHeader}>
        <span>{title}</span>
        <CopyButton id={id} text={code} copy={copy} copiedKey={copiedKey} />
      </div>
      <pre className={styles.codeBlock}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ─── BUY CREDITS MODAL ─────────────────────────────────────────────────────────
function BuyCreditsModal({ plan, onClose, authToken }) {
  const { connection } = useConnection()
  const wallet         = useWallet()
  const program = useProgram()
  const { publicKey, connected } = wallet

  const [step,   setStep]   = useState('confirm') // confirm|approving|purchasing|done|error
  const [txSig,  setTxSig]  = useState('')
  const [errMsg, setErrMsg] = useState('')



  const handleBuy = async () => {
    if (!program || !publicKey) return
    try {
      setStep('approving')

      const treasuryAuthority    = getTreasuryPDA()
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        BREEZO_MINT, treasuryAuthority, true
      )
      const userTokenAccount = await getAssociatedTokenAddress(BREEZO_MINT, publicKey)

      // Auto-create user ATA if it doesn't exist yet
      try {
        await getAccount(connection, userTokenAccount)
      } catch {
        console.log('[buy] User ATA missing — creating…')
        const createIx = createAssociatedTokenAccountInstruction(
          publicKey, userTokenAccount, publicKey, BREEZO_MINT,
          TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        )
        const { blockhash } = await connection.getLatestBlockhash()
        const tx = new Transaction()
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey
        tx.add(createIx)
        const signed = await wallet.signTransaction(tx)
        const atasSig = await connection.sendRawTransaction(signed.serialize())
        await connection.confirmTransaction(atasSig, 'confirmed')
        console.log('[buy] User ATA created')
      }

      // toBaseUnits from breezo.method.js: humanAmount → BigInt raw units
      const rawBigInt = toBaseUnits(plan.tokens)
      const amount    = new BN(rawBigInt.toString())

      console.log('[buy] human:', plan.tokens, 'BREEZO')
      console.log('[buy] raw:',   rawBigInt.toString())

      setStep('purchasing')

      // ── Call buy_product on-chain ──
      const sig = await program.methods
        .buyProduct(amount)
        .accounts({
          user:                 publicKey,
          mint:                 BREEZO_MINT,
          userTokenAccount:     userTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          tokenProgram:         TOKEN_PROGRAM_ID,
        })
        .rpc()

      console.log('[buy] TX sig:', sig)
      setTxSig(sig)

      // ── Call backend after on-chain success ──
      // token      = how many BREEZO tokens were spent
      // payload    = walletAddress, creditAmount, plan, tokens, txSignature
alert('Payent Sucessfull')

      setStep('done')
    } catch (err) {
      console.error('[buy]', err)
      setErrMsg(err?.message || 'Transaction failed')
      setStep('error')
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(9,11,16,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, width: '100%', maxWidth: 460,
        padding: 36, position: 'relative',
        boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
        color: '#e2e8f0',
        fontFamily: 'inherit',
      }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#64748b', borderRadius: 10,
            width: 32, height: 32, fontSize: 15,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* ── CONFIRM STATE ── */}
        {step === 'confirm' && (
          <>
            <div style={{
              fontSize: 10, letterSpacing: '0.14em', fontWeight: 700,
              color: 'var(--sky,#38bdf8)', marginBottom: 12,
            }}>PURCHASE PLAN</div>

            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.03em', color: '#f1f5f9' }}>
              {plan.name}
            </h2>
            <p style={{ color: '#475569', fontSize: 14, margin: '0 0 24px' }}>
              {plan.requests} API requests / month
            </p>

            {/* Summary box */}
            <div style={{
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.18)',
              borderRadius: 16, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14 }}>
                <span style={{ color: '#64748b', fontSize: 14 }}>You pay</span>
                <span style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800,
                  letterSpacing: '-0.03em' }}>
                  ◈ {plan.tokens} BREEZO
                </span>
              </div>
              <div style={{
                paddingTop: 14,
                borderTop: '1px solid rgba(56,189,248,0.12)',
                fontSize: 13,
              }}>
                <div style={{ color: '#64748b', marginBottom: 4 }}>
                  You receive:{' '}
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                    {plan.requests} API requests
                  </span>
                </div>
                <div style={{ color: '#475569' }}>{plan.detail}</div>
              </div>
            </div>

            {/* Info */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 12, color: '#475569', marginBottom: 20,
            }}>
              ⛓ Payment settles on-chain. Quota activates after confirmation.
            </div>

            {!connected ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                  Connect your wallet to purchase
                </p>
                <WalletMultiButton />
              </div>
            ) : (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '9px 14px',
                  fontSize: 12, color: '#475569',
                  fontFamily: 'monospace', marginBottom: 16,
                }}>
                  Wallet: {publicKey?.toBase58().slice(0,8)}…{publicKey?.toBase58().slice(-6)}
                </div>
                <button
                  onClick={handleBuy}
                  style={{
                    width: '100%', padding: '14px 0',
                    background: 'linear-gradient(135deg,rgba(56,189,248,1),rgba(14,165,233,0.94))',
                    border: 'none', borderRadius: 14,
                    color: '#04131a', fontSize: 15, fontWeight: 800,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 8px 24px rgba(56,189,248,0.22)',
                    transition: 'opacity .15s',
                  }}
                >
                  Pay ◈ {plan.tokens} BREEZO
                </button>
              </>
            )}
          </>
        )}

        {/* ── IN PROGRESS STATE ── */}
        {(step === 'approving' || step === 'purchasing') && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <style>{`@keyframes breezospin{to{transform:rotate(360deg)}}`}</style>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              margin: '0 auto 24px',
              border: '3px solid rgba(56,189,248,0.15)',
              borderTopColor: '#38bdf8',
              animation: 'breezospin 0.85s linear infinite',
            }} />
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>
              {step === 'approving' ? 'Waiting for wallet approval' : 'Processing on-chain'}
            </h3>
            <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
              {step === 'approving'
                ? 'Approve the transaction in your wallet…'
                : 'Sending to Solana — do not close this window…'}
            </p>
          </div>
        )}

        {/* ── DONE STATE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              margin: '0 auto 20px',
              background: 'rgba(45,212,191,0.1)',
              border: '2px solid rgba(45,212,191,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#2dd4bf',
            }}>✓</div>
            <h3 style={{ color: '#2dd4bf', margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              Purchase Complete!
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 6px' }}>
              {plan.name} is now active on your account.
            </p>
            <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>
              {plan.requests} requests have been credited.
            </p>
            {txSig && (
              <a
                href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
                target="_blank" rel="noreferrer"
                style={{ color: '#38bdf8', fontSize: 12, display: 'block',
                  marginBottom: 20, textDecoration: 'none' }}
              >
                View on Solscan ↗
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px 0',
                background: 'rgba(45,212,191,0.1)',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: 14, color: '#2dd4bf',
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Done</button>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              margin: '0 auto 20px',
              background: 'rgba(248,113,113,0.1)',
              border: '2px solid rgba(248,113,113,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#f87171',
            }}>✕</div>
            <h3 style={{ color: '#f87171', margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
              Transaction Failed
            </h3>
            <p style={{
              color: '#475569', fontSize: 13,
              margin: '0 0 24px', wordBreak: 'break-word',
              maxHeight: 80, overflowY: 'auto',
            }}>
              {errMsg}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('confirm')}
                style={{
                  flex: 1, padding: '11px 0',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: '#94a3b8',
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Try Again</button>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '11px 0',
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 12, color: '#f87171',
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState(ENDPOINTS[0].id)
  const [buyPlan,  setBuyPlan]  = useState(null)
  const { copiedKey, copy }     = useCopy()

  // Pull auth token from wherever your app stores it
  const authToken =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''

  return (
    <div className={styles.page}>

      {buyPlan && (
        <BuyCreditsModal
          plan={buyPlan}
          authToken={authToken}
          onClose={() => setBuyPlan(null)}
        />
      )}

      <div className={styles.layout}>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarLabel}>Breezo API Docs</div>
            <nav className={styles.sidebarNav}>
              {SIDEBAR_LINKS.map(item => (
                <a key={item.id} href={`#${item.id}`} className={styles.sidebarLink}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className={styles.content}>

          {/* ── OVERVIEW ── */}
          <section id="overview" className={styles.section}>
            <div className={styles.hero}>
              <div className={styles.heroLabel}>Developer Platform</div>
              <h1 className={styles.heroTitle}>Breezo API<br />Documentation</h1>
              <p className={styles.heroDesc}>
                Access live environmental intelligence from the Breezo DePIN sensor
                network. Query real-time AQI, nearby nodes, and historical data —
                authenticated with your BREEZO token-powered API key.
              </p>
              <div className={styles.heroMeta}>
                <div className={styles.metaCard}>
                  <span>What it provides</span>
                  <strong>Live AQI, temperature, PM2.5, PM10, and historical data</strong>
                </div>
                <div className={styles.metaCard}>
                  <span>Who it's for</span>
                  <strong>Apps, dashboards, research pipelines, and institutional reporting</strong>
                </div>
              </div>
              <div className={styles.heroActions}>
                <a href="#pricing" className={styles.primaryAction}>Get API Access</a>
                <a href="#endpoints" className={styles.secondaryAction}>Browse Endpoints →</a>
              </div>
            </div>
          </section>

          {/* ── AUTH ── */}
          <section id="auth" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Authentication</div>
              <h2 className={styles.sectionTitle}>Secure every request</h2>
              <p className={styles.sectionDesc}>
                Every request requires an API key in the{' '}
                <code>x-api-key</code> header. Missing or invalid keys
                return <code>401 Unauthorized</code>.
              </p>
            </div>

            <div className={styles.authGrid}>
              <div className={styles.authCard}>
                <div className={styles.authLabel}>Required Header</div>
                <div className={styles.authHeaderRow}>
                  <code className={styles.authHeaderValue}>x-api-key: YOUR_API_KEY</code>
                  <CopyButton
                    id="auth-header"
                    text="x-api-key: YOUR_API_KEY"
                    copy={copy}
                    copiedKey={copiedKey}
                  />
                </div>
              </div>
              <div className={styles.authNotes}>
                <div className={styles.noteItem}>🔑 Every request requires an API key</div>
                <div className={styles.noteItem}>📨 Pass via the <code>x-api-key</code> header</div>
                <div className={styles.noteItem}>🔒 Never expose your key in client-side code</div>
                <div className={styles.noteItem}>🔄 Regenerate keys anytime from the dashboard</div>
              </div>
            </div>
          </section>

          {/* ── ENDPOINTS ── */}
          <section id="endpoints" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>API Reference</div>
              <h2 className={styles.sectionTitle}>Live endpoint reference</h2>
              <p className={styles.sectionDesc}>
                Expand each endpoint for query parameters, example request, and response.
              </p>
            </div>

            <div className={styles.endpointList}>
              {ENDPOINTS.map(ep => {
                const isOpen = expanded === ep.id
                return (
                  <article className={styles.endpointCard} key={ep.id}>
                    <button
                      className={styles.endpointToggle}
                      type="button"
                      onClick={() => setExpanded(isOpen ? '' : ep.id)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.endpointLead}>
                        <span className={styles.methodPill}>{ep.method}</span>
                        <div>
                          <div className={styles.endpointTitle}>{ep.title}</div>
                          <div className={styles.endpointPath}>{ep.path}</div>
                        </div>
                      </div>
                      <span className={styles.endpointChevron}>{isOpen ? '−' : '+'}</span>
                    </button>

                    {isOpen && (
                      <div className={styles.endpointBody}>
                        <p style={{ color: 'var(--t2)', fontSize: 14, margin: '16px 0' }}>
                          {ep.desc}
                        </p>

                        <div className={styles.endpointMeta}>
                          {/* URL block */}
                          <div className={styles.metaBlock}>
                            <span className={styles.metaLabel}>Endpoint URL</span>
                            <div className={styles.inlineCopyRow}>
                              <code className={styles.inlineCode}>
                                {API_BASE}{ep.path}
                              </code>
                              <CopyButton
                                id={`${ep.id}-url`}
                                text={`${API_BASE}${ep.path}`}
                                copy={copy}
                                copiedKey={copiedKey}
                              />
                            </div>
                          </div>

                          {/* Params block */}
                          <div className={styles.metaBlock}>
                            <span className={styles.metaLabel}>Query Parameters</span>
                            <div style={{
                              marginTop: 12, display: 'flex',
                              flexDirection: 'column', gap: 7,
                            }}>
                              {ep.params.map(p => (
                                <div key={p.name} style={{
                                  display: 'flex', alignItems: 'baseline',
                                  flexWrap: 'wrap', gap: 8,
                                  padding: '8px 12px',
                                  background: 'rgba(255,255,255,0.03)',
                                  borderRadius: 10,
                                  border: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                  <code style={{ color: 'var(--sky,#38bdf8)',
                                    fontSize: 12, flexShrink: 0 }}>
                                    {p.name}
                                  </code>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: p.required ? '#f87171' : 'var(--t3,#475569)',
                                    background: p.required
                                      ? 'rgba(248,113,113,0.1)'
                                      : 'rgba(255,255,255,0.04)',
                                    padding: '2px 7px', borderRadius: 5, flexShrink: 0,
                                  }}>
                                    {p.required ? 'required' : 'optional'}
                                  </span>
                                  <span style={{ color: 'var(--t3,#475569)', fontSize: 13 }}>
                                    {p.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Request + Response */}
                        <div className={styles.endpointExamples}>
                          <CodeBlock
                            id={`${ep.id}-request`}
                            title="Example Request"
                            code={ep.request}
                            copy={copy}
                            copiedKey={copiedKey}
                          />
                          <CodeBlock
                            id={`${ep.id}-response`}
                            title="Example Response"
                            code={ep.response}
                            copy={copy}
                            copiedKey={copiedKey}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            {/* HTTP status codes */}
            <div style={{ marginTop: 24 }}>
              <div className={styles.sectionKicker} style={{ marginBottom: 14 }}>
                HTTP Status Codes
              </div>
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {[
                  { code: '200', label: 'OK',           c: '#2dd4bf', desc: 'Request succeeded.' },
                  { code: '400', label: 'Bad Request',  c: '#fbbf24', desc: 'Missing or invalid parameters.' },
                  { code: '401', label: 'Unauthorized', c: '#fbbf24', desc: 'API key missing, invalid, or expired.' },
                  { code: '403', label: 'Forbidden',    c: '#f87171', desc: 'Plan limit exceeded for this billing period.' },
                  { code: '404', label: 'Not Found',    c: '#f87171', desc: 'Node ID does not exist.' },
                  { code: '429', label: 'Rate Limited', c: '#f87171', desc: 'Too many requests — implement backoff.' },
                  { code: '500', label: 'Server Error', c: '#f87171', desc: 'Something went wrong on our end.' },
                ].map((e, i) => (
                  <div key={e.code} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '11px 20px', fontSize: 13,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    <code style={{ color: e.c, fontWeight: 700, width: 36, flexShrink: 0 }}>
                      {e.code}
                    </code>
                    <span style={{ color: 'var(--t1,#e2e8f0)', width: 110, flexShrink: 0 }}>
                      {e.label}
                    </span>
                    <span style={{ color: 'var(--t3,#475569)' }}>{e.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="pricing" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Pricing</div>
              <h2 className={styles.sectionTitle}>Token-based API access</h2>
              <p className={styles.sectionDesc}>
                API access is priced in BREEZO tokens. Pay on-chain — your quota
                activates immediately after on-chain confirmation.
              </p>
            </div>

            <div className={styles.pricingGrid}>
              {PLANS.map(plan => (
                <article
                  key={plan.id}
                  className={`${styles.pricingCard} ${plan.highlight ? styles.pricingFeatured : ''}`}
                >
                  <div className={styles.pricingName}>{plan.name}</div>
                  <div className={styles.pricingRequests}>{plan.requests} req/mo</div>
                  <p className={styles.pricingDetail}>{plan.detail}</p>
                  <div className={styles.tokenPrice}>
                    <span className={styles.tokenIcon}>◈</span>
                    <strong>{plan.tokens} BREEZO</strong>
                  </div>

                  {plan.id === 'enterprise' ? (
                    <Link to="/about" className={styles.planBtn}>{plan.cta}</Link>
                  ) : (
                    <button
                      onClick={() => setBuyPlan(plan)}
                      className={styles.planBtn}
                      style={{
                        cursor: 'pointer',
                        ...(plan.highlight
                          ? {
                              background: 'linear-gradient(135deg,rgba(56,189,248,1),rgba(14,165,233,0.94))',
                              color: '#04131a',
                              border: 'none',
                              boxShadow: '0 8px 22px rgba(56,189,248,0.22)',
                            }
                          : {}),
                      }}
                    >
                      {plan.cta}
                    </button>
                  )}
                </article>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: '14px 20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, fontSize: 13,
              color: 'var(--t3,#475569)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span>ℹ️</span>
              <span>
                Payments are processed via the Breezo smart contract on Solana.
                BREEZO tokens transfer from your wallet to the treasury on-chain,
                and your API request quota is activated on the backend instantly
                after confirmation.
              </span>
            </div>
          </section>

          {/* ── EXAMPLES ── */}
          <section id="examples" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionKicker}>Usage Examples</div>
              <h2 className={styles.sectionTitle}>Integrate in minutes</h2>
              <p className={styles.sectionDesc}>
                Copy-paste examples for common languages.
                Replace <code>YOUR_API_KEY</code> with your actual key.
              </p>
            </div>

            <div className={styles.examplesGrid}>
              {EXAMPLES.map(ex => (
                <CodeBlock
                  key={ex.id}
                  id={ex.id}
                  title={ex.title}
                  code={ex.code}
                  copy={copy}
                  copiedKey={copiedKey}
                />
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: '14px 20px',
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.18)',
              borderRadius: 14, fontSize: 13,
              color: 'var(--t3,#64748b)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span>⚡</span>
              <span>
                Rate limits — Basic: 60 req/min · Pro: 300 req/min · Enterprise: custom.
                Exceeding your limit returns{' '}
                <code style={{ color: '#fbbf24' }}>429 Too Many Requests</code>.
                Implement exponential backoff for retries.
              </span>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
