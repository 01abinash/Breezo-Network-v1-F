import { useEffect, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { fetchMapNodes } from '../../services/map.service'
import { socket } from '../../sockets/socket.client'

import styles from './LiveMap.module.css'

const DEFAULT_CENTER = [27.7007, 85.3001]

const SENSOR_ICONS = {
  fineParticle: '🌫',
  temperature: '🌡',
  humidity: '💧',
  pressure: '◉',
  co2: '☁',
  lastSeen: '⏱',
  uptime: '↻',
  connectivity: '◎',
}

function getMarkerColor(aqi) {
  if (aqi <= 50) return '#4ADE80'
  if (aqi <= 100) return '#FCD34D'
  if (aqi <= 150) return '#FB923C'
  if (aqi <= 200) return '#F87171'
  if (aqi <= 300) return '#E879F9'
  return '#EF4444'
}

function mapNodeToDevice(node) {
  const lat = node.lat ?? node.location?.lat
  const lng = node.lng ?? node.location?.lng

  return {
    cityKey: node.nodeId,
    cityLabel: node.nodeId,
    coords: [lat, lng],
    aqi: node.aqi,
    status: node.aqiLevel,
    color: getMarkerColor(node.aqi),
    connectivity: 'online',
    lastSeen: 'just now',
    telemetry: {
      pm25: node.pm25,
      temperature: node.temperature,
      humidity: node.humidity || 0,
      pressure: 0,
      mq135: 0,
    },
  }
}

function createMarkerIcon(color, isActive) {
  const size = isActive ? 22 : 18
  const halo = isActive ? 10 : 6

  return L.divIcon({
    className: '',
    html: `
      <div
        class="mapMarkerDot ${isActive ? 'mapMarkerDotSelected' : ''}"
        style="
          --marker-size:${size}px;
          --marker-color:${color};
          --marker-halo:${halo}px;
        "
      ></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function SensorLabel({ icon, children }) {
  return (
    <span className={styles.sensorLabel}>
      <span className={styles.sensorIcon} aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </span>
  )
}

function FitMapToDevices({ selectedCoords }) {
  const map = useMap()
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (isFirstLoad) {
      map.setView(DEFAULT_CENTER, 11)
      setIsFirstLoad(false)
      return
    }

    if (selectedCoords) {
      map.flyTo(selectedCoords, 13, {
        animate: true,
        duration: 0.8,
      })
    }
  }, [map, selectedCoords, isFirstLoad])

  return null
}

export default function LiveMap({ mode = 'panel' }) {
  const [devices, setDevices] = useState([])
  const [selectedCityKey, setSelectedCityKey] = useState(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetchMapNodes()
      const mapped = res.map(mapNodeToDevice)

      setDevices(mapped)

      if (mapped.length) {
        setSelectedCityKey(mapped[0].cityKey)
      }
    }

    load()
  }, [])

  useEffect(() => {
    socket.connect()

    socket.on('node:update', (node) => {
      const updated = mapNodeToDevice(node)

      setDevices((prev) => {
        const idx = prev.findIndex((d) => d.cityKey === updated.cityKey)

        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = updated
          return copy
        }

        return [...prev, updated]
      })
    })

    return () => socket.off('node:update')
  }, [])

  const selectedDevice =
    devices.find((d) => d.cityKey === selectedCityKey) || devices[0]

  const isPageMode = mode === 'page'

  return (
    <section className={`${styles.panel} ${mode === 'page' ? styles.panelPage : ''}`}>
      {mode !== 'page' && (
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>Device network map</div>
            <h3 className={styles.title}>Live device operations view</h3>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><i style={{ background: '#4ADE80' }} />Clean</span>
            <span className={styles.legendItem}><i style={{ background: '#FCD34D' }} />Moderate</span>
            <span className={styles.legendItem}><i style={{ background: '#EF4444' }} />Polluted</span>
          </div>
        </div>
      )}

      <div className={`${styles.layout} ${mode === 'page' ? styles.layoutPage : ''}`}>
        <div className={styles.mapShell}>
          <div className={styles.mapTopBar}>
            <span className={styles.mapBadge}>Leaflet live map</span>
            <span className={styles.mapMeta}>{devices.length} node{devices.length === 1 ? '' : 's'} tracked</span>
          </div>

          {isPageMode && selectedDevice && (
            <div className={styles.overlayCard}>
              <div className={styles.overlayTop}>
                <div>
                  <div className={styles.overlayLabel}>Selected device</div>
                  <div className={styles.overlayTitle}>{selectedDevice.cityLabel}</div>
                </div>
                <span className={styles.overlayAqi} style={{ color: selectedDevice.color }}>
                  AQI {selectedDevice.aqi}
                </span>
              </div>

              <div className={styles.overlayGrid}>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.fineParticle}>Fine particle</SensorLabel>
                  <strong>{selectedDevice.telemetry.pm25?.toFixed(1)}</strong>
                </div>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.temperature}>Temp</SensorLabel>
                  <strong>{selectedDevice.telemetry.temperature?.toFixed(1)} C</strong>
                </div>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.humidity}>Humidity</SensorLabel>
                  <strong>{selectedDevice.telemetry.humidity?.toFixed(1)} %</strong>
                </div>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.pressure}>Pressure</SensorLabel>
                  <strong>{selectedDevice.telemetry.pressure?.toFixed(1)} hPa</strong>
                </div>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.co2}>CO2</SensorLabel>
                  <strong>{selectedDevice.telemetry.mq135?.toFixed(1)}</strong>
                </div>
                <div className={styles.overlayItem}>
                  <SensorLabel icon={SENSOR_ICONS.lastSeen}>Last seen</SensorLabel>
                  <strong>{selectedDevice.lastSeen}</strong>
                </div>
              </div>
            </div>
          )}

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={11}
            zoomControl={false}
            attributionControl={false}
            className={styles.mapFrame}
            scrollWheelZoom
          >
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
            <ZoomControl position="bottomright" />
            <FitMapToDevices selectedCoords={selectedDevice?.coords} />

            {devices.map((device) => (
              <Marker
                key={device.cityKey}
                position={device.coords}
                icon={createMarkerIcon(device.color, device.cityKey === selectedCityKey)}
                eventHandlers={{
                  click: () => setSelectedCityKey(device.cityKey),
                }}
              >
                {!isPageMode && (
                  <Popup closeButton={false} offset={[0, -8]}>
                    <div className={styles.popupContent}>
                      <div className={styles.popupCity}>{device.cityLabel}</div>
                      <div className={styles.popupAqi}>AQI {device.aqi}</div>
                      <div className={styles.popupStatus} style={{ color: device.color }}>{device.status}</div>
                      <div className={styles.popupGrid}>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.fineParticle}>Fine particle</SensorLabel>
                          <strong>{device.telemetry.pm25?.toFixed(1)}</strong>
                        </div>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.temperature}>Temp</SensorLabel>
                          <strong>{device.telemetry.temperature?.toFixed(1)} C</strong>
                        </div>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.humidity}>Humidity</SensorLabel>
                          <strong>{device.telemetry.humidity?.toFixed(1)} %</strong>
                        </div>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.pressure}>Pressure</SensorLabel>
                          <strong>{device.telemetry.pressure?.toFixed(1)} hPa</strong>
                        </div>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.co2}>CO2</SensorLabel>
                          <strong>{device.telemetry.mq135?.toFixed(1)}</strong>
                        </div>
                        <div className={styles.popupItem}>
                          <SensorLabel icon={SENSOR_ICONS.uptime}>Uptime</SensorLabel>
                          <strong>{device.uptime?.toFixed(1)}%</strong>
                        </div>
                      </div>
                      <div className={styles.popupFoot}>
                        <span>{device.lastSeen}</span>
                        <span>{device.connectivity}</span>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>
        </div>

        {!isPageMode && (
          <aside className={styles.nodeRail}>
            <div className={styles.railHeader}>
              <div>
                <div className={styles.railKicker}>Node overview</div>
                <div className={styles.railTitle}>AQI device status</div>
              </div>
            </div>

            <div className={styles.nodeList}>
              {devices.map((device) => {
                const isActive = device.cityKey === selectedCityKey
                const online = device.connectivity === 'online'

                return (
                  <button
                    key={device.cityKey}
                    type="button"
                    className={`${styles.nodeCard} ${isActive ? styles.nodeCardActive : ''}`}
                    onClick={() => setSelectedCityKey(device.cityKey)}
                  >
                    <div className={styles.nodeTop}>
                      <div>
                        <div className={styles.nodeCity}>{device.cityLabel}</div>
                        <div className={styles.nodeId}>{device.cityKey.toUpperCase()} · AQI {device.aqi}</div>
                      </div>
                      <span className={`${styles.statusPill} ${online ? styles.online : styles.offline}`}>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className={styles.nodeMeta}>
                      <span>{device.lastSeen}</span>
                      <span>{device.sampleRate} sync</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedDevice && (
              <div className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div>
                    <div className={styles.railKicker}>Selected node</div>
                    <div className={styles.detailTitle}>{selectedDevice.cityLabel}</div>
                  </div>
                  <span className={styles.detailAqi} style={{ color: selectedDevice.color }}>
                    AQI {selectedDevice.aqi}
                  </span>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.connectivity}>Connectivity</SensorLabel>
                    <strong>{selectedDevice.connectivity}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.lastSeen}>Last seen</SensorLabel>
                    <strong>{selectedDevice.lastSeen}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.fineParticle}>Fine particle</SensorLabel>
                    <strong>{selectedDevice.telemetry.pm25?.toFixed(1)} ug/m3</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.temperature}>Temperature</SensorLabel>
                    <strong>{selectedDevice.telemetry.temperature?.toFixed(1)} C</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.humidity}>Humidity</SensorLabel>
                    <strong>{selectedDevice.telemetry.humidity?.toFixed(1)} %</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.pressure}>Pressure</SensorLabel>
                    <strong>{selectedDevice.telemetry.pressure?.toFixed(1)} hPa</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.co2}>CO2</SensorLabel>
                    <strong>{selectedDevice.telemetry.mq135?.toFixed(1)}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <SensorLabel icon={SENSOR_ICONS.uptime}>Uptime</SensorLabel>
                    <strong>{selectedDevice.uptime?.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}
