import styles from './HealthCards.module.css'

const CARD_META = [
  { key: 'outdoor',  icon: '🏃', title: 'Outdoor Activity' },
  { key: 'mask',     icon: '😷', title: 'Mask Usage' },
  { key: 'indoor',   icon: '🏠', title: 'Stay Indoors' },
  { key: 'purifier', icon: '💨', title: 'Air Purifier' },
]

export default function HealthCards({ data }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>Health Recommendations</div>
      <div className={styles.grid}>
        {CARD_META.map((card) => (
          <div className={styles.card} key={card.key}>
            <span className={styles.icon}>{card.icon}</span>
            <div className={styles.title}>{card.title}</div>
            <div className={styles.desc}>
              {data?.info?.recommendations?.[card.key] ?? 'Loading...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
