import styles from './ForecastRow.module.css'

const WEATHER_ICONS = ['☀️', '⛅', '🌫️', '🌧️', '⛅', '☀️', '🌫️']

export default function ForecastRow({ forecast }) {
  if (!forecast?.length) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>7-Day AQI Forecast</h3>
          <span className={styles.badge}>AI-powered prediction</span>
        </div>
        <div className={styles.loading}>Generating forecast...</div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>7-Day AQI Forecast</h3>
        <span className={styles.badge}>AI-powered prediction</span>
      </div>

      <div className={styles.grid}>
        {forecast.map((day, i) => (
          <div className={styles.dayCard} key={day.dayName}>
            <div className={styles.dayName}>{day.dayName}</div>
            <span className={styles.dayIcon}>{WEATHER_ICONS[i % WEATHER_ICONS.length]}</span>
            <div className={styles.dayAQI} style={{ color: day.info.color }}>
              {day.aqi}
            </div>
            <div className={styles.dayStatus} style={{ color: day.info.color }}>
              {day.info.label.split(' ')[0]}
            </div>
            <div className={styles.dayBar}>
              <div
                className={styles.dayBarFill}
                style={{
                  width: `${Math.min(100, (day.aqi / 300) * 100)}%`,
                  background: day.info.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
