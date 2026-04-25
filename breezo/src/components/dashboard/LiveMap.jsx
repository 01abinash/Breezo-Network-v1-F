import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CITIES } from '../../lib/aqi'
import { buildDeviceAirSnapshot, getActiveDeviceCityKeys, getDeviceDemo } from '../../lib/deviceDemo'
import styles from './LiveMap.module.css'

const DEFAULT_CENTER = [27.7172, 85.324]

function getMarkerColor(aqi) {
  if (aqi <= 50) return '#4ADE80'
  if (aqi <= 100) return '#FCD34D'
  if (aqi <= 150) return '#FB923C'
  if (aqi <= 200) return '#F87171'
  if (aqi <= 300) return '#E879F9'
  return '#EF4444'
}

function createMarkerIcon(color, isActive) {
  const size = isActive ? 22 : 18
  const halo = isActive ? 10 : 6

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:3px solid rgba(7,8,10,0.96);
        box-shadow:0 0 0 ${halo}px ${color}22, 0 10px 22px rgba(0,0,0,0.36);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function FitMapToDevices({ devices, selectedCoords }) {
  const map = useMap()

  useEffect(() => {
    if (!devices.length) {
      map.setView(DEFAULT_CENTER, 9)
      return
    }

    if (devices.length === 1) {
      map.setView(devices[0].coords, 11)
      return
    }

    if (selectedCoords) {
      map.flyTo(selectedCoords, Math.max(map.getZoom(), 12), {
        animate: true,
        duration: 0.8,
      })
      return
    }

    map.fitBounds(L.latLngBounds(devices.map((device) => device.coords)), {
      padding: [28, 28],
    })
  }, [devices, map, selectedCoords])

  return null
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
        coords: [telemetry.gps?.lat ?? city.lat, telemetry.gps?.lon ?? city.lon],
        aqi: snapshot.aqi,
        status: snapshot.info.label,
        color: getMarkerColor(snapshot.aqi),
        connectivity: snapshot.connectivity,
        lastSeen: snapshot.lastSeen,
        uptime: snapshot.uptime,
        sampleRate: snapshot.sampleRate,
        telemetry: {
          pm25: snapshot.pm25,
          temperature: snapshot.temperature,
          humidity: snapshot.humidity,
          pressure: snapshot.pressure,
          mq135: snapshot.mq135,
        },
      }
    })
  }, [])

  const [selectedCityKey, setSelectedCityKey] = useState(activeCity || devices[0]?.cityKey || null)

  useEffect(() => {
    if (activeCity) {
      setSelectedCityKey(activeCity)
    }
  }, [activeCity])

  const selectedDevice = devices.find((device) => device.cityKey === selectedCityKey) ?? devices[0]

  return (
    <section className={styles.panel}>
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

      <div className={styles.layout}>
        <div className={styles.mapShell}>
          <div className={styles.mapTopBar}>
            <span className={styles.mapBadge}>Leaflet live map</span>
            <span className={styles.mapMeta}>{devices.length} node{devices.length === 1 ? '' : 's'} tracked</span>
          </div>

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
            <FitMapToDevices devices={devices} selectedCoords={selectedDevice?.coords} />

            {devices.map((device) => (
              <Marker
                key={device.cityKey}
                position={device.coords}
                icon={createMarkerIcon(device.color, device.cityKey === selectedCityKey)}
                eventHandlers={{
                  click: () => setSelectedCityKey(device.cityKey),
                }}
              >
                <Popup closeButton={false} offset={[0, -8]}>
                  <div className={styles.popupContent}>
                    <div className={styles.popupCity}>{device.cityLabel}</div>
                    <div className={styles.popupAqi}>AQI {device.aqi}</div>
                    <div className={styles.popupStatus} style={{ color: device.color }}>{device.status}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

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
                  <span>Connectivity</span>
                  <strong>{selectedDevice.connectivity}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Last seen</span>
                  <strong>{selectedDevice.lastSeen}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>PM2.5</span>
                  <strong>{selectedDevice.telemetry.pm25?.toFixed(1)} ug/m3</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Temperature</span>
                  <strong>{selectedDevice.telemetry.temperature?.toFixed(1)} C</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Humidity</span>
                  <strong>{selectedDevice.telemetry.humidity?.toFixed(1)} %</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Pressure</span>
                  <strong>{selectedDevice.telemetry.pressure?.toFixed(1)} hPa</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>MQ135</span>
                  <strong>{selectedDevice.telemetry.mq135?.toFixed(1)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Uptime</span>
                  <strong>{selectedDevice.uptime?.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
