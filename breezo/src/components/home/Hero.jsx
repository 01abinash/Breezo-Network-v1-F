import { useNavigate } from 'react-router-dom'
import { useMultiCityAQI } from '../../hooks/useAirQuality'
import { Chip, LivePill } from '../ui/UI'
import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const HERO_CITIES = ['ktm', 'pkr', 'del', 'mum']
const CITY_LABELS = { ktm: 'Kathmandu', pkr: 'Pokhara', del: 'Delhi', mum: 'Mumbai' }

function AQICell({ cityKey, data }) {
  const info = data?.info
  return (
    <div className={styles.cityCell}>
      <div className={styles.cityName}>{CITY_LABELS[cityKey]}</div>
      {data ? (
        <>
          <div className={styles.cityAQI} style={{ color: info.color }}>
            {data.aqi}
          </div>
          <span className={styles.aqiPill} style={{ background: info.bgColor, color: info.color, border: `1px solid ${info.borderColor}` }}>
            {info.label.split(' ')[0]}
          </span>
        </>
      ) : (
        <div className={styles.cityAQI} style={{ color: 'var(--t3)' }}>—</div>
      )}
    </div>
  )
}

function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const nodes = [
      { label: 'KTM', r: 80, angle: 0.3, speed: 0.0008 },
      { label: 'PKR', r: 80, angle: 1.8, speed: 0.0008 },
      { label: 'DEL', r: 120, angle: 0.9, speed: 0.0005 },
      { label: 'MUM', r: 120, angle: 2.4, speed: 0.0005 },
      { label: 'S7',  r: 60,  angle: 4.2, speed: 0.0012 },
      { label: 'S12', r: 100, angle: 3.5, speed: 0.0007 },
      { label: 'API', r: 90,  angle: 5.8, speed: 0.0009 },
    ]

    let tick = 0
    function draw() {
      const w = canvas.width, h = canvas.height
      const cx = w / 2, cy = h / 2
      ctx.clearRect(0, 0, w, h)

      // orbit rings
      ctx.strokeStyle = 'rgba(56,189,248,0.07)'
      ctx.lineWidth = 1
      ;[60, 100, 140].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      })

      nodes.forEach(n => {
        const a = n.angle + tick * n.speed
        const x = cx + Math.cos(a) * n.r
        const y = cy + Math.sin(a) * n.r

        // connector
        ctx.setLineDash([3, 6])
        ctx.strokeStyle = 'rgba(56,189,248,0.2)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke()
        ctx.setLineDash([])

        // node circle
        ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56,189,248,0.1)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(56,189,248,0.45)'
        ctx.lineWidth = 1.5; ctx.stroke()

        // label
        ctx.fillStyle = 'rgba(56,189,248,0.85)'
        ctx.font = 'bold 7px DM Mono,monospace'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(n.label, x, y)
      })

      // core
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(56,189,248,0.14)'; ctx.fill()
      ctx.strokeStyle = 'rgba(56,189,248,0.65)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = 'rgba(56,189,248,0.9)'
      ctx.font = 'bold 7px DM Mono,monospace'
      ctx.fillText('CORE', cx, cy)

      tick++
      raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className={styles.networkCanvas} />
}

export default function Hero() {
  const navigate = useNavigate()
  const cityData = useMultiCityAQI(HERO_CITIES)
  const ktm = cityData['ktm']

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroGrid} />

      {/* Left content */}
      <div className={`${styles.heroContent} fade-up d1`}>
        <Chip>DePIN · Air Quality · Solana</Chip>
        <h1 className={styles.h1}>
          Turning<br />
          <span className={styles.skyText}>invisible air</span><br />
          <span className={styles.dimText}>into visible truth.</span>
        </h1>
        <p className={styles.heroP}>
          BREEZO Network is a decentralized air quality monitoring infrastructure.
          Community-deployed IoT sensors. Real-time data. Token-incentivized contributors.
          Built for South Asia.
        </p>
        <div className={styles.heroBtns}>
          <button className={styles.btnSky} onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="currentColor"/>
              <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Live Dashboard
          </button>
          <button className={styles.btnGhost} onClick={() => navigate('/network')}>
            Explore Network →
          </button>
        </div>
      </div>

      {/* Right AQI panel */}
      <div className={`${styles.aqiPanel} fade-up d4`}>
        <div className={styles.aqiCard}>
          <div className={styles.aqiCardHeader}>
            <span className={styles.aqiCardTitle}>BREEZO Network · Live</span>
            <LivePill />
          </div>

          <div className={styles.cityGrid}>
            {HERO_CITIES.map(key => (
              <AQICell key={key} cityKey={key} data={cityData[key]} />
            ))}
          </div>

          {/* Kathmandu pollutants */}
          <div className={styles.pollutantBar}>
            {[
              { label: 'PM2.5', value: ktm?.pm25 },
              { label: 'PM10',  value: ktm?.pm10 },
              { label: 'NO₂',   value: ktm?.no2 },
              { label: 'O₃',    value: ktm?.o3 },
              { label: 'CO',    value: ktm?.co },
            ].map(p => (
              <div className={styles.pChip} key={p.label}>
                <span className={styles.pVal}>{p.value != null ? p.value.toFixed(1) : '—'}</span>
                <span className={styles.pName}>{p.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.networkViz}>
            <NetworkCanvas />
          </div>
        </div>
      </div>
    </section>
  )
}
