import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Cpu,
  Coins,
  RefreshCw,
  CircleDot,
  Wallet,
  Gauge,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { dashboard as fetchDashboard } from "../api/dashboard.api";
import { readTokenSession, TOKEN_SESSION_EVENT } from "../lib/tokenization";
import {
  getNodeRewardBalance,
  claimReward,
} from "../solana/program/breezo.method";

import { useProgram } from "../hooks/useProgram";

import styles from "./TokenizationPage.module.css";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatTimeAgo = (date) => {
  if (!date) return "just now";

  const diff = Date.now() - new Date(date).getTime();

  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

const getAQIData = (level) => {
  switch (level) {
    case "GOOD":
      return {
        color: "#10b981",
        bg: "rgba(16,185,129,0.12)",
        border: "rgba(16,185,129,0.22)",
        text: "Air quality is healthy",
      };

    case "MODERATE":
      return {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.22)",
        text: "Air quality is moderate",
      };

    default:
      return {
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.22)",
        text: "Air quality is unhealthy",
      };
  }
};

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function TokenizationPage() {
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  const [node, setNode] = useState(null);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [toast, setToast] = useState(null);

  const intervalRef = useRef(null);

  const { publicKey, connected, disconnect } = useWallet();

  const walletConnected = connected && !!publicKey;

  const walletAddress = useMemo(
    () => publicKey?.toBase58(),
    [publicKey]
  );

  const program = useProgram();

  // ─────────────────────────────────────────────
  // SESSION
  // ─────────────────────────────────────────────

  useEffect(() => {
    const s = readTokenSession();

    setSession(s);
    setSessionReady(true);

    const onChange = (e) => setSession(e.detail);

    window.addEventListener(TOKEN_SESSION_EVENT, onChange);

    return () =>
      window.removeEventListener(TOKEN_SESSION_EVENT, onChange);
  }, []);

  // ─────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────

  const showToast = (type, msg) => {
    setToast({ type, msg });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────

  const loadDashboard = async (walletAddr) => {
    if (!walletAddr || !program) return;

    try {
      setLoading(true);

      const res = await fetchDashboard(walletAddr);

      const data = Array.isArray(res)
        ? res
        : res?.data ?? [];

      const firstNode = data?.[0];

      if (!firstNode) {
        setNode(null);
        return;
      }

      let onChainReward = 0;

      if (firstNode.nodeAccount) {
        try {
          onChainReward = await getNodeRewardBalance(
            program,
            firstNode.nodeAccount
          );
        } catch (err) {
          console.error(err);
        }
      }

      setNode({
        ...firstNode,
        onChainReward,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // AUTO REFRESH
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!walletConnected || !program) return;

    loadDashboard(walletAddress);

    intervalRef.current = setInterval(() => {
      loadDashboard(walletAddress);
    }, 120000);

    return () => clearInterval(intervalRef.current);
  }, [walletConnected, walletAddress, program]);

  // ─────────────────────────────────────────────
  // CLAIM
  // ─────────────────────────────────────────────

  const handleClaim = async () => {
    if (!program || !publicKey || !node?.nodeAccount) return;

    try {
      setClaiming(true);

      const sig = await claimReward(
        program,
        node.nodeAccount,
        publicKey
      );

      console.log(sig);

      showToast("success", "Reward claimed successfully");

      await loadDashboard(walletAddress);
    } catch (err) {
      console.error(err);

      showToast(
        "error",
        err?.message || "Claim failed"
      );
    } finally {
      setClaiming(false);
    }
  };

  // ─────────────────────────────────────────────
  // GUARDS
  // ─────────────────────────────────────────────

  if (sessionReady && !session) {
    return <Navigate to="/login" replace />;
  }

  // ─────────────────────────────────────────────
  // WALLET
  // ─────────────────────────────────────────────

  if (!walletConnected) {
    return (
      <div className={styles.page}>
        <div className={styles.connectCard}>
          <div className={styles.connectIcon}>
            <Wallet size={36} />
          </div>

          <p className={styles.kicker}>Breezo DePIN</p>

          <h1 className={styles.connectTitle}>
            Connect Your Wallet
          </h1>

          <p className={styles.connectText}>
            Connect your Phantom wallet to access
            your sensor node, rewards, and real-time
            air quality telemetry.
          </p>

          <div className={styles.walletBtnWrap}>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────

  if (loading && !node) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingCard}>
          <Loader2
            className={styles.spin}
            size={32}
          />

          <h2>Loading Dashboard</h2>

          <p>
            Fetching node telemetry and on-chain
            rewards...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // EMPTY
  // ─────────────────────────────────────────────

  if (!loading && !node) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyCard}>
          <Cpu size={40} />

          <h2>No Node Registered</h2>

          <p>
            This wallet does not have any active
            Breezo sensor node.
          </p>

          <div className={styles.emptyActions}>
            <button
              className={styles.secondaryBtn}
              onClick={() =>
                loadDashboard(walletAddress)
              }
            >
              Retry
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────

  const aqi = getAQIData(node.aqiLevel);

  const claimable =
    (node.onChainReward || 0) > 0;

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* TOAST */}

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "success"
              ? styles.toastSuccess
              : styles.toastError
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER */}

      <div className={styles.topBar}>
        <div>
          <p className={styles.kicker}>
            Breezo DePIN Dashboard
          </p>

          <h1 className={styles.pageTitle}>
            Sensor Node Overview
          </h1>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.refreshBtn}
            onClick={() =>
              loadDashboard(walletAddress)
            }
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className={styles.disconnectBtn}
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* HERO */}

      <div className={styles.heroGrid}>

        {/* LEFT */}

        <div className={styles.heroCard}>
          <div className={styles.heroTop}>
            <div>
              <span className={styles.heroLabel}>
                Current AQI
              </span>

              <div
                className={styles.aqiValue}
                style={{ color: aqi.color }}
              >
                {node.aqi ?? "--"}
              </div>

              <p className={styles.aqiText}>
                {aqi.text}
              </p>
            </div>

            <div
              className={styles.aqiBadge}
              style={{
                background: aqi.bg,
                borderColor: aqi.border,
                color: aqi.color,
              }}
            >
              <Activity size={18} />
              {node.aqiLevel || "UNKNOWN"}
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.liveBadge}>
              <CircleDot size={10} />
              Live
            </div>

            <span>
              Updated{" "}
              {formatTimeAgo(node.lastSeen)}
            </span>
          </div>

          <div className={styles.sensorGrid}>

            <div className={styles.sensorCard}>
              <div className={styles.sensorIconBlue}>
                <Wind size={18} />
              </div>

              <div>
                <span>PM2.5</span>
                <strong>
                  {node.pm25 ?? "--"}
                </strong>
              </div>
            </div>

            <div className={styles.sensorCard}>
              <div className={styles.sensorIconPurple}>
                <Gauge size={18} />
              </div>

              <div>
                <span>PM10</span>
                <strong>
                  {node.pm10 ?? "--"}
                </strong>
              </div>
            </div>

            <div className={styles.sensorCard}>
              <div className={styles.sensorIconOrange}>
                <Thermometer size={18} />
              </div>

              <div>
                <span>Temperature</span>
                <strong>
                  {node.temperature ?? "--"}°C
                </strong>
              </div>
            </div>

            <div className={styles.sensorCard}>
              <div className={styles.sensorIconCyan}>
                <Droplets size={18} />
              </div>

              <div>
                <span>Humidity</span>
                <strong>
                  {node.humidity ?? "--"}%
                </strong>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT */}

        <div className={styles.rewardCard}>

          <div className={styles.rewardHeader}>


            <div>
              <span>Claimable Rewards</span>

              <h2>
                {(node.onChainReward || 0).toFixed(
                  4
                )}{" "}
                BREEZO
              </h2>
            </div>
          </div>

          <div className={styles.rewardStats}>

            <div className={styles.rewardStat}>
              <span>Web2 Earned</span>

              <strong>
                {(node.reward || 0).toFixed(2)}{" "}
                BREEZO
              </strong>
            </div>

            <div className={styles.rewardStat}>
              <span>Status</span>

              <strong>
                {claimable
                  ? "Ready to claim"
                  : "Accumulating"}
              </strong>
            </div>

            <div className={styles.rewardStat}>
              <span>Node Status</span>

              <strong>
                {node.syncing
                  ? "Syncing"
                  : "Online"}
              </strong>
            </div>

          </div>

          {claimable ? (
            <button
              className={styles.claimBtn}
              onClick={handleClaim}
              disabled={claiming}
            >
              {claiming ? (
                <>
                  <Loader2
                    size={18}
                    className={styles.spin}
                  />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Claim Rewards
                </>
              )}
            </button>
          ) : (
            <div className={styles.pendingBox}>
              Rewards will sync on-chain after
              reaching 10 BREEZO threshold.
            </div>
          )}

        </div>
      </div>

      {/* NODE DETAILS */}

      <div className={styles.bottomGrid}>

        <div className={styles.infoCard}>
          <span>Node ID</span>

          <strong>
            {node.nodeId || "--"}
          </strong>
        </div>

        <div className={styles.infoCard}>
          <span>Wallet</span>

          <strong>
            {walletAddress?.slice(0, 8)}...
            {walletAddress?.slice(-6)}
          </strong>
        </div>

        <div className={styles.infoCard}>
          <span>Node Account</span>

          <strong>
            {node.nodeAccount
              ? `${node.nodeAccount.slice(
                  0,
                  8
                )}...${node.nodeAccount.slice(-6)}`
              : "--"}
          </strong>
        </div>

        <div className={styles.infoCard}>
          <span>Last Refresh</span>

          <strong>
            {formatTimeAgo(lastUpdated)}
          </strong>
        </div>

      </div>
    </div>
  );
}
