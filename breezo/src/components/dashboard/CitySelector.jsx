import { CITIES } from '../../lib/aqi'
import styles from './CitySelector.module.css'

const DISPLAY_CITIES = ['ktm', 'pkr', 'del', 'mum', 'lko', 'dac']

export default function CitySelector({ activeCity, onChange }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>City</span>
      <div className={styles.pills}>
        {DISPLAY_CITIES.map((key) => (
          <button
            key={key}
            className={`${styles.pill} ${activeCity === key ? styles.active : ''}`}
            onClick={() => onChange(key)}
          >
            {CITIES[key].label}
          </button>
        ))}
      </div>
    </div>
  )
}
