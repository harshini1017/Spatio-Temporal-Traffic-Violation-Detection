import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://spatio-temporal-traffic-violation.onrender.com";

const COLORS = {
  bg: "#070b14",
  panel: "#0d1320",
  panel2: "#111827",
  border: "rgba(255,255,255,0.08)",
  text: "#f8fafc",
  muted: "#94a3b8",
  cyan: "#22d3ee",
  blue: "#60a5fa",
  green: "#34d399",
  yellow: "#fbbf24",
  red: "#fb7185",
  purple: "#a78bfa",
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatCard({ title, value, subtitle, icon, accent }) {
  return (
    <div
      style={{
        ...styles.statCard,
        boxShadow: `0 0 35px ${accent}10`,
      }}
    >
      <div
        style={{
          ...styles.statIcon,
          color: accent,
          background: `${accent}14`,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={styles.statTitle}>{title}</div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statSubtitle}>{subtitle}</div>
      </div>

      <div
        style={{
          width: 4,
          height: 42,
          borderRadius: 10,
          background: accent,
          opacity: 0.8,
        }}
      />
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>

        {subtitle && (
          <p style={styles.sectionSubtitle}>{subtitle}</p>
        )}
      </div>

      {action}
    </div>
  );
}

function Badge({ children, type = "default" }) {
  const badgeStyles = {
    danger: {
      bg: "rgba(251,113,133,0.12)",
      color: "#fb7185",
    },

    warning: {
      bg: "rgba(251,191,36,0.12)",
      color: "#fbbf24",
    },

    success: {
      bg: "rgba(52,211,153,0.12)",
      color: "#34d399",
    },

    info: {
      bg: "rgba(34,211,238,0.12)",
      color: "#22d3ee",
    },

    default: {
      bg: "rgba(148,163,184,0.12)",
      color: "#cbd5e1",
    },
  };

  const selected = badgeStyles[type] || badgeStyles.default;

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: 999,
        background: selected.bg,
        color: selected.color,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================
   DATA HELPERS
========================================================= */

function getViolationType(row) {
  const raw = String(
    row?.Violation ||
      row?.violation ||
      row?.Type ||
      row?.type ||
      row?.Violation_Type ||
      row?.violation_type ||
      "Traffic Event"
  );

  const lower = raw.toLowerCase();

  if (lower.includes("helmet")) {
    return "Helmetless Riding";
  }

  if (
    lower.includes("triple") ||
    lower.includes("rider") ||
    lower.includes("excess")
  ) {
    return "Excessive Rider Count";
  }

  if (
    lower.includes("mobile") ||
    lower.includes("phone")
  ) {
    return "Mobile Phone Usage";
  }

  if (lower.includes("wrong")) {
    return "Wrong-Way Movement";
  }

  return raw;
}

function getSeverity(type) {
  const lower = String(type).toLowerCase();

  if (lower.includes("wrong")) {
    return "danger";
  }

  if (lower.includes("rider")) {
    return "danger";
  }

  if (lower.includes("helmet")) {
    return "warning";
  }

  if (lower.includes("mobile")) {
    return "warning";
  }

  return "info";
}

function getSnapshot(row) {
  return (
    row?.Snapshot ||
    row?.snapshot ||
    row?.Image ||
    row?.image ||
    row?.Evidence ||
    row?.evidence ||
    ""
  );
}

function getTimestamp(row) {
  return (
    row?.Timestamp ||
    row?.timestamp ||
    row?.Time ||
    row?.time ||
    row?.DateTime ||
    row?.datetime ||
    "-"
  );
}

function getPlate(row) {
  return (
    row?.["Number Plate"] ||
    row?.["Number_Plate"] ||
    row?.Plate ||
    row?.plate ||
    row?.License_Plate ||
    row?.license_plate ||
    "Not detected"
  );
}

function getVehicle(row) {
  return (
    row?.Vehicle ||
    row?.vehicle ||
    row?.Vehicle_Type ||
    row?.vehicle_type ||
    "Two-Wheeler"
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const [violations, setViolations] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  const [activeNav, setActiveNav] = useState("Overview");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [lastUpdated, setLastUpdated] = useState(null);

  /* =======================================================
     FETCH BACKEND DATA
  ======================================================= */

  useEffect(() => {
    fetchViolations();

    const interval = setInterval(() => {
      fetchViolations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchViolations() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/violations`
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setViolations(Array.isArray(data) ? data : []);

      setBackendOnline(true);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("RoadSense backend error:", error);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const normalized = useMemo(() => {
    return violations.map((row, index) => {
      const type = getViolationType(row);

      return {
        ...row,

        _id: index,

        _type: type,

        _severity: getSeverity(type),

        _snapshot: getSnapshot(row),

        _timestamp: getTimestamp(row),

        _plate: getPlate(row),

        _vehicle: getVehicle(row),
      };
    });
  }, [violations]);

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredViolations = useMemo(() => {
    return normalized.filter((row) => {
      const matchesFilter =
        filter === "All" ||
        row._type
          .toLowerCase()
          .includes(filter.toLowerCase());

      const searchable = `
        ${row._type}
        ${row._plate}
        ${row._vehicle}
        ${row._timestamp}
      `.toLowerCase();

      return (
        matchesFilter &&
        searchable.includes(search.toLowerCase())
      );
    });
  }, [normalized, filter, search]);

  /* =======================================================
     KPI COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      total: normalized.length,

      helmet: normalized.filter((x) =>
        x._type.toLowerCase().includes("helmet")
      ).length,

      mobile: normalized.filter((x) =>
        x._type.toLowerCase().includes("mobile")
      ).length,

      rider: normalized.filter((x) =>
        x._type.toLowerCase().includes("rider")
      ).length,

      wrongWay: normalized.filter((x) =>
        x._type.toLowerCase().includes("wrong")
      ).length,
    };
  }, [normalized]);

  /* =======================================================
     CHART
  ======================================================= */

  const chartData = [
    {
      label: "Helmet",
      value: counts.helmet,
      color: COLORS.yellow,
    },

    {
      label: "Rider",
      value: counts.rider,
      color: COLORS.red,
    },

    {
      label: "Mobile",
      value: counts.mobile,
      color: COLORS.purple,
    },

    {
      label: "Wrong Way",
      value: counts.wrongWay,
      color: COLORS.cyan,
    },
  ];

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.value),
    1
  );

  /* =======================================================
     URL HELPERS
  ======================================================= */

  const videoUrl =
    `${API_BASE}/videos/helmetless_fixed.mp4`;

  function snapshotUrl(row) {
    if (!row?._snapshot) {
      return "";
    }

    const filename = String(row._snapshot)
      .replaceAll("\\", "/")
      .split("/")
      .pop();

    return `${API_BASE}/snapshots/${encodeURIComponent(
      filename
    )}`;
  }

  function exportCSV() {
    window.open(
      `${API_BASE}/download/csv`,
      "_blank"
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div style={styles.app}>

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside style={styles.sidebar}>

        {/* BRAND */}

        <div style={styles.brand}>

          <div style={styles.brandMark}>
            R
          </div>

          <div>
            <div style={styles.brandName}>
              RoadSense
            </div>

            <div style={styles.brandSub}>
              AI MOBILITY INTELLIGENCE
            </div>
          </div>

        </div>

        {/* NAVIGATION */}

        <div style={styles.navLabel}>
          MONITORING
        </div>

        {[
          ["Overview", "◈"],
          ["Violations", "⚠"],
          ["Evidence", "▣"],
          ["Analytics", "◌"],
        ].map(([item, icon]) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            style={{
              ...styles.navButton,

              ...(activeNav === item
                ? styles.navButtonActive
                : {}),
            }}
          >

            <span style={styles.navIcon}>
              {icon}
            </span>

            {item}

            {item === "Violations" &&
              normalized.length > 0 && (
                <span style={styles.navCount}>
                  {normalized.length}
                </span>
              )}

          </button>
        ))}

        <div style={styles.navLabel}>
          SYSTEM
        </div>

        <button
          style={styles.navButton}
          onClick={() =>
            window.open(
              `${API_BASE}/health`,
              "_blank"
            )
          }
        >
          <span style={styles.navIcon}>
            ⌁
          </span>

          Backend Health
        </button>

        {/* SIDEBAR BOTTOM */}

        <div style={styles.sidebarBottom}>

          <div style={styles.systemBox}>

            <div style={styles.systemTop}>

              <span
                style={{
                  ...styles.statusDot,

                  background: backendOnline
                    ? COLORS.green
                    : COLORS.red,
                }}
              />

              {backendOnline
                ? "SYSTEM ONLINE"
                : "BACKEND OFFLINE"}

            </div>

            <div style={styles.systemText}>
              Edge-AI perception and mobility
              intelligence service
            </div>

          </div>

          <div style={styles.version}>
            ROADSENSE AI • v1.0
          </div>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>

            <div style={styles.breadcrumb}>
              ROADSENSE /{" "}
              {activeNav.toUpperCase()}
            </div>

            <h1 style={styles.pageTitle}>
              Mobility Intelligence Center
            </h1>

            <p style={styles.pageSubtitle}>
              Edge-AI powered traffic monitoring
              and violation intelligence
            </p>

          </div>

          <div style={styles.headerRight}>

            <div style={styles.liveStatus}>

              <span
                style={{
                  ...styles.liveDot,

                  background: backendOnline
                    ? COLORS.green
                    : COLORS.red,
                }}
              />

              {backendOnline
                ? "LIVE SYSTEM"
                : "OFFLINE"}

            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchViolations}
            >
              ↻ Refresh
            </button>

          </div>

        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section style={styles.hero}>

          <div>

            <div style={styles.heroEyebrow}>
              EDGE-AI TRAFFIC OPERATIONS
            </div>

            <h2 style={styles.heroTitle}>
              Intelligent mobility.
              <br />

              <span style={styles.heroHighlight}>
                Real-time awareness.
              </span>
            </h2>

            <p style={styles.heroDescription}>
              RoadSense transforms CCTV intelligence
              into structured mobility events,
              evidence, analytics and traffic insights.
            </p>

            <div style={styles.heroPills}>

              <span style={styles.heroPill}>
                YOLOv8
              </span>

              <span style={styles.heroPill}>
                ByteTrack
              </span>

              <span style={styles.heroPill}>
                Edge AI
              </span>

              <span style={styles.heroPill}>
                ANPR
              </span>

            </div>

          </div>

          <div style={styles.heroOrb}>

            <div style={styles.orbRing}>

              <div style={styles.orbCore}>

                <div style={styles.orbNumber}>
                  {counts.total}
                </div>

                <div style={styles.orbLabel}>
                  EVENTS
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section style={styles.statsGrid}>

          <StatCard
            title="Total Events"
            value={counts.total}
            subtitle="Recorded mobility events"
            icon="◎"
            accent={COLORS.cyan}
          />

          <StatCard
            title="Helmet Violations"
            value={counts.helmet}
            subtitle="Safety compliance"
            icon="◉"
            accent={COLORS.yellow}
          />

          <StatCard
            title="Excess Rider Count"
            value={counts.rider}
            subtitle="Two-wheeler violations"
            icon="♢"
            accent={COLORS.red}
          />

          <StatCard
            title="Mobile Usage"
            value={counts.mobile}
            subtitle="Rider phone detection"
            icon="▣"
            accent={COLORS.purple}
          />

        </section>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section style={styles.twoColumn}>

          {/* CHART */}

          <div style={styles.card}>

            <SectionHeader
              title="Violation Intelligence"
              subtitle="Distribution of detected traffic events"
              action={
                <Badge type="info">
                  {counts.total} TOTAL
                </Badge>
              }
            />

            <div style={styles.chart}>

              {chartData.map((item) => {

                const height = Math.max(
                  10,
                  (item.value /
                    maxChartValue) *
                    100
                );

                return (
                  <div
                    style={styles.barGroup}
                    key={item.label}
                  >

                    <div style={styles.barValue}>
                      {item.value}
                    </div>

                    <div style={styles.barTrack}>

                      <div
                        style={{
                          ...styles.bar,

                          height: `${height}%`,

                          background:
                            item.color,

                          boxShadow:
                            `0 0 20px ${item.color}40`,
                        }}
                      />

                    </div>

                    <div style={styles.barLabel}>
                      {item.label}
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* SYSTEM STATUS */}

          <div style={styles.card}>

            <SectionHeader
              title="System Status"
              subtitle="RoadSense infrastructure"
            />

            <div style={styles.statusList}>

              <div style={styles.statusRow}>

                <div style={styles.statusName}>
                  <span style={styles.statusIcon}>
                    ◉
                  </span>

                  Edge Processing
                </div>

                <Badge type="success">
                  ACTIVE
                </Badge>

              </div>

              <div style={styles.statusRow}>

                <div style={styles.statusName}>
                  <span style={styles.statusIcon}>
                    ◌
                  </span>

                  Video Analytics
                </div>

                <Badge type="success">
                  READY
                </Badge>

              </div>

              <div style={styles.statusRow}>

                <div style={styles.statusName}>
                  <span style={styles.statusIcon}>
                    ◇
                  </span>

                  Evidence Storage
                </div>

                <Badge type="success">
                  AVAILABLE
                </Badge>

              </div>

              <div style={styles.statusRow}>

                <div style={styles.statusName}>
                  <span style={styles.statusIcon}>
                    ⌁
                  </span>

                  Backend API
                </div>

                <Badge
                  type={
                    backendOnline
                      ? "success"
                      : "danger"
                  }
                >
                  {backendOnline
                    ? "CONNECTED"
                    : "OFFLINE"}
                </Badge>

              </div>

            </div>

            <div style={styles.healthMeter}>

              <div style={styles.healthHeader}>

                <span>
                  System availability
                </span>

                <strong>
                  {backendOnline
                    ? "Operational"
                    : "Attention"}
                </strong>

              </div>

              <div style={styles.progressTrack}>

                <div
                  style={{
                    ...styles.progress,

                    width: backendOnline
                      ? "96%"
                      : "25%",

                    background: backendOnline
                      ? COLORS.green
                      : COLORS.red,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            VIDEO + MAP
        ================================================= */}

        <section style={styles.twoColumn}>

          {/* VIDEO */}

          <div style={styles.card}>

            <SectionHeader
              title="Processed Video"
              subtitle="AI-generated traffic analysis output"
              action={
                <Badge type="success">
                  READY
                </Badge>
              }
            />

            <div style={styles.videoWrapper}>

              <video
                controls
                preload="metadata"
                style={styles.video}
                src={videoUrl}
              />

              <div style={styles.videoOverlay}>

                <span>
                  ROADSENSE AI
                </span>

                <span>
                  EDGE ANALYTICS
                </span>

              </div>

            </div>

          </div>

          {/* MAP */}

          <div style={styles.card}>

            <SectionHeader
              title="Monitoring Zone"
              subtitle="Traffic intelligence deployment area"
            />

            <div style={styles.mapWrapper}>

              <iframe
                title="RoadSense monitoring location"
                src="https://www.google.com/maps?q=Trichy,Tamil%20Nadu,India&output=embed"
                style={styles.map}
                loading="lazy"
              />

              <div style={styles.mapTag}>

                <span style={styles.mapPulse} />

                Trichy Monitoring Zone

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            TRAFFIC EVENTS TABLE
        ================================================= */}

        <section style={styles.card}>

          <SectionHeader
            title="Recent Traffic Events"
            subtitle={
              lastUpdated
                ? `Last synchronized ${lastUpdated.toLocaleTimeString()}`
                : "Synchronizing with backend..."
            }
            action={
              <button
                style={styles.exportButton}
                onClick={exportCSV}
              >
                ↓ Export CSV
              </button>
            }
          />

          {/* TOOLBAR */}

          <div style={styles.toolbar}>

            <div style={styles.searchBox}>

              <span>⌕</span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search violations, plates, vehicles..."
                style={styles.searchInput}
              />

            </div>

            <div style={styles.filters}>

              {[
                "All",
                "Helmet",
                "Rider",
                "Mobile",
                "Wrong",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  style={{
                    ...styles.filterButton,

                    ...(filter === item
                      ? styles.filterActive
                      : {}),
                  }}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* LOADING */}

          {loading ? (

            <div style={styles.emptyState}>

              <div style={styles.loader} />

              <div>
                Synchronizing mobility
                intelligence...
              </div>

            </div>

          ) : filteredViolations.length === 0 ? (

            /* EMPTY */

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                ✓
              </div>

              <div style={styles.emptyTitle}>
                No events found
              </div>

              <div style={styles.emptyText}>
                No traffic violations match
                the current filter.
              </div>

            </div>

          ) : (

            /* TABLE */

            <div style={styles.tableWrap}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th>EVENT</th>
                    <th>TIME</th>
                    <th>VEHICLE</th>
                    <th>NUMBER PLATE</th>
                    <th>SEVERITY</th>
                    <th>EVIDENCE</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredViolations
                    .slice(0, 50)
                    .map((row) => (

                      <tr
                        key={row._id}
                        style={styles.tableRow}
                      >

                        <td>

                          <div style={styles.eventCell}>

                            <div
                              style={{
                                ...styles.eventDot,

                                background:
                                  row._severity ===
                                  "danger"
                                    ? COLORS.red
                                    : row._severity ===
                                      "warning"
                                    ? COLORS.yellow
                                    : COLORS.cyan,
                              }}
                            />

                            <div>

                              <div
                                style={
                                  styles.eventName
                                }
                              >
                                {row._type}
                              </div>

                              <div
                                style={
                                  styles.eventSub
                                }
                              >
                                Mobility event detected
                              </div>

                            </div>

                          </div>

                        </td>

                        <td style={styles.mutedCell}>
                          {row._timestamp}
                        </td>

                        <td style={styles.vehicleCell}>
                          {row._vehicle}
                        </td>

                        <td>

                          <span style={styles.plate}>
                            {row._plate}
                          </span>

                        </td>

                        <td>

                          <Badge
                            type={row._severity}
                          >
                            {row._severity.toUpperCase()}
                          </Badge>

                        </td>

                        <td>

                          <button
                            style={
                              styles.viewButton
                            }
                            onClick={() =>
                              setSelected(row)
                            }
                          >
                            View Evidence →
                          </button>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer style={styles.footer}>

          <div>

            <strong>
              RoadSense AI
            </strong>

            <span>
              {" "}
              · Edge-AI Based Mobility
              Intelligence Platform
            </span>

          </div>

          <div>
            {backendOnline
              ? "● System operational"
              : "● Backend unavailable"}
          </div>

        </footer>

      </main>

      {/* =================================================
          EVIDENCE MODAL
      ================================================= */}

      {selected && (

        <div
          style={styles.modalBackdrop}
          onClick={() => setSelected(null)}
        >

          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <div style={styles.modalEyebrow}>
                  TRAFFIC EVENT
                </div>

                <h2 style={styles.modalTitle}>
                  {selected._type}
                </h2>

              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div style={styles.modalContent}>

              {selected._snapshot ? (

                <img
                  src={snapshotUrl(selected)}
                  alt="Traffic violation evidence"
                  style={styles.evidenceImage}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              ) : (

                <div style={styles.noEvidence}>
                  No evidence image available
                </div>

              )}

              {/* EVENT INFORMATION */}

              <div style={styles.evidenceInfo}>

                <div
                  style={styles.evidenceInfoItem}
                >

                  <span>
                    EVENT TYPE
                  </span>

                  <strong>
                    {selected._type}
                  </strong>

                </div>

                <div
                  style={styles.evidenceInfoItem}
                >

                  <span>
                    TIMESTAMP
                  </span>

                  <strong>
                    {selected._timestamp}
                  </strong>

                </div>

                <div
                  style={styles.evidenceInfoItem}
                >

                  <span>
                    VEHICLE
                  </span>

                  <strong>
                    {selected._vehicle}
                  </strong>

                </div>

                <div
                  style={styles.evidenceInfoItem}
                >

                  <span>
                    NUMBER PLATE
                  </span>

                  <strong>
                    {selected._plate}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  /* APP */

  app: {
    minHeight: "100vh",

    background:
      "radial-gradient(circle at 80% 0%, rgba(34,211,238,0.07), transparent 30%), #070b14",

    color: COLORS.text,

    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",

    display: "flex",
  },

  /* SIDEBAR */

  sidebar: {
    width: 250,

    minHeight: "100vh",

    background:
      "rgba(8,12,22,0.97)",

    borderRight:
      `1px solid ${COLORS.border}`,

    padding: "25px 16px",

    position: "fixed",

    left: 0,
    top: 0,
    bottom: 0,

    display: "flex",
    flexDirection: "column",

    zIndex: 10,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,

    padding:
      "4px 8px 30px",
  },

  brandMark: {
    width: 40,
    height: 40,

    borderRadius: 12,

    background:
      "linear-gradient(135deg, #22d3ee, #3b82f6)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    color: "#001018",

    fontWeight: 900,
    fontSize: 20,

    boxShadow:
      "0 0 30px rgba(34,211,238,0.25)",
  },

  brandName: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: -0.5,
  },

  brandSub: {
    fontSize: 8,

    color: COLORS.muted,

    letterSpacing: 1.1,

    marginTop: 3,
  },

  navLabel: {
    color: "#64748b",

    fontSize: 9,

    fontWeight: 800,

    letterSpacing: 1.5,

    padding:
      "12px 10px 8px",
  },

  navButton: {
    width: "100%",

    border: 0,

    background: "transparent",

    color: "#94a3b8",

    padding: "12px",

    borderRadius: 10,

    display: "flex",
    alignItems: "center",

    gap: 12,

    cursor: "pointer",

    fontSize: 13,

    fontWeight: 600,

    textAlign: "left",

    marginBottom: 3,
  },

  navButtonActive: {
    color: "#f8fafc",

    background:
      "linear-gradient(90deg, rgba(34,211,238,0.13), rgba(34,211,238,0.04))",

    boxShadow:
      "inset 2px 0 0 #22d3ee",
  },

  navIcon: {
    width: 20,

    textAlign: "center",

    color: "#67e8f9",

    fontSize: 15,
  },

  navCount: {
    marginLeft: "auto",

    background:
      "rgba(251,113,133,0.14)",

    color: "#fb7185",

    padding: "2px 7px",

    borderRadius: 999,

    fontSize: 10,
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  systemBox: {
    border:
      `1px solid ${COLORS.border}`,

    background:
      "rgba(255,255,255,0.025)",

    borderRadius: 12,

    padding: 13,
  },

  systemTop: {
    display: "flex",
    alignItems: "center",

    gap: 7,

    fontSize: 10,

    fontWeight: 800,

    letterSpacing: 0.8,
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: "50%",

    boxShadow:
      "0 0 10px currentColor",
  },

  systemText: {
    color: "#64748b",

    fontSize: 10,

    lineHeight: 1.5,

    marginTop: 8,
  },

  version: {
    color: "#475569",

    fontSize: 9,

    textAlign: "center",

    marginTop: 15,

    letterSpacing: 0.8,
  },

  /* MAIN */

  main: {
    marginLeft: 250,

    width:
      "calc(100% - 250px)",

    padding:
      "32px 38px",

    maxWidth: 1700,

    boxSizing: "border-box",
  },

  /* HEADER */

  header: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "flex-start",

    gap: 20,

    marginBottom: 28,
  },

  breadcrumb: {
    fontSize: 9,

    color: COLORS.cyan,

    letterSpacing: 1.8,

    fontWeight: 800,

    marginBottom: 8,
  },

  pageTitle: {
    margin: 0,

    fontSize: 28,

    letterSpacing: -1,

    fontWeight: 800,
  },

  pageSubtitle: {
    margin: "7px 0 0",

    color: COLORS.muted,

    fontSize: 12,
  },

  headerRight: {
    display: "flex",

    alignItems: "center",

    gap: 10,
  },

  liveStatus: {
    border:
      `1px solid ${COLORS.border}`,

    background:
      "rgba(255,255,255,0.025)",

    padding: "9px 12px",

    borderRadius: 10,

    fontSize: 10,

    fontWeight: 800,

    letterSpacing: 0.7,

    display: "flex",

    gap: 7,

    alignItems: "center",
  },

  liveDot: {
    width: 7,
    height: 7,

    borderRadius: "50%",
  },

  refreshButton: {
    border:
      `1px solid ${COLORS.border}`,

    background: "#111827",

    color: "#e2e8f0",

    padding: "9px 13px",

    borderRadius: 10,

    cursor: "pointer",

    fontSize: 11,

    fontWeight: 700,
  },

  /* HERO */

  hero: {
    minHeight: 240,

    borderRadius: 18,

    border:
      `1px solid ${COLORS.border}`,

    background:
      "linear-gradient(115deg, rgba(15,23,42,0.98), rgba(8,18,31,0.98))",

    padding:
      "32px 38px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    overflow: "hidden",

    position: "relative",

    marginBottom: 20,
  },

  heroEyebrow: {
    color: COLORS.cyan,

    fontSize: 9,

    fontWeight: 900,

    letterSpacing: 2,

    marginBottom: 12,
  },

  heroTitle: {
    margin: 0,

    fontSize: 36,

    lineHeight: 1.05,

    letterSpacing: -1.8,

    fontWeight: 850,
  },

  heroHighlight: {
    color: COLORS.cyan,
  },

  heroDescription: {
    maxWidth: 620,

    color: "#94a3b8",

    fontSize: 12,

    lineHeight: 1.7,

    marginTop: 15,
  },

  heroPills: {
    display: "flex",

    gap: 7,

    marginTop: 20,

    flexWrap: "wrap",
  },

  heroPill: {
    border:
      "1px solid rgba(34,211,238,0.15)",

    background:
      "rgba(34,211,238,0.06)",

    color: "#a5f3fc",

    borderRadius: 999,

    padding: "6px 10px",

    fontSize: 9,

    fontWeight: 800,

    letterSpacing: 0.6,
  },

  heroOrb: {
    width: 190,
    height: 190,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 45,
  },

  orbRing: {
    width: 170,
    height: 170,

    borderRadius: "50%",

    border:
      "1px solid rgba(34,211,238,0.25)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    boxShadow:
      "0 0 60px rgba(34,211,238,0.08), inset 0 0 50px rgba(34,211,238,0.05)",
  },

  orbCore: {
    width: 115,
    height: 115,

    borderRadius: "50%",

    border:
      "1px solid rgba(34,211,238,0.3)",

    background:
      "rgba(34,211,238,0.05)",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",
  },

  orbNumber: {
    fontSize: 30,

    fontWeight: 900,

    color: "#67e8f9",
  },

  orbLabel: {
    fontSize: 8,

    letterSpacing: 1.5,

    color: COLORS.muted,

    fontWeight: 800,
  },

  /* KPI */

  statsGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: 14,

    marginBottom: 20,
  },

  statCard: {
    background:
      "rgba(13,19,32,0.88)",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 15,

    padding: 18,

    display: "flex",

    alignItems: "center",

    gap: 13,
  },

  statIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: 20,

    flexShrink: 0,
  },

  statTitle: {
    color: "#94a3b8",

    fontSize: 10,

    fontWeight: 700,
  },

  statValue: {
    fontSize: 25,

    fontWeight: 850,

    letterSpacing: -1,

    marginTop: 2,
  },

  statSubtitle: {
    color: "#64748b",

    fontSize: 9,

    marginTop: 2,
  },

  /* GENERAL CARD */

  twoColumn: {
    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 20,

    marginBottom: 20,
  },

  card: {
    background:
      "rgba(13,19,32,0.88)",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 16,

    padding: 22,

    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",

    alignItems: "flex-start",

    justifyContent:
      "space-between",

    gap: 15,

    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,

    margin: 0,

    fontWeight: 800,

    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: "#64748b",

    fontSize: 10,

    margin: "5px 0 0",
  },

  /* CHART */

  chart: {
    height: 220,

    display: "flex",

    alignItems: "flex-end",

    justifyContent:
      "space-around",

    gap: 25,

    padding:
      "10px 25px 0",
  },

  barGroup: {
    flex: 1,

    maxWidth: 70,

    height: "100%",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent:
      "flex-end",
  },

  barValue: {
    fontSize: 11,

    fontWeight: 800,

    marginBottom: 7,
  },

  barTrack: {
    height: 155,

    width: 34,

    borderRadius: 8,

    background:
      "rgba(255,255,255,0.035)",

    display: "flex",

    alignItems: "flex-end",

    overflow: "hidden",
  },

  bar: {
    width: "100%",

    borderRadius:
      "7px 7px 2px 2px",

    transition:
      "height .5s ease",
  },

  barLabel: {
    fontSize: 9,

    color: "#64748b",

    marginTop: 9,

    textAlign: "center",
  },

  /* SYSTEM */

  statusList: {
    display: "flex",

    flexDirection: "column",

    gap: 2,
  },

  statusRow: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    padding: "13px 0",

    borderBottom:
      "1px solid rgba(255,255,255,0.045)",
  },

  statusName: {
    display: "flex",

    alignItems: "center",

    gap: 10,

    fontSize: 11,

    color: "#cbd5e1",

    fontWeight: 600,
  },

  statusIcon: {
    color: COLORS.cyan,
  },

  healthMeter: {
    marginTop: 20,
  },

  healthHeader: {
    display: "flex",

    justifyContent:
      "space-between",

    color: COLORS.muted,

    fontSize: 10,

    marginBottom: 8,
  },

  progressTrack: {
    height: 5,

    borderRadius: 99,

    background:
      "rgba(255,255,255,0.06)",

    overflow: "hidden",
  },

  progress: {
    height: "100%",

    borderRadius: 99,
  },

  /* VIDEO */

  videoWrapper: {
    borderRadius: 12,

    overflow: "hidden",

    background: "#020617",

    position: "relative",

    aspectRatio: "16 / 9",
  },

  video: {
    width: "100%",

    height: "100%",

    objectFit: "cover",

    display: "block",
  },

  videoOverlay: {
    position: "absolute",

    left: 12,
    right: 12,
    top: 12,

    display: "flex",

    justifyContent:
      "space-between",

    pointerEvents: "none",

    fontSize: 8,

    letterSpacing: 1,

    fontWeight: 800,

    color: "#cffafe",

    textShadow:
      "0 1px 5px black",
  },

  /* MAP */

  mapWrapper: {
    borderRadius: 12,

    overflow: "hidden",

    height: 280,

    position: "relative",

    background: "#020617",
  },

  map: {
    width: "100%",

    height: "100%",

    border: 0,

    filter:
      "grayscale(0.25) contrast(1.1)",
  },

  mapTag: {
    position: "absolute",

    left: 12,
    bottom: 12,

    background:
      "rgba(7,11,20,0.9)",

    border:
      `1px solid ${COLORS.border}`,

    padding: "8px 11px",

    borderRadius: 8,

    fontSize: 9,

    fontWeight: 700,

    display: "flex",

    gap: 7,

    alignItems: "center",

    backdropFilter:
      "blur(10px)",
  },

  mapPulse: {
    width: 6,
    height: 6,

    borderRadius: "50%",

    background: COLORS.cyan,

    boxShadow:
      "0 0 10px #22d3ee",
  },

  /* TOOLBAR */

  toolbar: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: 15,

    marginBottom: 18,

    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,

    minWidth: 220,

    maxWidth: 450,

    display: "flex",

    alignItems: "center",

    gap: 9,

    border:
      `1px solid ${COLORS.border}`,

    background:
      "rgba(255,255,255,0.025)",

    borderRadius: 9,

    padding: "9px 11px",

    color: "#64748b",
  },

  searchInput: {
    width: "100%",

    background: "transparent",

    border: 0,

    outline: 0,

    color: "#e2e8f0",

    fontSize: 11,
  },

  filters: {
    display: "flex",

    gap: 5,

    flexWrap: "wrap",
  },

  filterButton: {
    border:
      `1px solid ${COLORS.border}`,

    background: "transparent",

    color: "#64748b",

    padding: "8px 11px",

    borderRadius: 8,

    fontSize: 10,

    cursor: "pointer",

    fontWeight: 700,
  },

  filterActive: {
    background:
      "rgba(34,211,238,0.1)",

    borderColor:
      "rgba(34,211,238,0.3)",

    color: "#67e8f9",
  },

  exportButton: {
    border:
      "1px solid rgba(34,211,238,0.2)",

    background:
      "rgba(34,211,238,0.07)",

    color: "#67e8f9",

    padding: "8px 11px",

    borderRadius: 8,

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 800,
  },

  /* TABLE */

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",

    borderCollapse:
      "collapse",

    minWidth: 800,
  },

  tableRow: {
    borderTop:
      "1px solid rgba(255,255,255,0.045)",
  },

  eventCell: {
    display: "flex",

    alignItems: "center",

    gap: 10,

    padding: "14px 8px",
  },

  eventDot: {
    width: 7,
    height: 7,

    borderRadius: "50%",

    boxShadow:
      "0 0 10px currentColor",
  },

  eventName: {
    fontSize: 11,

    fontWeight: 750,
  },

  eventSub: {
    color: "#64748b",

    fontSize: 9,

    marginTop: 3,
  },

  mutedCell: {
    color: "#94a3b8",

    fontSize: 10,

    padding: "14px 8px",
  },

  vehicleCell: {
    color: "#cbd5e1",

    fontSize: 10,

    padding: "14px 8px",
  },

  plate: {
    fontFamily:
      "monospace",

    fontSize: 10,

    padding:
      "5px 8px",

    borderRadius: 5,

    background:
      "rgba(255,255,255,0.05)",

    color: "#e2e8f0",
  },

  viewButton: {
    border: 0,

    background:
      "transparent",

    color: "#67e8f9",

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 750,
  },

  /* EMPTY */

  emptyState: {
    minHeight: 220,

    display: "flex",

    flexDirection: "column",

    justifyContent:
      "center",

    alignItems: "center",

    color: "#64748b",

    gap: 8,
  },

  loader: {
    width: 25,
    height: 25,

    borderRadius: "50%",

    border:
      "2px solid rgba(34,211,238,0.15)",

    borderTopColor:
      COLORS.cyan,

    marginBottom: 8,
  },

  emptyIcon: {
    width: 42,
    height: 42,

    borderRadius: "50%",

    background:
      "rgba(52,211,153,0.1)",

    color: COLORS.green,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: 20,
  },

  emptyTitle: {
    color: "#e2e8f0",

    fontSize: 13,

    fontWeight: 750,
  },

  emptyText: {
    fontSize: 10,
  },

  /* FOOTER */

  footer: {
    display: "flex",

    justifyContent:
      "space-between",

    color: "#475569",

    fontSize: 9,

    padding:
      "22px 4px",

    marginTop: 5,
  },

  /* MODAL */

  modalBackdrop: {
    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.78)",

    backdropFilter:
      "blur(10px)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: 20,

    zIndex: 100,
  },

  modal: {
    width:
      "min(900px, 100%)",

    maxHeight: "90vh",

    overflowY: "auto",

    background: "#0b111d",

    border:
      "1px solid rgba(255,255,255,0.1)",

    borderRadius: 18,

    boxShadow:
      "0 30px 100px rgba(0,0,0,0.6)",
  },

  modalHeader: {
    padding:
      "20px 22px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    borderBottom:
      `1px solid ${COLORS.border}`,
  },

  modalEyebrow: {
    color: COLORS.cyan,

    fontSize: 8,

    fontWeight: 900,

    letterSpacing: 1.6,
  },

  modalTitle: {
    margin:
      "5px 0 0",

    fontSize: 20,
  },

  closeButton: {
    width: 32,
    height: 32,

    borderRadius: 8,

    border:
      `1px solid ${COLORS.border}`,

    background:
      "rgba(255,255,255,0.04)",

    color: "#cbd5e1",

    fontSize: 20,

    cursor: "pointer",
  },

  modalContent: {
    padding: 22,
  },

  evidenceImage: {
    width: "100%",

    maxHeight: 500,

    objectFit: "contain",

    background: "#020617",

    borderRadius: 12,

    display: "block",
  },

  noEvidence: {
    height: 220,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#64748b",

    background: "#020617",

    borderRadius: 12,
  },

  /* IMPORTANT:
     ONLY ONE evidenceInfo KEY
  */

  evidenceInfo: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, 1fr)",

    gap: 10,

    marginTop: 15,
  },

  evidenceInfoItem: {
    padding: 12,

    borderRadius: 10,

    background:
      "rgba(255,255,255,0.035)",

    border:
      `1px solid ${COLORS.border}`,

    display: "flex",

    flexDirection: "column",

    gap: 5,
  },
};
