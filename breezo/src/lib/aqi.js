// ─── City definitions ─────────────────────────────────────────────────────────
export const CITIES = {
  ktm: { key: 'ktm', name: 'KATHMANDU, NEPAL',  label: 'Kathmandu', lat: 27.707211258257196, lon: 85.32862162431204 }, 
  patan: { key: 'patan', name: 'PATAN, NEPAL',      label: 'Patan',      lat: 27.67344488290327, lon: 85.32537424684148 },
  jawa:  { key: 'jawa',  name: 'JAWALAKHEL, NEPAL', label: 'Jawalakhel', lat: 27.671905776699937, lon: 85.30820161455541 },
  // del: { key: 'del', name: 'DELHI, INDIA',       label: 'Delhi',     lat: 28.644, lon: 77.216 },
  // mum: { key: 'mum', name: 'MUMBAI, INDIA',      label: 'Mumbai',    lat: 19.076, lon: 72.877 },
  // lko: { key: 'lko', name: 'LAHORE, PAKISTAN',   label: 'Lahore',    lat: 31.549, lon: 74.343 },
  // dac: { key: 'dac', name: 'DHAKA, BANGLADESH',  label: 'Dhaka',     lat: 23.810, lon: 90.412 },
}

// ─── US EPA AQI from PM2.5 ────────────────────────────────────────────────────
export function aqiFromPM25(pm) {
  if (pm == null) return 0
  if (pm <= 12.0)   return Math.round((50  / 12.0)  * pm)
  if (pm <= 35.4)   return Math.round(50  + (50  / 23.4)  * (pm - 12.1))
  if (pm <= 55.4)   return Math.round(100 + (50  / 20.0)  * (pm - 35.5))
  if (pm <= 150.4)  return Math.round(150 + (100 / 94.9)  * (pm - 55.5))
  if (pm <= 250.4)  return Math.round(200 + (100 / 99.9)  * (pm - 150.5))
  if (pm <= 350.4)  return Math.round(300 + (100 / 99.9)  * (pm - 250.5))
  return Math.round(400 + (100 / 99.9) * (pm - 350.5))
}

// ─── AQI category metadata ────────────────────────────────────────────────────
export function getAQIInfo(aqi) {
  if (aqi <= 50) return {
    label: 'Good',
    color: '#4ADE80',
    bgColor: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.3)',
    textColor: '#4ADE80',
    healthTip: 'Air quality is excellent. Perfect for all outdoor activities.',
    recommendations: {
      outdoor:  'All outdoor activities are safe. No restrictions.',
      mask:     'No mask needed. Air quality is good for everyone.',
      indoor:   'Natural ventilation is sufficient. Open windows freely.',
      purifier: 'Air purifiers not necessary. Save energy.',
    },
  }
  if (aqi <= 100) return {
    label: 'Moderate',
    color: '#FCD34D',
    bgColor: 'rgba(252,211,77,0.12)',
    borderColor: 'rgba(252,211,77,0.3)',
    textColor: '#FCD34D',
    healthTip: 'Acceptable air quality. Unusually sensitive individuals should limit prolonged outdoor exertion.',
    recommendations: {
      outdoor:  'Most outdoor activities are OK. Sensitive groups should limit prolonged exertion.',
      mask:     'Masks optional. Recommended for unusually sensitive individuals.',
      indoor:   'Moderate ventilation OK. Consider reducing if sensitive.',
      purifier: 'Optional for sensitive individuals. Not required for general population.',
    },
  }
  if (aqi <= 150) return {
    label: 'Unhealthy for Sensitive Groups',
    color: '#FB923C',
    bgColor: 'rgba(251,146,60,0.12)',
    borderColor: 'rgba(251,146,60,0.3)',
    textColor: '#FB923C',
    healthTip: 'Sensitive groups should reduce outdoor activity. Children and elderly most at risk.',
    recommendations: {
      outdoor:  'Sensitive groups: reduce prolonged outdoor exertion. Others: no restrictions.',
      mask:     'N95 recommended for sensitive groups going outdoors.',
      indoor:   'Sensitive groups should reduce ventilation. General: moderate.',
      purifier: 'Recommended for sensitive groups. Run HEPA purifier if available.',
    },
  }
  if (aqi <= 200) return {
    label: 'Unhealthy',
    color: '#F87171',
    bgColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.3)',
    textColor: '#F87171',
    healthTip: 'Everyone may experience health effects. Avoid prolonged outdoor exertion.',
    recommendations: {
      outdoor:  'Everyone: reduce outdoor activity. Avoid prolonged or heavy exertion.',
      mask:     'Wear N95 mask outdoors. Required for all sensitive groups.',
      indoor:   'Keep windows closed. Run air conditioning if available.',
      purifier: 'Run HEPA air purifier. Keep it on throughout the day.',
    },
  }
  if (aqi <= 300) return {
    label: 'Very Unhealthy',
    color: '#E879F9',
    bgColor: 'rgba(232,121,249,0.12)',
    borderColor: 'rgba(232,121,249,0.3)',
    textColor: '#E879F9',
    healthTip: 'Health alert: everyone may experience serious health effects. Stay indoors.',
    recommendations: {
      outdoor:  'Avoid all outdoor activity. Only go out if absolutely necessary.',
      mask:     'N95 mandatory outdoors. Consider upgraded respiratory protection.',
      indoor:   'Seal windows and doors. Use weather stripping if possible.',
      purifier: 'HEPA purifier is essential. Run continuously on highest setting.',
    },
  }
  return {
    label: 'Hazardous',
    color: '#F87171',
    bgColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.3)',
    textColor: '#F87171',
    healthTip: 'Emergency conditions. Entire population is at risk. Remain indoors with all openings sealed.',
    recommendations: {
      outdoor:  'Emergency — do not go outdoors. Health risk is severe for everyone.',
      mask:     'Full respirator required if outdoor exposure is unavoidable.',
      indoor:   'Complete isolation. Seal all windows, doors, and gaps.',
      purifier: 'Maximum purification mode. Multiple units if available.',
    },
  }
}

// ─── WHO Guideline limits (annual mean, μg/m³) ────────────────────────────────
export const WHO_LIMITS = {
  pm25: 5,
  no2:  10,
  so2:  40,
  o3:   100,
  co:   4000,
}

// ─── Cigarette equivalent ──────────────────────────────────────────────────────
// 1 cigarette ≈ 22 μg/m³ PM2.5 daily exposure
export function cigarettesPerDay(pm25) {
  return pm25 ? (pm25 / 22).toFixed(1) : '0.0'
}

// ─── Find closest hourly index to now ────────────────────────────────────────
export function getCurrentHourIndex(times) {
  const now = Date.now()
  let best = 0
  let bestDiff = Infinity
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  }
  return best
}

// ─── Day abbreviations ────────────────────────────────────────────────────────
export const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function getForecastDays(hourlyTimes, hourlyPM25, currentIdx) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const startIdx = currentIdx + i * 24
    const slice = hourlyPM25.slice(startIdx, startIdx + 24).filter(v => v != null)
    const avg = slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 0
    const aqi = aqiFromPM25(avg)
    days.push({ dayName: i === 0 ? 'TODAY' : DAY_ABBR[d.getDay()], aqi, info: getAQIInfo(aqi) })
  }
  return days
}
