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

  useEffect(() => {
    fetch(`${API_BASE}/api/violations`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch violations");
        }
        return response.json();
      })
      .then((data) => {
        setViolations(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Violation API error:", error);
        setViolations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getViolationType = (row) => {
    return (
      row.violation_type ||
      row.violation ||
      row.type ||
      row.event_type ||
      "Traffic Event"
    );
  };

  const getTimestamp = (row) => {
    return (
      row.timestamp ||
      row.time ||
      row.datetime ||
      row.date ||
      "—"
    );
  };

  const getVehicle = (row) => {
    return (
      row.vehicle_number ||
      row.plate_number ||
      row.license_plate ||
      row.vehicle ||
      row.plate ||
      "Not available"
    );
  };

  const getSnapshot = (row) => {
    const value =
      row._snapshot ||
      row.snapshot ||
      row.image ||
      row.evidence ||
      "";

    if (!value) return null;

    const filename = String(value)
      .replaceAll("\\", "/")
      .split("/")
      .pop();

    if (!filename) return null;

    return `${API_BASE}/snapshots/${encodeURIComponent(filename)}`;
  };

  const filteredViolations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return violations;
    }

    return violations.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [violations, search]);

  const counts = useMemo(() => {
    const result = {
      total: violations.length,
      helmet: 0,
      phone: 0,
      triple: 0,
      wrongWay: 0,
    };

    violations.forEach((row) => {
      const type = getViolationType(row).toLowerCase();

      if (type.includes("helmet")) result.helmet += 1;
      if (type.includes("phone") || type.includes("mobile")) {
        result.phone += 1;
      }
      if (
        type.includes("triple") ||
        type.includes("rider") ||
        type.includes("excess")
      ) {
        result.triple += 1;
      }
      if (type.includes("wrong")) result.wrongWay += 1;
    });

    return result;
  }, [violations]);

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
    {
      label: "Analytics",
      path: "/analytics",
      key: "analytics",
    },
    {
      label: "Smart Parking",
      path: "/parking",
      key: "parking",
    },
    {
      label: "ANPR",
      path: "/anpr",
      key: "anpr",
    },
  ];

  const exportCSV = () => {
    if (!violations.length) return;

    const headers = Object.keys(violations[0]);

    const csvRows = [
      headers.join(","),
      ...violations.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            return `"${String(value).replaceAll('"', '""')}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "roadsense_violations.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const pageTitle = {
    dashboard: "Mobility Intelligence Dashboard",
    violations: "Traffic Violations",
    analytics: "Traffic Analytics",
    parking: "Smart Parking",
    anpr: "Automatic Number Plate Recognition",
  };

  const pageDescription = {
    dashboard:
      "Real-time overview of vehicle activity, traffic events and system performance.",
    violations:
      "Review and analyse traffic violations detected by the RoadSense Edge-AI system.",
    analytics:
      "Analyse observed traffic events and mobility patterns from processed CCTV data.",
    parking:
      "Monitor parking-slot occupancy and parking utilisation.",
    anpr:
      "Vehicle identification and number-plate recognition overview.",
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>R</div>

          <div>
            <div style={styles.brandName}>RoadSense</div>
            <div style={styles.brandSubtitle}>Mobility Intelligence</div>
          </div>
        </div>

        <div style={styles.sidebarSection}>MAIN</div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(page === item.key ? styles.navItemActive : {}),
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
              <div style={styles.systemTitle}>System Online</div>
              <div style={styles.systemText}>
                Edge services operational
              </div>
            </div>
          </div>

          <div style={styles.version}>RoadSense AI • v1.0</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>ROADSENSE / {page}</div>

            <h1 style={styles.title}>
              {pageTitle[page] || "Dashboard"}
            </h1>

            <p style={styles.description}>
              {pageDescription[page] || ""}
            </p>
          </div>

          <div style={styles.headerStatus}>
            <span style={styles.liveDot} />
            Live System
          </div>
        </header>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <section style={styles.hero}>
              <div>
                <div style={styles.heroLabel}>EDGE-AI MOBILITY PLATFORM</div>

                <h2 style={styles.heroTitle}>
                  Intelligent road monitoring
                  <br />
                  from existing CCTV infrastructure.
                </h2>

                <p style={styles.heroText}>
                  RoadSense analyses vehicle movement locally at the
                  edge to identify traffic events, generate evidence
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
                  From processed traffic data
                </div>
              </div>
            </section>

            <section style={styles.kpiGrid}>
              <KPI
                label="Total Events"
                value={counts.total}
                description="Detected traffic events"
              />

              <KPI
                label="Helmet Violations"
                value={counts.helmet}
                description="Helmet-related events"
              />

              <KPI
                label="Mobile Usage"
                value={counts.phone}
                description="Phone-use events"
              />

              <KPI
                label="Excess Riders"
                value={counts.triple}
                description="Multiple-rider events"
              />
            </section>

            <section style={styles.twoColumn}>
              <div style={styles.card}>
                <CardHeader
                  title="Violation Intelligence"
                  subtitle="Distribution of detected events"
                />

                <div style={styles.chartArea}>
                  <Bar
                    label="Helmet"
                    value={counts.helmet}
                    total={counts.total}
                  />

                  <Bar
                    label="Mobile"
                    value={counts.phone}
                    total={counts.total}
                  />

                  <Bar
                    label="Excess Riders"
                    value={counts.triple}
                    total={counts.total}
                  />

                  <Bar
                    label="Wrong Way"
                    value={counts.wrongWay}
                    total={counts.total}
                  />
                </div>
              </div>

              <div style={styles.card}>
                <CardHeader
                  title="System Status"
                  subtitle="Current platform availability"
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

            <section style={styles.card}>
              <CardHeader
                title="Processed Traffic Video"
                subtitle="Reference output from the RoadSense pipeline"
              />

              <video
                controls
                preload="metadata"
                style={styles.video}
              >
                <source
                  src="/output_video.mp4"
                  type="video/mp4"
                />

                Your browser does not support video playback.
              </video>
            </section>

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
                getViolationType={getViolationType}
                getTimestamp={getTimestamp}
                getVehicle={getVehicle}
                getSnapshot={getSnapshot}
                onEvidence={setSelectedEvidence}
              />
            </section>
          </>
        )}

        {/* VIOLATIONS */}
        {page === "violations" && (
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
              getViolationType={getViolationType}
              getTimestamp={getTimestamp}
              getVehicle={getVehicle}
              getSnapshot={getSnapshot}
              onEvidence={setSelectedEvidence}
            />
          </section>
        )}

        {/* ANALYTICS */}
        {page === "analytics" && (
          <>
            <section style={styles.kpiGrid}>
              <KPI
                label="Total Events"
                value={counts.total}
                description="All recorded events"
              />

              <KPI
                label="Helmet"
                value={counts.helmet}
                description="Helmet-related events"
              />

              <KPI
                label="Mobile"
                value={counts.phone}
                description="Mobile-use events"
              />

              <KPI
                label="Wrong Way"
                value={counts.wrongWay}
                description="Direction-related events"
              />
            </section>

            <section style={styles.card}>
              <CardHeader
                title="Event Distribution"
                subtitle="Current recorded traffic events"
              />

              <div style={styles.chartAreaLarge}>
                <Bar
                  label="Helmet Violations"
                  value={counts.helmet}
                  total={counts.total}
                />

                <Bar
                  label="Mobile Phone Usage"
                  value={counts.phone}
                  total={counts.total}
                />

                <Bar
                  label="Excess Rider Count"
                  value={counts.triple}
                  total={counts.total}
                />

                <Bar
                  label="Wrong-Way Movement"
                  value={counts.wrongWay}
                  total={counts.total}
                />
              </div>
            </section>
          </>
        )}

        {/* PARKING */}
        {page === "parking" && (
          <section style={styles.card}>
            <CardHeader
              title="Smart Parking"
              subtitle="Parking monitoring interface"
            />

            <div style={styles.parkingHeader}>
              <div>
                <div style={styles.parkingNumber}>12</div>
                <div style={styles.smallText}>
                  Monitored parking slots
                </div>
              </div>

              <div style={styles.parkingStatus}>
                Parking detection module
                <strong>Operational</strong>
              </div>
            </div>

            <div style={styles.parkingGrid}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} style={styles.parkingSlot}>
                  <span>Slot {index + 1}</span>
                  <strong>Monitoring</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ANPR */}
        {page === "anpr" && (
          <section style={styles.card}>
            <CardHeader
              title="Automatic Number Plate Recognition"
              subtitle="Vehicle identification module"
            />

            <div style={styles.anprContent}>
              <div style={styles.anprIcon}>ANPR</div>

              <h2 style={styles.anprTitle}>
                Number plate recognition
              </h2>

              <p style={styles.anprText}>
                RoadSense uses vehicle and number-plate detection
                to associate recognised vehicles with traffic events.
              </p>

              <div style={styles.anprStatus}>
                Module available in the RoadSense architecture
              </div>
            </div>
          </section>
        )}

        <footer style={styles.footer}>
          <span>RoadSense AI</span>
          <span>Edge-AI Based Mobility Intelligence Platform</span>
        </footer>
      </main>

      {/* EVIDENCE MODAL */}
      {selectedEvidence && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalEyebrow}>
                  EVIDENCE
                </div>

                <h2 style={styles.modalTitle}>
                  {getViolationType(selectedEvidence)}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedEvidence(null)}
              >
                ×
              </button>
            </div>

            {getSnapshot(selectedEvidence) ? (
              <img
                src={getSnapshot(selectedEvidence)}
                alt="Traffic event evidence"
                style={styles.evidenceImage}
              />
            ) : (
              <div style={styles.noEvidence}>
                No evidence image available.
              </div>
            )}

            <div style={styles.evidenceInfo}>
              <div>
                <span>Vehicle</span>
                <strong>{getVehicle(selectedEvidence)}</strong>
              </div>

              <div>
                <span>Timestamp</span>
                <strong>{getTimestamp(selectedEvidence)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function KPI({ label, value, description }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiLabel}>{label}</div>

      <div style={styles.kpiValue}>{value}</div>

      <div style={styles.kpiDescription}>{description}</div>
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div style={styles.cardHeader}>
      <div>
        <h2 style={styles.cardTitle}>{title}</h2>
        <p style={styles.cardSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

function StatusRow({ name, status }) {
  return (
    <div style={styles.statusRow}>
      <div style={styles.statusIndicator} />

      <div style={styles.statusName}>{name}</div>

      <div style={styles.statusValue}>{status}</div>
    </div>
  );
}

function Bar({ label, value, total }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div style={styles.barRow}>
      <div style={styles.barLabel}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div style={styles.barTrack}>
        <div
          style={{
            ...styles.barFill,
            width: `${Math.max(percentage, value > 0 ? 4 : 0)}%`,
          }}
        />
      </div>
    </div>
  );
}

function Toolbar({ search, setSearch, exportCSV }) {
  return (
    <div style={styles.toolbar}>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search events..."
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

function ViolationTable({
  violations,
  loading,
  getViolationType,
  getTimestamp,
  getVehicle,
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
            <th style={styles.th}>EVENT</th>
            <th style={styles.th}>VEHICLE</th>
            <th style={styles.th}>TIMESTAMP</th>
            <th style={styles.th}>EVIDENCE</th>
          </tr>
        </thead>

        <tbody>
          {violations.slice(0, 50).map((row, index) => {
            const snapshot = getSnapshot(row);

            return (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.eventCell}>
                    <span style={styles.eventDot} />
                    {getViolationType(row)}
                  </div>
                </td>

                <td style={styles.td}>
                  {getVehicle(row)}
                </td>

                <td style={styles.td}>
                  {getTimestamp(row)}
                </td>

                <td style={styles.td}>
                  {snapshot ? (
                    <button
                      style={styles.viewButton}
                      onClick={() => onEvidence(row)}
                    >
                      View Evidence
                    </button>
                  ) : (
                    <span style={styles.noEvidenceText}>
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

/* ---------- PROFESSIONAL LIGHT THEME ---------- */

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F6F8FB",
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
    borderRight: "1px solid #E6EAF0",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 10px 34px",
  },

  brandMark: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#1F5F8B",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
  },

  brandName: {
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },

  brandSubtitle: {
    fontSize: "10px",
    color: "#8791A1",
    marginTop: "2px",
    letterSpacing: "0.3px",
  },

  sidebarSection: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#9AA3B2",
    letterSpacing: "1.2px",
    padding: "0 12px 10px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#687386",
    padding: "12px 12px",
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
    background: "#EDF3F8",
    color: "#1F5F8B",
    fontWeight: 600,
  },

  navIndicator: {
    width: "3px",
    height: "16px",
    borderRadius: "3px",
    background: "transparent",
  },

  navIndicatorActive: {
    background: "#1F5F8B",
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
    border: "1px solid #E8ECF1",
    borderRadius: "8px",
  },

  systemDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3C8B68",
  },

  systemTitle: {
    fontSize: "12px",
    fontWeight: 600,
  },

  systemText: {
    fontSize: "10px",
    color: "#8A94A4",
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
    padding: "34px 42px 28px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "30px",
  },

  breadcrumb: {
    color: "#8D96A5",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
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
    color: "#758094",
    fontSize: "13px",
  },

  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#FFFFFF",
    border: "1px solid #E4E8EE",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "11px",
    color: "#566174",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    background: "#3C8B68",
    borderRadius: "50%",
  },

  hero: {
    background: "#FFFFFF",
    border: "1px solid #E4E8EE",
    borderRadius: "10px",
    padding: "28px 30px",
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    marginBottom: "18px",
    boxShadow: "0 3px 12px rgba(24, 39, 58, 0.035)",
  },

  heroLabel: {
    color: "#1F5F8B",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.1px",
    marginBottom: "10px",
  },

  heroTitle: {
    fontSize: "24px",
    lineHeight: 1.3,
    margin: 0,
    color: "#182236",
    letterSpacing: "-0.5px",
  },

  heroText: {
    maxWidth: "650px",
    color: "#758094",
    fontSize: "13px",
    lineHeight: 1.7,
    margin: "13px 0 0",
  },

  heroMetric: {
    minWidth: "180px",
    borderLeft: "1px solid #E6EAF0",
    paddingLeft: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroMetricLabel: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#8B95A5",
    letterSpacing: "1px",
  },

  heroMetricValue: {
    fontSize: "34px",
    fontWeight: 700,
    color: "#1F5F8B",
    marginTop: "5px",
  },

  heroMetricSub: {
    fontSize: "10px",
    color: "#8A94A4",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  kpi: {
    background: "#FFFFFF",
    border: "1px solid #E4E8EE",
    borderRadius: "9px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(24, 39, 58, 0.025)",
  },

  kpiLabel: {
    fontSize: "11px",
    color: "#788396",
    fontWeight: 600,
  },

  kpiValue: {
    fontSize: "27px",
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
    gridTemplateColumns: "1.4fr 1fr",
    gap: "18px",
    marginBottom: "18px",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E4E8EE",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 3px 12px rgba(24, 39, 58, 0.03)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
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

  chartArea: {
    paddingTop: "4px",
  },

  chartAreaLarge: {
    maxWidth: "850px",
  },

  barRow: {
    marginBottom: "18px",
  },

  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#687386",
    marginBottom: "7px",
  },

  barTrack: {
    height: "7px",
    background: "#EEF1F5",
    borderRadius: "5px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#4B7FA5",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },

  statusList: {
    borderTop: "1px solid #EDF0F4",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 0",
    borderBottom: "1px solid #EDF0F4",
  },

  statusIndicator: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3C8B68",
  },

  statusName: {
    flex: 1,
    fontSize: "12px",
    color: "#566174",
  },

  statusValue: {
    fontSize: "10px",
    color: "#3C8B68",
    fontWeight: 600,
  },

  video: {
    width: "100%",
    maxHeight: "520px",
    background: "#111827",
    borderRadius: "7px",
    display: "block",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
  },

  searchInput: {
    flex: 1,
    maxWidth: "420px",
    border: "1px solid #DDE2E9",
    borderRadius: "6px",
    padding: "10px 12px",
    outline: "none",
    fontSize: "12px",
    color: "#263246",
    background: "#FBFCFD",
    boxSizing: "border-box",
  },

  exportButton: {
    border: "1px solid #D6DEE7",
    background: "#FFFFFF",
    color: "#385A75",
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
    minWidth: "700px",
  },

  th: {
    textAlign: "left",
    fontSize: "9px",
    color: "#9099A7",
    letterSpacing: "0.8px",
    fontWeight: 700,
    padding: "11px 10px",
    borderBottom: "1px solid #E6EAF0",
  },

  tr: {
    borderBottom: "1px solid #EEF1F4",
  },

  td: {
    padding: "14px 10px",
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
    background: "#4B7FA5",
    borderRadius: "50%",
  },

  viewButton: {
    border: "none",
    background: "#EDF3F8",
    color: "#2E6389",
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

  parkingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 0 28px",
  },

  parkingNumber: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#1F5F8B",
  },

  smallText: {
    fontSize: "11px",
    color: "#8993A2",
  },

  parkingStatus: {
    color: "#788396",
    fontSize: "11px",
    textAlign: "right",
  },

  parkingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },

  parkingSlot: {
    border: "1px solid #E4E8EE",
    borderRadius: "7px",
    padding: "18px",
    background: "#FAFBFC",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  anprContent: {
    textAlign: "center",
    padding: "55px 20px",
  },

  anprIcon: {
    width: "70px",
    height: "42px",
    border: "2px solid #4B7FA5",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    color: "#315D7C",
    fontWeight: 700,
    fontSize: "12px",
  },

  anprTitle: {
    fontSize: "20px",
    margin: 0,
    color: "#1B2638",
  },

  anprText: {
    maxWidth: "520px",
    margin: "10px auto",
    color: "#7A8595",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  anprStatus: {
    display: "inline-block",
    marginTop: "12px",
    padding: "8px 12px",
    borderRadius: "5px",
    background: "#F0F4F7",
    color: "#55718A",
    fontSize: "10px",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    color: "#9AA3B1",
    fontSize: "10px",
    padding: "8px 2px 0",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(18, 27, 40, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 100,
  },

  modal: {
    width: "min(760px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: "10px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  modalEyebrow: {
    color: "#8A94A4",
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
    background: "#F2F4F7",
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
    background: "#F4F6F8",
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
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid #E7EBEF",
  },
};

export default Dashboard;
