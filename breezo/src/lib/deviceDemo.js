export const DEVICE_DEMO_STORAGE_KEY = 'breezo-device-demo-data'

export const DEFAULT_DEVICE_DEMO_DATA = {
  ktm: {
    deviceId: 'KTM-01-8842',
    sourceLabel: 'Demo device telemetry',
    temperature: 24.8,
    humidity: 58.4,
    pressure: 1012.6,
    mq135: 312.0,
    gps: { lat: 27.7172, lon: 85.3240, source: 'Demo GPS' },
  },
  pkr: {
    deviceId: 'PKR-01-1048',
    sourceLabel: 'Demo device telemetry',
    temperature: 22.1,
    humidity: 64.2,
    pressure: 1008.9,
    mq135: 246.5,
    gps: { lat: 28.2096, lon: 83.9856, source: 'Demo GPS' },
  },
  del: {
    deviceId: 'DEL-01-7715',
    sourceLabel: 'Demo device telemetry',
    temperature: 31.7,
    humidity: 42.9,
    pressure: 1004.3,
    mq135: 428.1,
    gps: { lat: 28.6448, lon: 77.2167, source: 'Demo GPS' },
  },
  mum: {
    deviceId: 'MUM-01-3350',
    sourceLabel: 'Demo device telemetry',
    temperature: 29.4,
    humidity: 71.5,
    pressure: 1007.8,
    mq135: 281.7,
    gps: { lat: 19.0760, lon: 72.8777, source: 'Demo GPS' },
  },
  lko: {
    deviceId: 'LKO-01-2201',
    sourceLabel: 'Demo device telemetry',
    temperature: 30.2,
    humidity: 48.3,
    pressure: 1006.2,
    mq135: 355.9,
    gps: { lat: 31.5497, lon: 74.3436, source: 'Demo GPS' },
  },
  dac: {
    deviceId: 'DAC-01-4408',
    sourceLabel: 'Demo device telemetry',
    temperature: 28.9,
    humidity: 76.8,
    pressure: 1009.4,
    mq135: 337.2,
    gps: { lat: 23.8103, lon: 90.4125, source: 'Demo GPS' },
  },
}

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

    return { ...clone(DEFAULT_DEVICE_DEMO_DATA), ...JSON.parse(raw) }
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

export function getDeviceDemo(cityKey, city) {
  const stored = readStoredDeviceDemoData()

  return (
    stored[cityKey] ?? {
      deviceId: `${city.key.toUpperCase()}-01-DEMO`,
      sourceLabel: 'Demo device telemetry',
      temperature: 25.0,
      humidity: 60.0,
      pressure: 1010.0,
      mq135: 300.0,
      gps: { lat: city.lat, lon: city.lon, source: 'City profile' },
    }
  )
}
