import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  "https://spatio-temporal-traffic-violation.onrender.com";

function Dashboard({ page = "dashboard" }) {
  const navigate = useNavigate();

  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // =========================================================
  // BACKEND DATA
  // =========================================================

  useEffect(() => {
    const loadViolations = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/api/violations`
        );

        if (!response.ok) {
          throw new Error(
            `Backend error: ${response.status}`
          );
        }

        const data = await response.json();

        setViolations(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "RoadSense backend connection failed:",
          error
        );

        setViolations([]);
      } finally {
        setLoading(false);
      }
    };

    loadViolations();
  }, []);

  // =========================================================
  // ACTUAL CSV FIELD MAPPING
  // =========================================================

  const getViolationType = (row) => {
    return row.Violation || "Unknown";
  };

  const getTimestamp = (row) => {
    return row.Time || "—";
  };

  const getVehicle = (row) => {
    return row.Plate || "UNKNOWN";
  };

  const getTrackId = (row) => {
    return row.Track_ID || "NA";
  };

  const getLocation = (row) => {
    return row.Location || "Unknown location";
  };

  const getSnapshot = (row) => {
    if (!row.Snapshot) {
      return null;
    }

    const filename = String(row.Snapshot)
      .replaceAll("\\", "/")
      .split("/")
      .pop();

    if (!filename) {
      return null;
    }

    return `${API_BASE}/snapshots/${encodeURIComponent(
      filename
    )}`;
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const counts = useMemo(() => {
    const result = {
      total: violations.length,
      helmetless: 0,
      triple: 0,
      mobile: 0,
      wrongWay: 0,
    };

    violations.forEach((row) => {
      const type = String(
        row.Violation || ""
      ).toLowerCase();

      if (type === "helmetless") {
        result.helmetless += 1;
      }

      if (type === "triple_riding") {
        result.triple += 1;
      }

      if (
        type === "mobile_usage" ||
        type === "mobile_phone" ||
        type === "phone_usage" ||
        type === "mobile"
      ) {
        result.mobile += 1;
      }

      if (type === "wrong_way") {
        result.wrongWay += 1;
      }
    });

    return result;
  }, [violations]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredViolations = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return violations;
    }

    return violations.filter((row) =>
      Object.values(row).some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      )
    );
  }, [violations, search]);

  // =========================================================
  // CSV EXPORT
  // =========================================================

  const exportCSV = () => {
    if (!violations.length) {
      return;
    }

    const headers = Object.keys(
      violations[0]
    );

    const rows = [
      headers.join(","),

      ...violations.map((row) =>
        headers
          .map((header) => {
            const value =
              row[header] ?? "";

            return `"${String(value).replaceAll(
              '"',
              '""'
            )}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob(
      [rows.join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "roadsense_violations.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      key: "dashboard",
    },
    {
      label: "Violations",
      path: "/violations",
      key: "violations",
    },
  ];

  const isDashboard =
    page === "dashboard";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div style={styles.app}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside style={styles.sidebar}>

        <div style={styles.brand}>

          <div style={styles.brandMark}>
            R
          </div>

          <div>
            <div style={styles.brandName}>
              RoadSense
            </div>

            <div style={styles.brandSubtitle}>
              Mobility Intelligence
            </div>
          </div>

        </div>

        <div style={styles.sidebarSection}>
          MAIN
        </div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() =>
                navigate(item.path)
              }
              style={{
                ...styles.navItem,

                ...(page === item.key
                  ? styles.navItemActive
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.navIndicator,

                  ...(page === item.key
                    ? styles.navIndicatorActive
                    : {}),
                }}
              />

              {item.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>

          <div style={styles.systemBox}>

            <div style={styles.systemDot} />

            <div>
              <div style={styles.systemTitle}>
                System Online
              </div>

              <div style={styles.systemText}>
                Edge services operational
              </div>
            </div>

          </div>

          <div style={styles.version}>
            RoadSense AI • v1.0
          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>

            <div style={styles.breadcrumb}>
              ROADSENSE /{" "}
              {isDashboard
                ? "DASHBOARD"
                : "VIOLATIONS"}
            </div>

            <h1 style={styles.title}>
              {isDashboard
                ? "Mobility Intelligence Dashboard"
                : "Traffic Violations"}
            </h1>

            <p style={styles.description}>
              {isDashboard
                ? "Overview of vehicle activity, detected traffic events and system status."
                : "Review and analyse traffic violations detected by the RoadSense Edge-AI system."}
            </p>

          </div>

          <div style={styles.headerStatus}>
            <span style={styles.liveDot} />
            Live System
          </div>

        </header>

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {isDashboard && (
          <>

            {/* HERO */}

            <section style={styles.hero}>

              <div>

                <div style={styles.heroLabel}>
                  EDGE-AI MOBILITY PLATFORM
                </div>

                <h2 style={styles.heroTitle}>
                  Intelligent road monitoring
                  <br />
                  from existing CCTV infrastructure.
                </h2>

                <p style={styles.heroText}>
                  RoadSense analyses vehicle movement
                  locally at the edge to identify
                  traffic events, generate evidence
                  and provide mobility intelligence.
                </p>

              </div>

              <div style={styles.heroMetric}>

                <div style={styles.heroMetricLabel}>
                  DETECTED EVENTS
                </div>

                <div style={styles.heroMetricValue}>
                  {counts.total}
                </div>

                <div style={styles.heroMetricSub}>
                  Processed traffic events
                </div>

              </div>

            </section>

            {/* KPI CARDS */}

            <section style={styles.kpiGrid}>

              <KPI
                label="Total Events"
                value={counts.total}
                description="Detected traffic events"
              />

              <KPI
                label="Helmetless Riding"
                value={counts.helmetless}
                description="Helmet-related violations"
              />

              <KPI
                label="Triple Riding"
                value={counts.triple}
                description="Excess rider events"
              />

              <KPI
                label="Wrong-Way Movement"
                value={counts.wrongWay}
                description="Direction violations"
              />

            </section>

            {/* ANALYTICS + STATUS */}

            <section style={styles.twoColumn}>

              <div style={styles.card}>

                <CardHeader
                  title="Violation Intelligence"
                  subtitle="Distribution of detected traffic events"
                />

                <Bar
                  label="Helmetless Riding"
                  value={counts.helmetless}
                  total={counts.total}
                />

                <Bar
                  label="Triple Riding"
                  value={counts.triple}
                  total={counts.total}
                />

                <Bar
                  label="Mobile Phone Usage"
                  value={counts.mobile}
                  total={counts.total}
                />

                <Bar
                  label="Wrong-Way Movement"
                  value={counts.wrongWay}
                  total={counts.total}
                />

              </div>

              <div style={styles.card}>

                <CardHeader
                  title="System Status"
                  subtitle="RoadSense service availability"
                />

                <div style={styles.statusList}>

                  <StatusRow
                    name="Edge AI Processing"
                    status="Operational"
                  />

                  <StatusRow
                    name="Traffic Detection"
                    status="Operational"
                  />

                  <StatusRow
                    name="Evidence Service"
                    status="Operational"
                  />

                  <StatusRow
                    name="Backend API"
                    status="Connected"
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                VIDEO
            ================================================= */}

            <section style={styles.card}>

              <CardHeader
                title="Processed Traffic Video"
                subtitle="RoadSense detection output"
              />

              <div style={styles.videoContainer}>

                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={styles.video}
                  onError={(event) => {
                    console.error(
                      "Video loading error:",
                      event
                    );
                  }}
                >
                  <source
                    src="/output_video.mp4"
                    type="video/mp4"
                  />

                  Your browser does not support
                  HTML5 video.
                </video>

              </div>

            </section>

            {/* RECENT EVENTS */}

            <section style={styles.card}>

              <CardHeader
                title="Recent Traffic Events"
                subtitle={`${filteredViolations.length} records`}
              />

              <Toolbar
                search={search}
                setSearch={setSearch}
                exportCSV={exportCSV}
              />

              <ViolationTable
                violations={filteredViolations}
                loading={loading}
                getViolationType={
                  getViolationType
                }
                getTimestamp={
                  getTimestamp
                }
                getVehicle={
                  getVehicle
                }
                getTrackId={
                  getTrackId
                }
                getLocation={
                  getLocation
                }
                getSnapshot={
                  getSnapshot
                }
                onEvidence={
                  setSelectedEvidence
                }
              />

            </section>

          </>
        )}

        {/* ===================================================
            VIOLATIONS PAGE
        =================================================== */}

        {!isDashboard && (
          <section style={styles.card}>

            <CardHeader
              title="Traffic Violation Records"
              subtitle="Detected events from the RoadSense backend"
            />

            <Toolbar
              search={search}
              setSearch={setSearch}
              exportCSV={exportCSV}
            />

            <ViolationTable
              violations={filteredViolations}
              loading={loading}
              getViolationType={
                getViolationType
              }
              getTimestamp={
                getTimestamp
              }
              getVehicle={
                getVehicle
              }
              getTrackId={
                getTrackId
              }
              getLocation={
                getLocation
              }
              getSnapshot={
                getSnapshot
              }
              onEvidence={
                setSelectedEvidence
              }
            />

          </section>
        )}

        {/* FOOTER */}

        <footer style={styles.footer}>
          <span>
            RoadSense AI
          </span>

          <span>
            Edge-AI Based Mobility Intelligence Platform
          </span>
        </footer>

      </main>

      {/* =====================================================
          EVIDENCE MODAL
      ===================================================== */}

      {selectedEvidence && (
        <div
          style={styles.modalOverlay}
          onClick={() =>
            setSelectedEvidence(null)
          }
        >

          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div style={styles.modalHeader}>

              <div>

                <div style={styles.modalEyebrow}>
                  TRAFFIC EVIDENCE
                </div>

                <h2 style={styles.modalTitle}>
                  {getViolationType(
                    selectedEvidence
                  )}
                </h2>

              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedEvidence(null)
                }
              >
                ×
              </button>

            </div>

            {getSnapshot(
              selectedEvidence
            ) ? (
              <img
                src={getSnapshot(
                  selectedEvidence
                )}
                alt="RoadSense traffic evidence"
                style={styles.evidenceImage}
              />
            ) : (
              <div style={styles.noEvidence}>
                No evidence image available.
              </div>
            )}

            <div style={styles.evidenceInfo}>

              <div>
                <span>
                  Violation
                </span>

                <strong>
                  {getViolationType(
                    selectedEvidence
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Vehicle
                </span>

                <strong>
                  {getVehicle(
                    selectedEvidence
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Time
                </span>

                <strong>
                  {getTimestamp(
                    selectedEvidence
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Location
                </span>

                <strong>
                  {getLocation(
                    selectedEvidence
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function KPI({
  label,
  value,
  description,
}) {
  return (
    <div style={styles.kpi}>

      <div style={styles.kpiLabel}>
        {label}
      </div>

      <div style={styles.kpiValue}>
        {value}
      </div>

      <div style={styles.kpiDescription}>
        {description}
      </div>

    </div>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  title,
  subtitle,
}) {
  return (
    <div style={styles.cardHeader}>

      <div>

        <h2 style={styles.cardTitle}>
          {title}
        </h2>

        <p style={styles.cardSubtitle}>
          {subtitle}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusRow({
  name,
  status,
}) {
  return (
    <div style={styles.statusRow}>

      <div style={styles.statusIndicator} />

      <div style={styles.statusName}>
        {name}
      </div>

      <div style={styles.statusValue}>
        {status}
      </div>

    </div>
  );
}

/* =========================================================
   BAR
========================================================= */

function Bar({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div style={styles.barRow}>

      <div style={styles.barLabel}>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div style={styles.barTrack}>

        <div
          style={{
            ...styles.barFill,
            width: `${Math.max(
              percentage,
              value > 0 ? 4 : 0
            )}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   TOOLBAR
========================================================= */

function Toolbar({
  search,
  setSearch,
  exportCSV,
}) {
  return (
    <div style={styles.toolbar}>

      <input
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search traffic events..."
        style={styles.searchInput}
      />

      <button
        onClick={exportCSV}
        style={styles.exportButton}
      >
        Export CSV
      </button>

    </div>
  );
}

/* =========================================================
   VIOLATION TABLE
========================================================= */

function ViolationTable({
  violations,
  loading,
  getViolationType,
  getTimestamp,
  getVehicle,
  getTrackId,
  getLocation,
  getSnapshot,
  onEvidence,
}) {
  if (loading) {
    return (
      <div style={styles.emptyState}>
        Loading traffic events...
      </div>
    );
  }

  if (!violations.length) {
    return (
      <div style={styles.emptyState}>
        No traffic events found.
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>

      <table style={styles.table}>

        <thead>

          <tr>

            <th style={styles.th}>
              VIOLATION
            </th>

            <th style={styles.th}>
              PLATE
            </th>

            <th style={styles.th}>
              TIME
            </th>

            <th style={styles.th}>
              LOCATION
            </th>

            <th style={styles.th}>
              EVIDENCE
            </th>

          </tr>

        </thead>

        <tbody>

          {violations
            .slice(0, 50)
            .map((row, index) => {

              const snapshot =
                getSnapshot(row);

              const type =
                getViolationType(row);

              return (
                <tr
                  key={`${getTimestamp(
                    row
                  )}-${index}`}
                  style={styles.tr}
                >

                  <td style={styles.td}>

                    <div
                      style={
                        styles.eventCell
                      }
                    >

                      <span
                        style={
                          styles.eventDot
                        }
                      />

                      <span>
                        {formatViolation(
                          type
                        )}
                      </span>

                    </div>

                  </td>

                  <td style={styles.td}>
                    {getVehicle(row)}
                  </td>

                  <td style={styles.td}>
                    {getTimestamp(row)}
                  </td>

                  <td style={styles.td}>
                    {getLocation(row)}
                  </td>

                  <td style={styles.td}>

                    {snapshot ? (
                      <button
                        style={
                          styles.viewButton
                        }
                        onClick={() =>
                          onEvidence(row)
                        }
                      >
                        View Evidence
                      </button>
                    ) : (
                      <span
                        style={
                          styles.noEvidenceText
                        }
                      >
                        Not available
                      </span>
                    )}

                  </td>

                </tr>
              );
            })}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   VIOLATION DISPLAY NAMES
========================================================= */

function formatViolation(type) {
  const value = String(
    type || ""
  ).toLowerCase();

  if (value === "helmetless") {
    return "Helmetless Riding";
  }

  if (value === "triple_riding") {
    return "Triple Riding";
  }

  if (value === "wrong_way") {
    return "Wrong-Way Movement";
  }

  if (
    value === "mobile_usage" ||
    value === "mobile_phone" ||
    value === "phone_usage"
  ) {
    return "Mobile Phone Usage";
  }

  return type || "Traffic Event";
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F4F7FA",
    color: "#172033",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "250px",
    background: "#FFFFFF",
    borderRight:
      "1px solid #E1E7ED",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding:
      "0 10px 34px",
  },

  brandMark: {
    width: "40px",
    height: "40px",
    borderRadius: "9px",
    background: "#145B8A",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
    boxShadow:
      "0 4px 10px rgba(20,91,138,0.18)",
  },

  brandName: {
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#172033",
  },

  brandSubtitle: {
    fontSize: "10px",
    color: "#8994A3",
    marginTop: "2px",
    letterSpacing: "0.3px",
  },

  sidebarSection: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#98A2B0",
    letterSpacing: "1.2px",
    padding:
      "0 12px 10px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#697586",
    padding: "12px",
    marginBottom: "4px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "left",
    fontSize: "13px",
    cursor: "pointer",
  },

  navItemActive: {
    background: "#EAF2F8",
    color: "#145B8A",
    fontWeight: 600,
  },

  navIndicator: {
    width: "3px",
    height: "16px",
    borderRadius: "3px",
    background: "transparent",
  },

  navIndicatorActive: {
    background: "#145B8A",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  systemBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px",
    background: "#F7F9FB",
    border:
      "1px solid #E5EAF0",
    borderRadius: "8px",
  },

  systemDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3B8064",
  },

  systemTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#263246",
  },

  systemText: {
    fontSize: "10px",
    color: "#8B95A3",
    marginTop: "2px",
  },

  version: {
    textAlign: "center",
    color: "#A0A8B5",
    fontSize: "10px",
    marginTop: "16px",
  },

  main: {
    marginLeft: "250px",
    padding:
      "34px 42px 28px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    marginBottom: "30px",
  },

  breadcrumb: {
    color: "#8994A3",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: "9px",
  },

  title: {
    margin: 0,
    fontSize: "27px",
    lineHeight: 1.2,
    letterSpacing: "-0.7px",
    fontWeight: 700,
    color: "#172033",
  },

  description: {
    margin: "8px 0 0",
    color: "#758194",
    fontSize: "13px",
  },

  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#FFFFFF",
    border:
      "1px solid #E1E7ED",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "11px",
    color: "#566174",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    background: "#3B8064",
    borderRadius: "50%",
  },

  hero: {
    background:
      "linear-gradient(135deg, #FFFFFF 0%, #F4F8FB 100%)",
    border:
      "1px solid #DCE5EC",
    borderRadius: "10px",
    padding: "28px 30px",
    display: "flex",
    justifyContent:
      "space-between",
    gap: "30px",
    marginBottom: "18px",
    boxShadow:
      "0 4px 14px rgba(25,52,74,0.045)",
  },

  heroLabel: {
    color: "#145B8A",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.1px",
    marginBottom: "10px",
  },

  heroTitle: {
    fontSize: "24px",
    lineHeight: 1.3,
    margin: 0,
    color: "#17263A",
    letterSpacing: "-0.5px",
  },

  heroText: {
    maxWidth: "650px",
    color: "#758194",
    fontSize: "13px",
    lineHeight: 1.7,
    margin: "13px 0 0",
  },

  heroMetric: {
    minWidth: "180px",
    borderLeft:
      "1px solid #DDE5EB",
    paddingLeft: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroMetricLabel: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#8994A3",
    letterSpacing: "1px",
  },

  heroMetricValue: {
    fontSize: "34px",
    fontWeight: 700,
    color: "#145B8A",
    marginTop: "5px",
  },

  heroMetricSub: {
    fontSize: "10px",
    color: "#8A94A4",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  kpi: {
    background: "#FFFFFF",
    border:
      "1px solid #E0E6EC",
    borderRadius: "9px",
    padding: "18px",
    boxShadow:
      "0 2px 8px rgba(24,39,58,0.025)",
  },

  kpiLabel: {
    fontSize: "11px",
    color: "#788496",
    fontWeight: 600,
  },

  kpiValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#172033",
    marginTop: "8px",
  },

  kpiDescription: {
    fontSize: "10px",
    color: "#9AA3B1",
    marginTop: "4px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "1.4fr 1fr",
    gap: "18px",
  },

  card: {
    background: "#FFFFFF",
    border:
      "1px solid #E0E6EC",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow:
      "0 3px 12px rgba(24,39,58,0.03)",
  },

  cardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 650,
    color: "#1A2435",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#8A94A4",
    fontSize: "11px",
  },

  barRow: {
    marginBottom: "18px",
  },

  barLabel: {
    display: "flex",
    justifyContent:
      "space-between",
    fontSize: "11px",
    color: "#687386",
    marginBottom: "7px",
  },

  barTrack: {
    height: "7px",
    background: "#EDF1F5",
    borderRadius: "5px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#2E6F98",
    borderRadius: "5px",
    transition:
      "width 0.3s ease",
  },

  statusList: {
    borderTop:
      "1px solid #EDF0F4",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 0",
    borderBottom:
      "1px solid #EDF0F4",
  },

  statusIndicator: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3B8064",
  },

  statusName: {
    flex: 1,
    fontSize: "12px",
    color: "#566174",
  },

  statusValue: {
    fontSize: "10px",
    color: "#3B8064",
    fontWeight: 600,
  },

  videoContainer: {
    width: "100%",
    background: "#101820",
    borderRadius: "8px",
    overflow: "hidden",
    border:
      "1px solid #DCE2E8",
  },

  video: {
    width: "100%",
    height: "auto",
    maxHeight: "560px",
    display: "block",
    background: "#101820",
  },

  toolbar: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "12px",
    marginBottom: "16px",
  },

  searchInput: {
    flex: 1,
    maxWidth: "420px",
    border:
      "1px solid #D9E0E7",
    borderRadius: "6px",
    padding: "10px 12px",
    outline: "none",
    fontSize: "12px",
    color: "#263246",
    background: "#FBFCFD",
    boxSizing: "border-box",
  },

  exportButton: {
    border:
      "1px solid #D2DCE5",
    background: "#FFFFFF",
    color: "#245B7A",
    borderRadius: "6px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    textAlign: "left",
    fontSize: "9px",
    color: "#8D97A5",
    letterSpacing: "0.8px",
    fontWeight: 700,
    padding:
      "11px 10px",
    borderBottom:
      "1px solid #E5E9EE",
  },

  tr: {
    borderBottom:
      "1px solid #EEF1F4",
  },

  td: {
    padding:
      "14px 10px",
    fontSize: "11px",
    color: "#5F6B7C",
    verticalAlign: "middle",
  },

  eventCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#293548",
    fontWeight: 600,
  },

  eventDot: {
    width: "6px",
    height: "6px",
    background: "#2E6F98",
    borderRadius: "50%",
    flexShrink: 0,
  },

  viewButton: {
    border: "none",
    background: "#EAF2F8",
    color: "#245B7A",
    borderRadius: "5px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },

  noEvidenceText: {
    color: "#A0A8B5",
    fontSize: "10px",
  },

  emptyState: {
    padding: "45px 20px",
    textAlign: "center",
    color: "#8A94A4",
    fontSize: "12px",
  },

  footer: {
    display: "flex",
    justifyContent:
      "space-between",
    color: "#9AA3B1",
    fontSize: "10px",
    padding:
      "8px 2px 0",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,25,36,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 100,
  },

  modal: {
    width: "min(780px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: "10px",
    padding: "22px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  modalEyebrow: {
    color: "#8994A3",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "18px",
    color: "#1B2638",
  },

  closeButton: {
    border: "none",
    background: "#F1F4F7",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    fontSize: "20px",
    color: "#667286",
    cursor: "pointer",
  },

  evidenceImage: {
    width: "100%",
    maxHeight: "500px",
    objectFit: "contain",
    background: "#F3F5F7",
    borderRadius: "7px",
    display: "block",
  },

  noEvidence: {
    padding: "70px 20px",
    textAlign: "center",
    background: "#F7F8FA",
    borderRadius: "7px",
    color: "#8B95A4",
    fontSize: "12px",
  },

  evidenceInfo: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "14px",
    marginTop: "18px",
    paddingTop: "18px",
    borderTop:
      "1px solid #E7EBEF",
  },
};

export default Dashboard;
