import React, { useRef, useState } from "react";

const API_URL = "http://localhost:5000/api/v1/node/ingest";

const SIGNATURE =
  "KJXG3pULqQnKhDPk3RgoRWz2XoWUcEfCrEM6z5uFM64fHcBPqLpywuzMP6UgmxGjGsfzDmJYH2c6UHVuXGYSsFb";

const NODES = [
  { nodeId: "NODE_100", lat: 27.7172, lng: 85.3240 },
  { nodeId: "NODE_101", lat: 27.6700, lng: 85.3200 },
  { nodeId: "NODE_102", lat: 27.7005, lng: 85.3000 }
];

export default function IoTSimulator() {
  const [status, setStatus] = useState({});
  const intervalRef = useRef(null);

  /* ================= SENSOR ================= */

  const random = (min, max) =>
    +(Math.random() * (max - min) + min).toFixed(2);

  const generateData = () => {
    const pm25 = random(5, 120);
    const pm10 = random(10, 180);
    const aqi = Math.round(pm25 + pm10 / 2);

    let level = "GOOD";
    if (aqi > 50) level = "MODERATE";
    if (aqi > 100) level = "UNHEALTHY";
    if (aqi > 150) level = "VERY_UNHEALTHY";

    return {
      temperature: random(18, 35),
      humidity: random(40, 80),
      pm25,
      pm10,
      aqi,
      aqiLevel: level,
    };
  };

  /* ================= STATUS ================= */

  const updateStatus = (nodeId, value, type) => {
    setStatus((prev) => ({
      ...prev,
      [nodeId]: { value, type },
    }));
  };

  /* ================= API CALL ================= */

  const sendToBackend = async (node) => {
    const payload = {
      nodeId: node.nodeId,
      signature: SIGNATURE,
      timestamp: Date.now(),
      payload: {
        ...generateData(),
        location: { lat: node.lat, lng: node.lng },
      },
    };

    try {
      updateStatus(node.nodeId, "⏳ Sending...", "loading");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
console.log(payload)
      if (!res.ok) {
        updateStatus(node.nodeId, `❌ Error ${res.status}`, "error");
        return;
      }

      await res.json();
      updateStatus(node.nodeId, "✅ Sent", "success");
    } catch (err) {
      updateStatus(node.nodeId, "⚠️ Network Error", "error");
    }
  };

  /* ================= LOOP ================= */

  const run = async () => {
    await Promise.all(NODES.map(sendToBackend));
  };

  const start = () => {
    if (intervalRef.current) return;

    run();
    intervalRef.current = setInterval(run, 3000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#38bdf8" }}>🌐 DePIN IoT Simulator</h1>

      <div>
        <button onClick={start} style={styles.startBtn}>
          ▶ Start
        </button>

        <button onClick={stop} style={styles.stopBtn}>
          ⛔ Stop
        </button>
      </div>

      <div style={styles.grid}>
        {NODES.map((node) => (
          <div key={node.nodeId} style={styles.card}>
            <h3 style={{ color: "#38bdf8" }}>{node.nodeId}</h3>
            <p>📍 {node.lat}, {node.lng}</p>

            <p
              style={{
                color:
                  status[node.nodeId]?.type === "success"
                    ? "#22c55e"
                    : status[node.nodeId]?.type === "error"
                    ? "#ef4444"
                    : "#facc15",
                fontWeight: "bold",
              }}
            >
              {status[node.nodeId]?.value || "Idle"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
    fontFamily: "Arial",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    marginTop: 20,
  },
  card: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #334155",
  },
  startBtn: {
    padding: "10px 20px",
    marginRight: 10,
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  stopBtn: {
    padding: "10px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
