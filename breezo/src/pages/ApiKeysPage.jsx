import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { readTokenSession, TOKEN_SESSION_EVENT } from "../lib/tokenization";
import {
  getApiKeyDashboard,
  createOperatorApiKey,
  deleteOperatorApiKey,
} from "../api/apiKey.api";
import styles from "./ApiKeysPage.module.css";

// ─── helpers ────────────────────────────────────────────────────────────────

function maskKey(key = "") {
  if (key.length <= 16) return key;
  return key.slice(0, 14) + "••••••••" + key.slice(-6);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── component ──────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const [session, setSession] = useState(readTokenSession());
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ name: "", limit: 1000 });
  const [newKey, setNewKey] = useState(null); // stores the just-created key string
  const [copiedId, setCopiedId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);

  // ── data ──────────────────────────────────────────────────────────────────

  const loadData = async (token) => {
    try {
      setLoading(true);
      setError("");
      const res = await getApiKeyDashboard(token);
      if (res?.data && Array.isArray(res.data)) setKeys(res.data);
      else if (Array.isArray(res)) setKeys(res);
      else setKeys([]);
    } catch (e) {
      setError(e.message || "Failed to fetch keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadData(session);
    else setLoading(false);

    const sync = () => setSession(readTokenSession());
    window.addEventListener(TOKEN_SESSION_EVENT, sync);
    return () => window.removeEventListener(TOKEN_SESSION_EVENT, sync);
  }, [session]);

  // auto-clear flash/error
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  // ── actions ───────────────────────────────────────────────────────────────

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError("");
    setNewKey(null);
    try {
      const res = await createOperatorApiKey(session, form);
      // Surface the raw key if the API returns it
      const created = res?.data || res;
      if (created?.key) setNewKey(created.key);
      setFlash("API key created successfully!");
      setForm({ name: "", limit: 1000 });
      await loadData(session);
    } catch (e) {
      setError(e.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this API key? This cannot be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteOperatorApiKey(session, id);
      setFlash("API key deleted.");
      setKeys((prev) => prev.filter((k) => k._id !== id));
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleReveal = (id) => {
    setRevealedId((prev) => (prev === id ? null : id));
  };

  // ── derived stats ─────────────────────────────────────────────────────────

  const activeCount = keys.filter((k) => k.isActive).length;
  const totalUsed = keys.reduce((s, k) => s + (k.usedCredits ?? k.usedCount ?? 0), 0);
  const totalCredits = keys.reduce((s, k) => s + (k.credits ?? 0), 0);

  // ── redirect ──────────────────────────────────────────────────────────────

  if (!loading && !session) return <Navigate to="/login" replace />;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.shell}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.kicker}>Developer Console</p>
            <h1 className={styles.title}>API Key Management</h1>
            <p className={styles.subtitle}>
              Create, inspect, and revoke access tokens for your applications.
            </p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Total Keys</span>
              <span className={styles.statValue}>{keys.length}</span>
            </div>
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Active</span>
              <span className={styles.statValue} style={{ color: "var(--green)" }}>
                {activeCount}
              </span>
            </div>
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Credits Used</span>
              <span className={styles.statValue}>{totalUsed}</span>
            </div>
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Total Credits</span>
              <span className={styles.statValue}>{totalCredits}</span>
            </div>
          </div>
        </div>

        {/* ── ALERTS ── */}
        {error && <div className={styles.error}>⚠ {error}</div>}
        {flash && <div className={styles.flash}>✓ {flash}</div>}

        {/* ── NEW KEY BANNER ── */}
        {newKey && (
          <div className={styles.keyBanner}>
            <div className={styles.keyBannerHeader}>
              <span className={styles.keyBannerTitle}>🔑 New Key Generated</span>
              <span className={styles.keyBannerNote}>
                Copy it now — it won't be shown again
              </span>
            </div>
            <div className={styles.keyBannerBody}>
              <code className={styles.generatedKeyCode}>{newKey}</code>
              <button
                className={styles.btnGhost}
                onClick={() => handleCopy(newKey, "banner")}
              >
                {copiedId === "banner" ? "Copied!" : "Copy"}
              </button>
              <button
                className={styles.btnGhost}
                onClick={() => setNewKey(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className={styles.grid}>

          {/* ── SIDEBAR: CREATE FORM ── */}
          <div className={styles.sidebar}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Create New Key</h2>
              </div>
              <form className={styles.panelBody} onSubmit={handleCreate}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Key Name</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. Mobile App, Production"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    maxLength={64}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Credit Limit</label>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    max={1_000_000}
                    placeholder="1000"
                    value={form.limit}
                    onChange={(e) =>
                      setForm({ ...form, limit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className={styles.divider} />
                <button
                  className={styles.btnPrimary}
                  type="submit"
                  disabled={submitting || !form.name.trim()}
                >
                  {submitting ? "Generating…" : "Generate API Key"}
                </button>
              </form>
            </div>

            {/* Plan info */}
            {keys.length > 0 && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Account Plan</h2>
                </div>
                <div className={styles.accountBar} style={{ margin: "0", border: "none", borderRadius: 0, flexDirection: "column", gap: 0 }}>
                  {[
                    ["Plan", keys[0]?.plan ?? "free"],
                    ["Keys", `${keys.length} total`],
                    ["Active", `${activeCount} enabled`],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.accountItem}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── MAIN: KEYS TABLE ── */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                API Keys
                {!loading && (
                  <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 8 }}>
                    ({keys.length})
                  </span>
                )}
              </h2>
              {!loading && keys.length > 0 && (
                <button
                  className={styles.btnGhost}
                  onClick={() => loadData(session)}
                >
                  Refresh
                </button>
              )}
            </div>

            {loading ? (
              <div className={styles.loadingCard}>Loading keys…</div>
            ) : keys.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🗝</div>
                <div>No API keys yet. Create your first key to get started.</div>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                {/* Head */}
                <div className={styles.tableHead}>
                  <div className={styles.thCell}>Name</div>
                  <div className={styles.thCell}>Key</div>
                  <div className={styles.thCell}>Status</div>
                  <div className={styles.thCell}>Usage</div>
                  <div className={styles.thCell}>Created</div>
                  <div className={styles.thCell}>Action</div>
                </div>

                {/* Rows */}
                <div className={styles.tableBody}>
                  {keys.map((k) => {
                    const isRevealed = revealedId === k._id;
                    const isCopied = copiedId === k._id;
                    const isDeleting = deletingId === k._id;

                    return (
                      <div key={k._id} className={styles.tableRow}>
                        {/* Name */}
                        <div className={styles.tdName} title={k.name}>
                          {k.name || "Untitled"}
                        </div>

                        {/* Key with reveal + copy */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <span className={styles.tdMono} title={k.key}>
                            {isRevealed ? k.key : maskKey(k.key)}
                          </span>
                          <button
                            className={`${styles.btnGhost} ${isRevealed ? styles.btnGhostActive : ""}`}
                            onClick={() => toggleReveal(k._id)}
                            title={isRevealed ? "Hide" : "Reveal"}
                            style={{ padding: "3px 7px", fontSize: 10 }}
                          >
                            {isRevealed ? "Hide" : "Show"}
                          </button>
                          <button
                            className={`${styles.btnGhost} ${isCopied ? styles.btnGhostActive : ""}`}
                            onClick={() => handleCopy(k.key, k._id)}
                            title="Copy full key"
                            style={{ padding: "3px 7px", fontSize: 10 }}
                          >
                            {isCopied ? "✓" : "Copy"}
                          </button>
                        </div>

                        {/* Status badge */}
                        <div>
                          <span
                            className={`${styles.statusBadge} ${
                              k.isActive ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            <span className={styles.statusDot} />
                            {k.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Usage */}
                        <div className={styles.tdUsage}>
                          {k.usedCredits ?? k.usedCount ?? 0}
                          <span style={{ color: "var(--text-muted)" }}>
                            {" "}/ {k.credits ?? 0}
                          </span>
                        </div>

                        {/* Created */}
                        <div className={styles.tdDate}>{fmtDate(k.createdAt)}</div>

                        {/* Delete */}
                        <div>
                          <button
                            className={styles.btnDanger}
                            onClick={() => handleDelete(k._id)}
                            disabled={isDeleting}
                            title="Delete this API key"
                          >
                            {isDeleting ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
