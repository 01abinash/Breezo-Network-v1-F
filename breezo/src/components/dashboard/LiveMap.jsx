import { useMemo, useState } from 'react'
import { CITIES } from '../../lib/aqi'
import { buildDeviceAirSnapshot, getActiveDeviceCityKeys, getDeviceDemo } from '../../lib/deviceDemo'
import styles from './LiveMap.module.css'

const TILE_SIZE = 256
const MAP_WIDTH = 960
const MAP_HEIGHT = 420
const DEFAULT_ZOOM = 10

function getMarkerColor(aqi) {
  if (aqi <= 50) return '#4ADE80'
  if (aqi <= 100) return '#FCD34D'
  if (aqi <= 150) return '#FB923C'
  if (aqi <= 200) return '#F87171'
  if (aqi <= 300) return '#E879F9'
  return '#EF4444'
}

function lngToTileX(lon, zoom) {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}

function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180
  return (
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2
  ) * Math.pow(2, zoom)
}

function projectPoint(lat, lon, zoom, centerX, centerY) {
  const worldX = lngToTileX(lon, zoom) * TILE_SIZE
  const worldY = latToTileY(lat, zoom) * TILE_SIZE

  return {
    x: worldX - centerX + MAP_WIDTH / 2,
    y: worldY - centerY + MAP_HEIGHT / 2,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function buildTiles(centerLat, centerLon, zoom) {
  const centerTileX = lngToTileX(centerLon, zoom)
  const centerTileY = latToTileY(centerLat, zoom)
  const centerWorldX = centerTileX * TILE_SIZE
  const centerWorldY = centerTileY * TILE_SIZE

  const startWorldX = centerWorldX - MAP_WIDTH / 2
  const startWorldY = centerWorldY - MAP_HEIGHT / 2
  const endWorldX = centerWorldX + MAP_WIDTH / 2
  const endWorldY = centerWorldY + MAP_HEIGHT / 2

  const startTileX = Math.floor(startWorldX / TILE_SIZE)
  const endTileX = Math.floor(endWorldX / TILE_SIZE)
  const startTileY = Math.floor(startWorldY / TILE_SIZE)
  const endTileY = Math.floor(endWorldY / TILE_SIZE)

  const maxTile = Math.pow(2, zoom)
  const tiles = []

  for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
    for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
      if (tileY < 0 || tileY >= maxTile) continue

      const wrappedX = ((tileX % maxTile) + maxTile) % maxTile
      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${tileY}.png`,
        left: tileX * TILE_SIZE - startWorldX,
        top: tileY * TILE_SIZE - startWorldY,
      })
    }
  }

  return { tiles, centerWorldX, centerWorldY }
}

export default function LiveMap({ activeCity }) {
  const devices = useMemo(() => {
    return getActiveDeviceCityKeys().map((cityKey) => {
      const city = CITIES[cityKey]
      const telemetry = getDeviceDemo(cityKey, city)
      const snapshot = buildDeviceAirSnapshot(cityKey)

      return {
        cityKey,
        cityLabel: city.label,
        lat: telemetry.gps?.lat ?? city.lat,
        lon: telemetry.gps?.lon ?? city.lon,
        aqi: snapshot.aqi,
        color: getMarkerColor(snapshot.aqi),
        status: snapshot.info.label,
      }
    })
  }, [])

  const selectedCityKey = activeCity || devices[0]?.cityKey || null
  const [clickedCityKey, setClickedCityKey] = useState(null)
  const focusedCityKey = clickedCityKey || selectedCityKey

  const center = useMemo(() => {
    if (!devices.length) return { lat: 27.7172, lon: 85.324 }
    if (devices.length === 1) return { lat: devices[0].lat, lon: devices[0].lon }

    const avgLat = devices.reduce((sum, device) => sum + device.lat, 0) / devices.length
    const avgLon = devices.reduce((sum, device) => sum + device.lon, 0) / devices.length
    return { lat: avgLat, lon: avgLon }
  }, [devices])

  const mapData = useMemo(() => {
    const { tiles, centerWorldX, centerWorldY } = buildTiles(center.lat, center.lon, DEFAULT_ZOOM)

    const markers = devices.map((device) => {
      const point = projectPoint(device.lat, device.lon, DEFAULT_ZOOM, centerWorldX, centerWorldY)
      return {
        ...device,
        left: clamp(point.x, 18, MAP_WIDTH - 18),
        top: clamp(point.y, 18, MAP_HEIGHT - 18),
      }
    })

    return { tiles, markers }
  }, [center, devices])

  const selectedDevice = mapData.markers.find((device) => device.cityKey === focusedCityKey) ?? mapData.markers[0]

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Device network map</div>
          <h3 className={styles.title}>Live AQI device locations</h3>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}><i style={{ background: '#4ADE80' }} />Clean</span>
          <span className={styles.legendItem}><i style={{ background: '#FCD34D' }} />Moderate</span>
          <span className={styles.legendItem}><i style={{ background: '#EF4444' }} />Polluted</span>
        </div>
      </div>

      <div className={styles.mapShell}>
        <div className={styles.mapFrame}>
          <div className={styles.tileLayer}>
            {mapData.tiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                className={styles.tile}
                style={{ left: `${tile.left}px`, top: `${tile.top}px` }}
                loading="lazy"
              />
            ))}
          </div>

          <div className={styles.overlay}>
            {mapData.markers.map((device) => {
              const isActive = selectedDevice?.cityKey === device.cityKey

              return (
                <button
                  key={device.cityKey}
                  type="button"
                  className={`${styles.marker} ${isActive ? styles.markerActive : ''}`}
                  style={{ left: `${device.left}px`, top: `${device.top}px` }}
                  onClick={() => setClickedCityKey(device.cityKey)}
                  aria-label={`${device.cityLabel} AQI ${device.aqi}`}
                >
                  <span className={styles.markerPulse} style={{ background: `${device.color}33` }} />
                  <span
                    className={styles.markerDot}
                    style={{ background: device.color, boxShadow: `0 0 0 6px ${device.color}22` }}
                  />
                </button>
              )
            })}

            {selectedDevice && (
              <div
                className={styles.popup}
                style={{
                  left: `clamp(16px, ${selectedDevice.left}px, calc(100% - 190px))`,
                  top: `clamp(16px, calc(${selectedDevice.top}px - 96px), calc(100% - 110px))`,
                }}
              >
                <div className={styles.popupCity}>{selectedDevice.cityLabel}</div>
                <div className={styles.popupAqi}>AQI {selectedDevice.aqi}</div>
                <div className={styles.popupStatus} style={{ color: selectedDevice.color }}>
                  {selectedDevice.status}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
