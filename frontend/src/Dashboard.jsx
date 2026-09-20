import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./main.css";

const API_BASE =
  "https://spatio-temporal-traffic-violation.onrender.com";

const VIDEO_URL = "/output_video.mp4";

function Dashboard({ page = "dashboard" }) {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/violations`)
      .then((res) => res.json())
      .then((data) => {
        setViolations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load violations:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    return {
      total: violations.length,
      helmetless: violations.filter(
        (v) => String(v.Violation).toLowerCase() === "helmetless"
      ).length,
      triple: violations.filter(
        (v) => String(v.Violation).toLowerCase() === "triple_riding"
      ).length,
      wrongWay: violations.filter(
        (v) => String(v.Violation).toLowerCase() === "wrong_way"
      ).length,
      mobile: violations.filter(
        (v) => String(v.Violation).toLowerCase().includes("mobile")
      ).length,
    };
  }, [violations]);

  const location =
    violations.length > 0
      ? violations[0].Location || "Saranathan Junction, Trichy"
      : "Saranathan Junction, Trichy";

  const hourlyData = useMemo(() => {
    const hours = {};

    violations.forEach((v) => {
      const time = String(v.Time || "");
      const hour = time.length >= 13 ? time.substring(11, 13) : null;

      if (hour) {
        const label = `${hour}:00`;
        hours[label] = (hours[label] || 0) + 1;
      }
    });

    return Object.entries(hours).sort((a, b) => a[0].localeCompare(b[0]));
  }, [violations]);

  const maxHourCount = Math.max(
    ...hourlyData.map(([, value]) => value),
    1
  );

  const getViolationName = (type) => {
    switch (String(type).toLowerCase()) {
      case "helmetless":
        return "Helmetless Riding";
      case "triple_riding":
        return "Triple Riding";
      case "wrong_way":
        return "Wrong-Way Movement";
      case "mobile_usage":
      case "mobile_use":
        return "Mobile Phone Usage";
      default:
        return type || "Unknown";
    }
  };

  const getEvidenceUrl = (snapshot) => {
    if (!snapshot) return null;

    const filename = String(snapshot)
      .replaceAll("\\", "/")
      .split("/")
      .pop();

    if (!filename) return null;

    return `${API_BASE}/snapshots/${encodeURIComponent(filename)}`;
  };

  const exportCSV = () => {
    window.open(`${API_BASE}/download/csv`, "_blank");
  };

  if (page === "violations") {
    return (
      <div className="rs-app">
        <Sidebar />

        <main className="rs-main">
          <div className="page-top">
            <div>
              <span className="eyebrow">ROADSENSE / VIOLATIONS</span>
              <h1>Traffic Violations</h1>
              <p>Detected events and evidence records</p>
            </div>

            <button className="export-btn" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <div className="table-card">
            <div className="table-head">
              <strong>{violations.length} records</strong>
              <span>RoadSense event database</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading events...</div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Violation</th>
                      <th>Plate</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>

                  <tbody>
                    {violations.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span
                            className={`violation-tag ${String(
                              item.Violation
                            ).toLowerCase()}`}
                          >
                            {getViolationName(item.Violation)}
                          </span>
                        </td>

                        <td>{item.Plate || "UNKNOWN"}</td>
                        <td>{item.Time || "—"}</td>
                        <td>{item.Location || "—"}</td>

                        <td>
                          <button
                            className="evidence-btn"
                            onClick={() =>
                              setSelectedEvidence({
                                ...item,
                                url: getEvidenceUrl(item.Snapshot),
                              })
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <EvidenceModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      </div>
    );
  }

  return (
    <div className="rs-app">
      <Sidebar />

      <main className="rs-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">ROADSENSE / DASHBOARD</span>
            <h1>Mobility Intelligence</h1>
            <p>Vehicle activity, traffic events and system status.</p>
          </div>

          <div className="online-status">
            <span className="status-dot"></span>
            System Online
          </div>
        </header>

        {/* KPI */}
        <section className="stats-grid">
          <StatCard
            label="Total Events"
            value={counts.total}
            detail="Detected events"
          />

          <StatCard
            label="Helmetless Riding"
            value={counts.helmetless}
            detail="Helmet violations"
          />

          <StatCard
            label="Triple Riding"
            value={counts.triple}
            detail="Excess rider events"
          />

          <StatCard
            label="Wrong-Way"
            value={counts.wrongWay}
            detail="Direction violations"
          />
        </section>

        {/* MAIN GRID */}
        <section className="main-grid">
          {/* VIDEO */}
          <div className="panel video-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">PROCESSED VIDEO</span>
                <h2>Traffic Detection Output</h2>
              </div>

              <span className="blue-pill">AI PROCESSED</span>
            </div>

            <div className="video-box">
              <video
                controls
                playsInline
                preload="metadata"
                width="100%"
                height="100%"
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </div>

          {/* VIOLATIONS */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">EVENT ANALYSIS</span>
                <h2>Violation Intelligence</h2>
              </div>
            </div>

            <div className="bars">
              <ProgressBar
                name="Helmetless Riding"
                value={counts.helmetless}
                total={counts.total}
              />

              <ProgressBar
                name="Triple Riding"
                value={counts.triple}
                total={counts.total}
              />

              <ProgressBar
                name="Mobile Phone"
                value={counts.mobile}
                total={counts.total}
              />

              <ProgressBar
                name="Wrong-Way"
                value={counts.wrongWay}
                total={counts.total}
              />
            </div>
          </div>
        </section>

        {/* ANALYTICS + LOCATION */}
        <section className="lower-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">TRAFFIC ACTIVITY</span>
                <h2>Events by Hour</h2>
              </div>
            </div>

            <div className="chart">
              {hourlyData.length === 0 ? (
                <div className="empty-state">No activity data</div>
              ) : (
                hourlyData.map(([hour, value]) => (
                  <div className="chart-column" key={hour}>
                    <span className="chart-value">{value}</span>

                    <div className="chart-track">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${(value / maxHourCount) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="chart-label">{hour}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel location-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">MONITORING ZONE</span>
                <h2>Location</h2>
              </div>
            </div>

            <div className="map-box">
              <div className="map-grid"></div>
              <div className="map-road road-one"></div>
              <div className="map-road road-two"></div>

              <div className="map-marker">
                <span></span>
              </div>
            </div>

            <div className="location-name">
              <strong>{location}</strong>
              <span>Active monitoring location</span>
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="panel system-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">SYSTEM HEALTH</span>
              <h2>RoadSense Services</h2>
            </div>
          </div>

          <div className="health-grid">
            <HealthItem label="Edge AI Processing" />
            <HealthItem label="Traffic Detection" />
            <HealthItem label="Evidence Service" />
            <HealthItem label="Backend API" />
          </div>
        </section>

        {/* RECENT EVENTS */}
        <section className="panel recent-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">LIVE DATA</span>
              <h2>Recent Traffic Events</h2>
            </div>

            <button className="export-btn" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Violation</th>
                  <th>Plate</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Evidence</th>
                </tr>
              </thead>

              <tbody>
                {violations.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span
                        className={`violation-tag ${String(
                          item.Violation
                        ).toLowerCase()}`}
                      >
                        {getViolationName(item.Violation)}
                      </span>
                    </td>

                    <td>{item.Plate || "UNKNOWN"}</td>
                    <td>{item.Time || "—"}</td>
                    <td>{item.Location || "—"}</td>

                    <td>
                      <button
                        className="evidence-btn"
                        onClick={() =>
                          setSelectedEvidence({
                            ...item,
                            url: getEvidenceUrl(item.Snapshot),
                          })
                        }
                      >
                        View Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          RoadSense AI <span>•</span> Edge-AI Based Mobility Intelligence
          Platform
        </footer>
      </main>

      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>

        <div>
          <strong>RoadSense</strong>
          <span>Mobility Intelligence</span>
        </div>
      </div>

      <div className="nav-title">MAIN</div>

      <nav>
        <Link to="/dashboard" className="nav-link">
          <span>▦</span>
          Dashboard
        </Link>

        <Link to="/violations" className="nav-link">
          <span>◉</span>
          Violations
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <div className="edge-card">
          <span className="status-dot"></span>
          <div>
            <strong>System Online</strong>
            <small>Edge services operational</small>
          </div>
        </div>

        <div className="version">RoadSense AI • v1.0</div>
      </div>
    </aside>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function ProgressBar({ name, value, total }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="progress-item">
      <div className="progress-top">
        <span>{name}</span>
        <strong>{value}</strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function HealthItem({ label }) {
  return (
    <div className="health-item">
      <span className="health-check">✓</span>

      <div>
        <strong>{label}</strong>
        <small>Operational</small>
      </div>
    </div>
  );
}

function EvidenceModal({ evidence, onClose }) {
  if (!evidence) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="evidence-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="panel-label">EVENT EVIDENCE</span>
            <h2>{evidence.Violation || "Traffic Event"}</h2>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {evidence.url ? (
          <img
            src={evidence.url}
            alt="Traffic evidence"
            className="evidence-image"
          />
        ) : (
          <div className="empty-state">Evidence unavailable</div>
        )}

        <div className="evidence-info">
          <div>
            <span>Time</span>
            <strong>{evidence.Time || "—"}</strong>
          </div>

          <div>
            <span>Plate</span>
            <strong>{evidence.Plate || "UNKNOWN"}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{evidence.Location || "—"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
