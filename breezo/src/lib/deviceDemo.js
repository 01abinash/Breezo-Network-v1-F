import { CITIES, aqiFromPM25, getAQIInfo } from './aqi'

export const DEVICE_DEMO_STORAGE_KEY = 'breezo-device-demo-data'

export const DEFAULT_DEVICE_DEMO_DATA = {
  ktm: {
    deviceId: 'KTM-01-1234',
    sourceLabel: 'BREEZO device feed',
    connectivity: 'online',
    lastSeen: '12 sec ago',
    uptime: 99.2,
    sampleRate: '15s',
    pm25: 62.4,
    temperature: 24.8,
    humidity: 58.4,
    pressure: 1012.6,
    mq135: 312.0,
    trendPm25: [58.2, 56.9, 55.1, 57.6, 59.0, 61.7, 63.8, 65.1, 64.4, 66.2, 68.1, 67.4],
    gps: { lat: 27.707268249932966, lon: 85.32864308198332, source: 'Live GPS' },
  },
}

const ACTIVE_DEVICE_CITY_KEYS = Object.keys(DEFAULT_DEVICE_DEMO_DATA)

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function readStoredDeviceDemoData() {
  if (typeof window === 'undefined') return clone(DEFAULT_DEVICE_DEMO_DATA)

  try {
    const raw = window.localStorage.getItem(DEVICE_DEMO_STORAGE_KEY)
    if (!raw) {
      const seeded = clone(DEFAULT_DEVICE_DEMO_DATA)
      window.localStorage.setItem(DEVICE_DEMO_STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    const parsed = JSON.parse(raw)
    const sanitized = ACTIVE_DEVICE_CITY_KEYS.reduce((acc, key) => {
      const merged = parsed[key] ? { ...clone(DEFAULT_DEVICE_DEMO_DATA[key]), ...parsed[key] } : clone(DEFAULT_DEVICE_DEMO_DATA[key])
      merged.gps = clone(DEFAULT_DEVICE_DEMO_DATA[key].gps)
      acc[key] = merged
      return acc
    }, {})

    window.localStorage.setItem(DEVICE_DEMO_STORAGE_KEY, JSON.stringify(sanitized))
    return sanitized
  } catch {
    return clone(DEFAULT_DEVICE_DEMO_DATA)
  }
}

export function getAllDeviceDemoData() {
  return readStoredDeviceDemoData()
}

export function saveAllDeviceDemoData(nextData) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEVICE_DEMO_STORAGE_KEY, JSON.stringify(nextData))
}

export function resetDeviceDemoData() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEVICE_DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_DEVICE_DEMO_DATA))
}

export function getActiveDeviceCityKeys() {
  return [...ACTIVE_DEVICE_CITY_KEYS]
}

export function getDeviceDemo(cityKey, city = CITIES[cityKey]) {
  const stored = readStoredDeviceDemoData()
  const fallbackCity = city ?? { key: cityKey, lat: 0, lon: 0 }

  return (
    stored[cityKey] ?? {
      deviceId: `${fallbackCity.key.toUpperCase()}-01-DEMO`,
      sourceLabel: 'BREEZO device feed',
      connectivity: 'offline',
      lastSeen: 'No recent packets',
      uptime: 0,
      sampleRate: '15s',
      pm25: 0,
      temperature: 25,
      humidity: 60,
      pressure: 1010,
      mq135: 300,
      trendPm25: Array.from({ length: 12 }, () => 0),
      gps: { lat: fallbackCity.lat, lon: fallbackCity.lon, source: 'City profile' },
    }
  )
}

export function buildDeviceAirSnapshot(cityKey) {
  const city = CITIES[cityKey]
  const device = getDeviceDemo(cityKey, city)
  const trendSeries = Array.isArray(device.trendPm25) && device.trendPm25.length
    ? device.trendPm25
    : Array.from({ length: 12 }, () => device.pm25 ?? 0)

  const trend = {
    labels: trendSeries.map((_, index) => `${trendSeries.length - index - 1}h`),
    pm25: trendSeries.map((value) => Number((value ?? 0).toFixed(1))),
  }

  const pm25 = Number((device.pm25 ?? trend.pm25[trend.pm25.length - 1] ?? 0).toFixed(1))
  const aqi = aqiFromPM25(pm25)

  return {
    aqi,
    info: getAQIInfo(aqi),
    pm25,
    temperature: device.temperature ?? null,
    humidity: device.humidity ?? null,
    pressure: device.pressure ?? null,
    mq135: device.mq135 ?? null,
    connectivity: device.connectivity ?? 'offline',
    lastSeen: device.lastSeen ?? 'No recent packets',
    uptime: device.uptime ?? 0,
    sampleRate: device.sampleRate ?? '15s',
    gps: device.gps ?? { lat: city.lat, lon: city.lon, source: 'City profile' },
    sourceLabel: device.sourceLabel ?? 'BREEZO device feed',
    trend,
  }
}
