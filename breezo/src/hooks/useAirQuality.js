import { useState, useEffect, useCallback, useRef } from 'react'
import { CITIES, aqiFromPM25, getCurrentHourIndex, getAQIInfo } from '../lib/aqi'
import { getDeviceDemo } from '../lib/deviceDemo'

const cache = {}
const CACHE_TTL = 5 * 60 * 1000

function buildURL(city) {
  return (
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&hourly=pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide` +
    `&timezone=auto&past_days=1&forecast_days=7`
  )
}

async function fetchCityRaw(cityKey) {
  const cached = cache[cityKey]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const city = CITIES[cityKey]
  const res = await fetch(buildURL(city))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  cache[cityKey] = { data, timestamp: Date.now() }
  return data
}

function parseData(raw, city) {
  const h = raw.hourly
  const idx = getCurrentHourIndex(h.time)
  const pm25 = h.pm2_5[idx] ?? 0
  const pm10 = h.pm10[idx] ?? 0
  const no2 = h.nitrogen_dioxide[idx] ?? 0
  const o3 = h.ozone[idx] ?? 0
  const co = h.carbon_monoxide[idx] ?? 0
  const so2 = h.sulphur_dioxide[idx] ?? 0
  const aqi = aqiFromPM25(pm25)
  const info = getAQIInfo(aqi)
  const device = { ...getDeviceDemo(city.key, city), ...(raw.device ?? raw.telemetry ?? {}) }
  const gps = device.gps ?? {
    lat: city.lat,
    lon: city.lon,
    source: 'City profile',
  }

  const start24 = Math.max(0, idx - 23)
  const trend = {
    labels: h.time.slice(start24, idx + 1).map((t) => {
      const d = new Date(t)
      return d.getHours() + 'h'
    }),
    pm25: h.pm2_5.slice(start24, idx + 1).map((v) => (v != null ? +v.toFixed(1) : null)),
  }

  return {
    aqi,
    info,
    pm25,
    pm10,
    no2,
    o3,
    co,
    so2,
    temperature: device.temperature ?? null,
    humidity: device.humidity ?? null,
    pressure: device.pressure ?? null,
    mq135: device.mq135 ?? null,
    deviceId: device.deviceId ?? null,
    gps,
    sourceLabel: device.sourceLabel ?? 'Open-Meteo AQI demo feed',
    trend,
    idx,
  }
}

export function useAirQuality(cityKey) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const abortRef = useRef(null)

  const fetch_ = useCallback(async (key) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const raw = await fetchCityRaw(key)
      if (ctrl.signal.aborted) return
      setState({ data: parseData(raw, CITIES[key]), loading: false, error: null })
    } catch (e) {
      if (ctrl.signal.aborted) return
      setState({ data: null, loading: false, error: e.message })
    }
  }, [])

  useEffect(() => {
    fetch_(cityKey)
    const interval = setInterval(() => {
      delete cache[cityKey]
      fetch_(cityKey)
    }, CACHE_TTL)

    return () => {
      clearInterval(interval)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [cityKey, fetch_])

  return { ...state, refetch: () => { delete cache[cityKey]; fetch_(cityKey) } }
}

export function useMultiCityAQI(cityKeys) {
  const [results, setResults] = useState({})

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      const entries = await Promise.allSettled(
        cityKeys.map(async (key) => {
          const raw = await fetchCityRaw(key)
          const h = raw.hourly
          const idx = getCurrentHourIndex(h.time)
          const pm25 = h.pm2_5[idx] ?? 0
          const aqi = aqiFromPM25(pm25)

          return [key, { aqi, info: getAQIInfo(aqi), pm25 }]
        })
      )

      if (cancelled) return
      const obj = {}
      entries.forEach((result) => {
        if (result.status === 'fulfilled') obj[result.value[0]] = result.value[1]
      })
      setResults(obj)
    }

    fetchAll()
    const iv = setInterval(fetchAll, CACHE_TTL)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
  }, [cityKeys.join(',')])

  return results
}
