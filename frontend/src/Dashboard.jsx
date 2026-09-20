import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE =
  "https://spatio-temporal-traffic-violation.onrender.com";

const VIDEO_URL = "/output_video.mp4";

function Dashboard({ page = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Violations",
      path: "/violations",
      icon: "⚠",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: "◫",
    },
    {
      label: "Smart Parking",
      path: "/parking",
      icon: "P",
    },
    {
      label: "ANPR",
      path: "/anpr",
      icon: "▣",
    },
  ];

  const getViolationType = (row) => {
    const value =
      row.violation ||
      row.violation_type ||
      row.type ||
      row.event ||
      row.label ||
      row.class ||
      "Traffic Event";

    return String(value);
  };

  const getTimestamp = (row) => {
    return (
      row.timestamp ||
      row.time ||
      row.datetime ||
      row.date ||
      "-"
    );
  };

  const getVehicle = (row) => {
    return (
      row.vehicle_number ||
      row.plate_number ||
      row.license_plate ||
      row.vehicle ||
      "Unknown"
    );
  };

  const getSnapshot = (row) => {
    return (
      row._snapshot ||
      row.snapshot ||
      row.image ||
      row.evidence ||
      ""
    );
  };

  const counts = useMemo(() => {
    let helmetless = 0;
    let triple = 0;
    let mobile = 0;
    let wrongWay = 0;

    violations.forEach((row) => {
      const type = getViolationType(row).toLowerCase();

      if (
        type.includes("helmet") ||
        type.includes("no helmet") ||
        type.includes("helmetless")
      ) {
        helmetless++;
      }

      if (
        type.includes("triple") ||
        type.includes("rider") ||
        type.includes("excessive")
      ) {
        triple++;
      }

      if (
        type.includes("mobile") ||
        type.includes("phone")
      ) {
        mobile++;
      }

      if (
        type.includes("wrong") ||
        type.includes("wrong-way") ||
        type.includes("wrong way")
      ) {
        wrongWay++;
      }
    });

    return {
      helmetless,
      triple,
      mobile,
      wrongWay,
      total: violations.length,
    };
  }, [violations]);

  const filteredViolations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return violations;
    }

    return violations.filter((row) => {
      return JSON.stringify(row).toLowerCase().includes(query);
    });
  }, [violations, search]);

  const navigateTo = (path) => {
    navigate(path);
  };

  const downloadCSV = () => {
    window.open(`${API_BASE}/download/csv`, "_blank");
  };

  const evidenceURL = (row) => {
    const snapshot = getSnapshot(row);

    if (!snapshot) {
      return "";
    }

    const filename = String(snapshot)
      .replaceAll("\\", "/")
      .split("/")
      .pop();

    return `${API_BASE}/snapshots/${encodeURIComponent(filename)}`;
  };

  const renderPageTitle = () => {
    switch (page) {
      case "violations":
        return {
          title: "Traffic Violations",
          subtitle:
            "Edge-AI detected mobility events and enforcement evidence",
        };

      case "analytics":
        return {
          title: "Mobility Analytics",
          subtitle:
            "Traffic-event distribution and Edge-AI detection intelligence",
        };

      case "parking":
        return {
          title: "Smart Parking",
          subtitle:
            "Camera-based parking occupancy and availability monitoring",
        };

      case "anpr":
        return {
          title: "Automatic Number Plate Recognition",
          subtitle:
            "Vehicle identification and plate recognition intelligence",
        };

      default:
        return {
          title: "Mobility Intelligence Dashboard",
          subtitle:
            "Edge-AI powered CCTV-based vehicle and road-state analysis",
        };
    }
  };

  const pageInfo = renderPageTitle();

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.brandMark}>RS</div>

            <div>
              <div style={styles.brandName}>RoadSense AI</div>

              <div style={styles.brandStatus}>
                <span style={styles.aiDot}></span>
                EDGE AI ONLINE
              </div>
            </div>
          </div>

          <div style={styles.navLabel}>MONITORING</div>

          <nav style={styles.nav}>
            {navigationItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.navIcon,
                      ...(active ? styles.navIconActive : {}),
                    }}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.edgeBox}>
            <div style={styles.edgeTitle}>
              Edge Processing
            </div>

            <div style={styles.edgeRow}>
              <span>System</span>
              <span style={styles.online}>ONLINE</span>
            </div>

            <div style={styles.edgeRow}>
              <span>Camera Feed</span>
              <span style={styles.online}>ACTIVE</span>
            </div>

            <div style={styles.edgeRow}>
              <span>AI Engine</span>
              <span style={styles.online}>READY</span>
            </div>
          </div>

          <div style={styles.version}>
            RoadSense AI v1.0
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              ROADSENSE / {page.toUpperCase()}
            </div>

            <h1 style={styles.pageTitle}>
              {pageInfo.title}
            </h1>

            <p style={styles.pageSubtitle}>
              {pageInfo.subtitle}
            </p>
          </div>

          <div style={styles.headerStatus}>
            <span style={styles.aiDot}></span>
            SYSTEM OPERATIONAL
          </div>
        </header>

        {/* AI ENGINE BAR */}
        <section style={styles.aiEngineBar}>
          <div>
            <div style={styles.aiEngineTitle}>
              RoadSense Edge Intelligence
            </div>

            <div style={styles.aiEngineText}>
              Object detection • Multi-object tracking •
              Spatial association • Temporal validation
            </div>
          </div>

          <div style={styles.aiEngineStatus}>
            <span style={styles.aiDot}></span>
            PROCESSING READY
          </div>
        </section>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            {/* KPI */}
            <section style={styles.kpiGrid}>
              <KPI
                title="Total Events"
                value={counts.total}
                subtitle="Detected events"
              />

              <KPI
                title="Helmetless"
                value={counts.helmetless}
                subtitle="Safety violations"
              />

              <KPI
                title="Excessive Riders"
                value={counts.triple}
                subtitle="Rider-count events"
              />

              <KPI
                title="Mobile Usage"
                value={counts.mobile}
                subtitle="Phone-use events"
              />
            </section>

            {/* VIDEO */}
            <VideoCard />

            {/* OVERVIEW */}
            <section style={styles.twoColumn}>
              <EventDistribution
                counts={counts}
              />

              <SystemStatus />
            </section>

            {/* EVENTS */}
            <EventsTable
              rows={filteredViolations.slice(0, 8)}
              loading={loading}
              search={search}
              setSearch={setSearch}
              onEvidence={setSelectedEvidence}
              onExport={downloadCSV}
            />
          </>
        )}

        {/* VIOLATIONS */}
        {page === "violations" && (
          <>
            <section style={styles.kpiGrid}>
              <KPI
                title="Total Violations"
                value={counts.total}
                subtitle="Recorded events"
              />

              <KPI
                title="Helmetless"
                value={counts.helmetless}
                subtitle="Helmet violations"
              />

              <KPI
                title="Excessive Riders"
                value={counts.triple}
                subtitle="Triple-riding events"
              />

              <KPI
                title="Wrong-Way"
                value={counts.wrongWay}
                subtitle="Direction violations"
              />
            </section>

            <EventsTable
              rows={filteredViolations}
              loading={loading}
              search={search}
              setSearch={setSearch}
              onEvidence={setSelectedEvidence}
              onExport={downloadCSV}
            />
          </>
        )}

        {/* ANALYTICS */}
        {page === "analytics" && (
          <>
            <section style={styles.kpiGrid}>
              <KPI
                title="Detected Events"
                value={counts.total}
                subtitle="All recorded events"
              />

              <KPI
                title="Helmetless"
                value={counts.helmetless}
                subtitle="Detected"
              />

              <KPI
                title="Mobile Usage"
                value={counts.mobile}
                subtitle="Detected"
              />

              <KPI
                title="Wrong-Way"
                value={counts.wrongWay}
                subtitle="Detected"
              />
            </section>

            <section style={styles.analyticsGrid}>
              <EventDistribution counts={counts} />

              <div style={styles.panel}>
                <div style={styles.sectionTitle}>
                  Detection Pipeline
                </div>

                <div style={styles.sectionSubtitle}>
                  RoadSense Edge-AI processing stages
                </div>

                <PipelineItem
                  number="01"
                  title="Object Detection"
                  text="Vehicle and associated-object detection"
                />

                <PipelineItem
                  number="02"
                  title="Tracking"
                  text="Persistent vehicle identity across frames"
                />

                <PipelineItem
                  number="03"
                  title="Spatial Association"
                  text="Relationship between vehicles and objects"
                />

                <PipelineItem
                  number="04"
                  title="Temporal Validation"
                  text="Multi-frame event confirmation"
                />

                <PipelineItem
                  number="05"
                  title="Evidence Generation"
                  text="Validated event and supporting evidence"
                />
              </div>
            </section>
          </>
        )}

        {/* PARKING */}
        {page === "parking" && (
          <>
            <section style={styles.kpiGrid}>
              <KPI
                title="Parking Module"
                value="ACTIVE"
                subtitle="Camera-based monitoring"
              />

              <KPI
                title="Detection"
                value="AI"
                subtitle="Vision-based occupancy"
              />

              <KPI
                title="Processing"
                value="EDGE"
                subtitle="Local inference"
              />

              <KPI
                title="Status"
                value="READY"
                subtitle="Monitoring available"
              />
            </section>

            <section style={styles.twoColumn}>
              <div style={styles.panel}>
                <div style={styles.sectionTitle}>
                  Smart Parking Intelligence
                </div>

                <div style={styles.sectionSubtitle}>
                  Parking occupancy detection using predefined parking
                  regions and temporal validation.
                </div>

                <div style={styles.featureList}>
                  <Feature
                    title="Parking-slot detection"
                    text="Identifies vehicle occupancy within configured parking regions."
                  />

                  <Feature
                    title="Occupancy validation"
                    text="Uses repeated observations to reduce false occupancy states."
                  />

                  <Feature
                    title="Dashboard monitoring"
                    text="Displays parking availability and utilization information."
                  />
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.sectionTitle}>
                  Parking Status
                </div>

                <div style={styles.parkingGrid}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.parkingSlot,
                        ...(index % 3 === 0
                          ? styles.parkingOccupied
                          : {}),
                      }}
                    >
                      P{index + 1}
                    </div>
                  ))}
                </div>

                <div style={styles.parkingLegend}>
                  <span>
                    <span style={styles.legendDot}></span>
                    Available
                  </span>

                  <span>
                    <span
                      style={{
                        ...styles.legendDot,
                        background: "#f59e0b",
                      }}
                    ></span>
                    Occupied
                  </span>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ANPR */}
        {page === "anpr" && (
          <>
            <section style={styles.kpiGrid}>
              <KPI
                title="ANPR Module"
                value="ACTIVE"
                subtitle="Number plate recognition"
              />

              <KPI
                title="OCR Engine"
                value="READY"
                subtitle="Plate text extraction"
              />

              <KPI
                title="Tracking"
                value="ACTIVE"
                subtitle="Vehicle association"
              />

              <KPI
                title="Evidence"
                value="READY"
                subtitle="Event-linked records"
              />
            </section>

            <div style={styles.panel}>
              <div style={styles.sectionTitle}>
                Automatic Number Plate Recognition
              </div>

              <div style={styles.sectionSubtitle}>
                Vehicle plate detection and OCR integrated into the
                RoadSense perception layer.
              </div>

              <div style={styles.featureList}>
                <Feature
                  title="Plate Detection"
                  text="Detects number-plate regions from the video stream."
                />

                <Feature
                  title="OCR Processing"
                  text="Extracts readable registration information from detected plates."
                />

                <Feature
                  title="Vehicle Association"
                  text="Associates recognized plates with tracked vehicles and events."
                />

                <Feature
                  title="Evidence Linking"
                  text="Recognition results can be associated with event evidence."
                />
              </div>
            </div>
          </>
        )}

        <footer style={styles.footer}>
          RoadSense AI • Edge-AI Based Mobility Intelligence Platform
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
                <div style={styles.sectionTitle}>
                  Event Evidence
                </div>

                <div style={styles.sectionSubtitle}>
                  {getViolationType(selectedEvidence)}
                </div>
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            {evidenceURL(selectedEvidence) ? (
              <img
                src={evidenceURL(selectedEvidence)}
                alt="Traffic event evidence"
                style={styles.evidenceImage}
              />
            ) : (
              <div style={styles.noEvidence}>
                No evidence image available for this event.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KPI({ title, value, subtitle }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <span style={styles.kpiIndicator}></span>
        <span style={styles.kpiLabel}>{title}</span>
      </div>

      <div style={styles.kpiValue}>{value}</div>

      <div style={styles.kpiSubtitle}>{subtitle}</div>
    </div>
  );
}

function VideoCard() {
  return (
    <section style={styles.videoCard}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>
            Processed Traffic Video
          </div>

          <div style={styles.sectionSubtitle}>
            Edge-AI analyzed demonstration footage
          </div>
        </div>

        <div style={styles.aiBadge}>
          <span style={styles.aiDot}></span>
          AI ANALYZED
        </div>
      </div>

      <video
        controls
        muted
        loop
        playsInline
        preload="metadata"
        style={styles.video}
      >
        <source src="/output_video.mp4" type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </section>
  );
}

function EventDistribution({ counts }) {
  const items = [
    ["Helmetless", counts.helmetless],
    ["Excessive Riders", counts.triple],
    ["Mobile Usage", counts.mobile],
    ["Wrong-Way", counts.wrongWay],
  ];

  const max = Math.max(...items.map((item) => item[1]), 1);

  return (
    <div style={styles.panel}>
      <div style={styles.sectionTitle}>
        Violation Intelligence
      </div>

      <div style={styles.sectionSubtitle}>
        Distribution of detected mobility events
      </div>

      <div style={styles.chart}>
        {items.map(([label, value]) => (
          <div key={label} style={styles.chartRow}>
            <div style={styles.chartLabel}>{label}</div>

            <div style={styles.chartTrack}>
              <div
                style={{
                  ...styles.chartBar,
                  width: `${Math.max((value / max) * 100, value ? 8 : 0)}%`,
                }}
              ></div>
            </div>

            <div style={styles.chartValue}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div style={styles.panel}>
      <div style={styles.sectionTitle}>
        Edge System Status
      </div>

      <div style={styles.sectionSubtitle}>
        Current RoadSense processing state
      </div>

      <StatusRow label="Video Input" value="ACTIVE" />
      <StatusRow label="Object Detection" value="READY" />
      <StatusRow label="Vehicle Tracking" value="ACTIVE" />
      <StatusRow label="Temporal Validation" value="READY" />
      <StatusRow label="Evidence Manager" value="READY" />
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <div style={styles.statusRow}>
      <span>{label}</span>

      <span style={styles.statusValue}>
        <span style={styles.aiDot}></span>
        {value}
      </span>
    </div>
  );
}

function PipelineItem({ number, title, text }) {
  return (
    <div style={styles.pipelineItem}>
      <div style={styles.pipelineNumber}>{number}</div>

      <div>
        <div style={styles.pipelineTitle}>{title}</div>
        <div style={styles.pipelineText}>{text}</div>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.feature}>
      <span style={styles.featureDot}></span>

      <div>
        <div style={styles.featureTitle}>{title}</div>
        <div style={styles.featureText}>{text}</div>
      </div>
    </div>
  );
}

function EventsTable({
  rows,
  loading,
  search,
  setSearch,
  onEvidence,
  onExport,
}) {
  return (
    <section style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>
            Recent Traffic Events
          </div>

          <div style={styles.sectionSubtitle}>
            Validated events received from the RoadSense backend
          </div>
        </div>

        <button
          onClick={onExport}
          style={styles.exportButton}
        >
          Export CSV
        </button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search events..."
        style={styles.searchInput}
      />

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Event</th>
              <th style={styles.th}>Vehicle</th>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Evidence</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={styles.emptyCell}
                >
                  Loading events...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={styles.emptyCell}
                >
                  No traffic events found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const type =
                  row.violation ||
                  row.violation_type ||
                  row.type ||
                  row.event ||
                  row.label ||
                  row.class ||
                  "Traffic Event";

                const vehicle =
                  row.vehicle_number ||
                  row.plate_number ||
                  row.license_plate ||
                  row.vehicle ||
                  "Unknown";

                const timestamp =
                  row.timestamp ||
                  row.time ||
                  row.datetime ||
                  row.date ||
                  "-";

                return (
                  <tr key={index}>
                    <td style={styles.td}>
                      <span style={styles.eventBadge}>
                        {String(type)}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {String(vehicle)}
                    </td>

                    <td style={styles.td}>
                      {String(timestamp)}
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => onEvidence(row)}
                        style={styles.evidenceButton}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  app: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#eef2f7",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    display: "flex",
  },

  sidebar: {
    width: "245px",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    padding: "24px 16px",
    background: "#0b0f17",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "36px",
  },

  brandMark: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#151c28",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: 800,
  },

  brandStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "5px",
    fontSize: "9px",
    color: "#35d07f",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  aiDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#35d07f",
    display: "inline-block",
    boxShadow: "0 0 8px rgba(53,208,127,0.5)",
  },

  navLabel: {
    fontSize: "9px",
    color: "#667085",
    fontWeight: 800,
    letterSpacing: "0.12em",
    margin: "0 10px 10px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navItem: {
    width: "100%",
    border: "1px solid transparent",
    background: "transparent",
    color: "#8e99aa",
    padding: "11px 12px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: 600,
  },

  navItemActive: {
    background: "#141b27",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
  },

  navIcon: {
    width: "23px",
    textAlign: "center",
    fontSize: "14px",
    color: "#667085",
  },

  navIconActive: {
    color: "#dce5f1",
  },

  sidebarBottom: {
    marginTop: "30px",
  },

  edgeBox: {
    padding: "14px",
    borderRadius: "12px",
    background: "#0f141e",
    border: "1px solid rgba(255,255,255,0.07)",
  },

  edgeTitle: {
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "12px",
  },

  edgeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "9px",
    fontSize: "10px",
    color: "#7f8a9b",
  },

  online: {
    color: "#35d07f",
    fontWeight: 700,
  },

  version: {
    textAlign: "center",
    marginTop: "14px",
    fontSize: "9px",
    color: "#4f5969",
  },

  main: {
    marginLeft: "245px",
    width: "calc(100% - 245px)",
    minHeight: "100vh",
    padding: "30px 34px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "22px",
  },

  breadcrumb: {
    fontSize: "9px",
    color: "#687385",
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: "9px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  pageSubtitle: {
    margin: "8px 0 0",
    color: "#7f8999",
    fontSize: "12px",
  },

  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "9px",
    color: "#35d07f",
    fontWeight: 800,
    letterSpacing: "0.08em",
    paddingTop: "8px",
    whiteSpace: "nowrap",
  },

  aiEngineBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "15px 18px",
    marginBottom: "20px",
    borderRadius: "13px",
    background: "#0d131d",
    border: "1px solid rgba(255,255,255,0.07)",
  },

  aiEngineTitle: {
    fontSize: "13px",
    fontWeight: 800,
  },

  aiEngineText: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#727e90",
  },

  aiEngineStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "9px",
    color: "#35d07f",
    fontWeight: 800,
    letterSpacing: "0.07em",
    whiteSpace: "nowrap",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  kpiCard: {
    padding: "17px",
    background: "#0d131d",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "13px",
  },

  kpiTop: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  kpiIndicator: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#6f7d91",
  },

  kpiLabel: {
    color: "#788496",
    fontSize: "10px",
    fontWeight: 700,
  },

  kpiValue: {
    marginTop: "13px",
    fontSize: "25px",
    fontWeight: 800,
  },

  kpiSubtitle: {
    marginTop: "5px",
    fontSize: "9px",
    color: "#586476",
  },

  videoCard: {
    padding: "18px",
    background: "#0d131d",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "13px",
    marginBottom: "18px",
  },

  video: {
    width: "100%",
    maxHeight: "520px",
    display: "block",
    borderRadius: "10px",
    background: "#05070b",
    marginTop: "15px",
  },

  aiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "7px",
    background: "rgba(53,208,127,0.07)",
    color: "#35d07f",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.25fr) minmax(0, 1fr)",
    gap: "18px",
    marginBottom: "18px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "18px",
  },

  panel: {
    background: "#0d131d",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "13px",
    padding: "18px",
    marginBottom: "18px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  sectionTitle: {
    fontSize: "13px",
    fontWeight: 800,
  },

  sectionSubtitle: {
    marginTop: "5px",
    color: "#687486",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  chart: {
    marginTop: "22px",
  },

  chartRow: {
    display: "grid",
    gridTemplateColumns: "105px 1fr 30px",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },

  chartLabel: {
    fontSize: "10px",
    color: "#8791a1",
  },

  chartTrack: {
    height: "7px",
    borderRadius: "10px",
    background: "#171e29",
    overflow: "hidden",
  },

  chartBar: {
    height: "100%",
    borderRadius: "10px",
    background: "#8b98aa",
  },

  chartValue: {
    textAlign: "right",
    fontSize: "10px",
    fontWeight: 700,
  },

  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "10px",
    color: "#858f9f",
  },

  statusValue: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#35d07f",
    fontWeight: 700,
    fontSize: "9px",
  },

  pipelineItem: {
    display: "flex",
    gap: "12px",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  pipelineNumber: {
    width: "27px",
    height: "27px",
    borderRadius: "7px",
    background: "#161e2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 800,
    color: "#8995a7",
    flexShrink: 0,
  },

  pipelineTitle: {
    fontSize: "11px",
    fontWeight: 700,
  },

  pipelineText: {
    marginTop: "3px",
    fontSize: "9px",
    color: "#667285",
  },

  featureList: {
    marginTop: "20px",
  },

  feature: {
    display: "flex",
    gap: "11px",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7d899a",
    marginTop: "4px",
    flexShrink: 0,
  },

  featureTitle: {
    fontSize: "11px",
    fontWeight: 700,
  },

  featureText: {
    marginTop: "4px",
    fontSize: "9px",
    color: "#697588",
    lineHeight: 1.5,
  },

  parkingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "20px",
  },

  parkingSlot: {
    padding: "18px 5px",
    textAlign: "center",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "#111824",
    color: "#8995a7",
    fontSize: "10px",
    fontWeight: 700,
  },

  parkingOccupied: {
    background: "#181a18",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.2)",
  },

  parkingLegend: {
    display: "flex",
    gap: "18px",
    marginTop: "18px",
    fontSize: "9px",
    color: "#737e8f",
  },

  legendDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7d899a",
    marginRight: "5px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "16px",
    marginBottom: "15px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "#090e16",
    color: "#e8edf4",
    outline: "none",
    fontSize: "10px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },

  th: {
    padding: "10px",
    textAlign: "left",
    fontSize: "9px",
    color: "#5f6a7b",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom:
      "1px solid rgba(255,255,255,0.07)",
  },

  td: {
    padding: "12px 10px",
    fontSize: "10px",
    color: "#9aa4b3",
    borderBottom:
      "1px solid rgba(255,255,255,0.045)",
  },

  eventBadge: {
    display: "inline-block",
    padding: "5px 7px",
    borderRadius: "5px",
    background: "#151c27",
    color: "#c2cad5",
    fontSize: "9px",
  },

  evidenceButton: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#151c27",
    color: "#c7d0dc",
    padding: "5px 9px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "9px",
  },

  exportButton: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#151c27",
    color: "#d4dae2",
    padding: "7px 10px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: 700,
  },

  emptyCell: {
    textAlign: "center",
    padding: "30px",
    color: "#5e6878",
    fontSize: "10px",
  },

  footer: {
    padding: "25px 0 10px",
    textAlign: "center",
    color: "#414b5b",
    fontSize: "9px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
    zIndex: 1000,
  },

  modal: {
    width: "min(800px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#0d131d",
    border:
      "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "18px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    color: "#9aa4b3",
    fontSize: "25px",
    cursor: "pointer",
  },

  evidenceImage: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    background: "#05070b",
    borderRadius: "9px",
  },

  noEvidence: {
    padding: "50px",
    textAlign: "center",
    color: "#687486",
    fontSize: "11px",
  },
};

export default Dashboard;
