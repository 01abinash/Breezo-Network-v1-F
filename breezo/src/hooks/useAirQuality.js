import { useState, useEffect, useCallback, useRef } from 'react'
import { CITIES, aqiFromPM25, getCurrentHourIndex, getAQIInfo, getForecastDays } from '../lib/aqi'

// In-memory cache: { cityKey: { data, timestamp } }
const cache = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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

/**
 * Parse raw Open-Meteo response into a clean object.
 */
function parseData(raw) {
  const h = raw.hourly
  const idx = getCurrentHourIndex(h.time)
  const pm25 = h.pm2_5[idx] ?? 0
  const pm10 = h.pm10[idx] ?? 0
  const no2  = h.nitrogen_dioxide[idx] ?? 0
  const o3   = h.ozone[idx] ?? 0
  const co   = h.carbon_monoxide[idx] ?? 0
  const so2  = h.sulphur_dioxide[idx] ?? 0
  const aqi  = aqiFromPM25(pm25)
  const info = getAQIInfo(aqi)

  // 24-hour trend (last 24 hours up to now)
  const start24 = Math.max(0, idx - 23)
  const trend = {
    labels: h.time.slice(start24, idx + 1).map(t => {
      const d = new Date(t)
      return d.getHours() + 'h'
    }),
    pm25:   h.pm2_5.slice(start24, idx + 1).map(v => v != null ? +v.toFixed(1) : null),
    pm10:   h.pm10.slice(start24, idx + 1).map(v => v != null ? +v.toFixed(1) : null),
  }

  const forecast = getForecastDays(h.time, h.pm2_5, idx)

  return { aqi, info, pm25, pm10, no2, o3, co, so2, trend, forecast, idx }
}

/**
 * Hook: fetch and parse air quality data for a single city.
 * Returns { data, loading, error, refetch }
 */
export function useAirQuality(cityKey) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const abortRef = useRef(null)

  const fetch_ = useCallback(async (key) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const raw = await fetchCityRaw(key)
      if (ctrl.signal.aborted) return
      setState({ data: parseData(raw), loading: false, error: null })
    } catch (e) {
      if (ctrl.signal.aborted) return
      setState({ data: null, loading: false, error: e.message })
    }
  }, [])

  useEffect(() => {
    fetch_(cityKey)
    const interval = setInterval(() => {
      // Force re-fetch by clearing cache entry
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

/**
 * Hook: lightweight fetch of just current AQI for multiple cities (hero panel).
 */
export function useMultiCityAQI(cityKeys) {
  const [results, setResults] = useState({})

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      const entries = await Promise.allSettled(
        cityKeys.map(async key => {
          const raw = await fetchCityRaw(key)
          const h = raw.hourly
          const idx = getCurrentHourIndex(h.time)
          const pm25 = h.pm2_5[idx] ?? 0
          const aqi  = aqiFromPM25(pm25)
          return [key, { aqi, info: getAQIInfo(aqi), pm25,
            pm10: h.pm10[idx] ?? 0,
            no2:  h.nitrogen_dioxide[idx] ?? 0,
            o3:   h.ozone[idx] ?? 0,
            co:   h.carbon_monoxide[idx] ?? 0,
          }]
        })
      )
      if (cancelled) return
      const obj = {}
      entries.forEach(r => { if (r.status === 'fulfilled') obj[r.value[0]] = r.value[1] })
      setResults(obj)
    }
    fetchAll()
    const iv = setInterval(fetchAll, CACHE_TTL)
    return () => { cancelled = true; clearInterval(iv) }
  }, [cityKeys.join(',')])

  return results
}
