import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./main.css";

const API_BASE = "https://spatio-temporal-traffic-violation.onrender.com";

const violationLabels = {
  helmetless: "Helmetless Riding",
  triple_riding: "Triple Riding",
  mobile_usage: "Mobile Phone Usage",
  wrong_way: "Wrong-Way Movement",
};

const violationShortLabels = {
  helmetless: "Helmetless",
  triple_riding: "Triple Riding",
  mobile_usage: "Mobile Phone",
  wrong_way: "Wrong-Way",
};

function normalizeViolation(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function formatViolation(value) {
  const key = normalizeViolation(value);
  return violationLabels[key] || String(value || "Unknown");
}

function formatTime(value) {
  if (!value) return "--";

  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getSnapshotName(snapshot) {
  if (!snapshot) return "";

  const cleaned = String(snapshot)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return cleaned.split("/").pop() || "";
}

function getEvidenceUrl(snapshot) {
  const filename = getSnapshotName(snapshot);

  if (!filename) return "";

  return `${API_BASE}/snapshots/${encodeURIComponent(filename)}`;
}

function getViolationClass(value) {
  const key = normalizeViolation(value);

  if (key === "helmetless") return "badge helmet";
  if (key === "triple_riding") return "badge triple";
  if (key === "mobile_usage") return "badge phone";
  if (key === "wrong_way") return "badge wrong";

  return "badge";
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg {...common}>
        <path d="M10.3 3.8 2.9 17a2 2 0 0 0 1.75 3h14.7a2 2 0 0 0 1.75-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...common}>
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    );
  }

  if (name === "trend") {
    return (
      <svg {...common}>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M16 6h5v5" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 21h16" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </svg>
    );
  }

  return null;
}

function StatCard({ title, value, subtitle, icon, accent }) {
  return (
    <div className={`stat-card ${accent || ""}`}>
      <div className="stat-top">
        <div className="stat-icon">
          <Icon name={icon} size={21} />
        </div>
        <span className="stat-label">{title}</span>
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

function AppShell({ page, children, total }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RS</div>
          <div>
            <div className="brand-name">RoadSense AI</div>
            <div className="brand-subtitle">Mobility Intelligence</div>
          </div>
        </div>

        <div className="nav-section-title">MONITORING</div>

        <nav className="nav-menu">
          <Link
            to="/dashboard"
            className={
              location.pathname === "/dashboard" || page === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/violations"
            className={
              location.pathname === "/violations" || page === "violations"
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Icon name="alert" />
            <span>Violations</span>
            <span className="nav-count">{total}</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>System Online</strong>
              <span>Edge monitoring active</span>
            </div>
          </div>

          <div className="sidebar-footer">
            RoadSense AI
            <br />
            Edge Traffic Intelligence
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function DashboardPage({
  rows,
  counts,
  total,
  search,
  setSearch,
  selectedViolation,
  setSelectedViolation,
  openEvidence,
  setOpenEvidence,
}) {
  const [videoError, setVideoError] = useState(false);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        const type = normalizeViolation(row.Violation);
        return (
          selectedViolation === "all" || type === selectedViolation
        );
      })
      .filter((row) => {
        if (!query) return true;

        return [
          row.Violation,
          row.Time,
          row.Track_ID,
          row.Plate,
          row.Location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice()
      .reverse();
  }, [rows, search, selectedViolation]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    rows.forEach((row) => {
      const raw = String(row.Time || "");
      const match = raw.match(/\s(\d{2}):/);

      if (match) {
        const hour = Number(match[1]);

        if (hour >= 0 && hour <= 23) {
          hours[hour].count += 1;
        }
      }
    });

    return hours.filter((item) => item.count > 0);
  }, [rows]);

  const maxHourlyCount = Math.max(
    ...hourlyData.map((item) => item.count),
    1
  );

  const location =
    rows.find((row) => row.Location)?.Location ||
    "Saranathan Junction, Trichy";

  return (
    <>
      <header className="topbar">
        <div>
          <div className="page-kicker">TRAFFIC MONITORING</div>
          <h1>Dashboard</h1>
          <p>
            Real-time traffic violation intelligence from CCTV-based Edge-AI
            processing.
          </p>
        </div>

        <div className="topbar-status">
          <span className="live-dot" />
          LIVE SYSTEM
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          title="TOTAL VIOLATIONS"
          value={total}
          subtitle="Recorded events"
          icon="alert"
          accent="blue"
        />

        <StatCard
          title="HELMETLESS"
          value={counts.helmetless}
          subtitle="Safety violations"
          icon="alert"
          accent="red"
        />

        <StatCard
          title="TRIPLE RIDING"
          value={counts.triple_riding}
          subtitle="Excess rider events"
          icon="dashboard"
          accent="orange"
        />

        <StatCard
          title="WRONG-WAY"
          value={counts.wrong_way}
          subtitle="Direction violations"
          icon="trend"
          accent="purple"
        />
      </section>

      <section className="primary-grid">
        <div className="panel video-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">DEMO / VIDEO ANALYSIS</div>
              <h2>Traffic Violation Detection</h2>
            </div>

            <div className="panel-live">
              <span className="small-live-dot" />
              Edge AI
            </div>
          </div>

          <div className="video-frame">
            {!videoError ? (
              <video
                className="dashboard-video"
                controls
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
              >
                <source src="/final_video.mp4" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="video-error">
                <div className="video-error-icon">
                  <Icon name="video" size={30} />
                </div>
                <h3>Demo video could not be loaded</h3>
                <p>
                  Make sure <strong>final_video.mp4</strong> is present inside
                  <strong> frontend/public/</strong>.
                </p>
                <button
                  className="retry-button"
                  onClick={() => setVideoError(false)}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="panel location-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">MONITORING ZONE</div>
              <h2>Location</h2>
            </div>
            <Icon name="location" size={21} />
          </div>

          <div className="map-visual">
            <div className="map-grid" />
            <div className="road road-a" />
            <div className="road road-b" />
            <div className="road road-c" />
            <div className="road road-d" />

            <div className="map-marker">
              <span className="marker-pulse" />
              <span className="marker-dot" />
            </div>

            <div className="map-label">
              <strong>{location}</strong>
              <span>Active monitoring location</span>
            </div>
          </div>

          <div className="location-footer">
            <div>
              <span className="footer-label">CAMERA STATUS</span>
              <strong>
                <span className="online-indicator" />
                Connected
              </strong>
            </div>

            <div>
              <span className="footer-label">PROCESSING</span>
              <strong>Edge AI</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">TRAFFIC ANALYTICS</div>
              <h2>Event Trend by Hour</h2>
            </div>
            <Icon name="trend" size={21} />
          </div>

          {hourlyData.length > 0 ? (
            <div className="chart">
              {hourlyData.map((item) => (
                <div className="chart-column" key={item.hour}>
                  <div className="chart-value">{item.count}</div>

                  <div className="chart-track">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(
                          12,
                          (item.count / maxHourlyCount) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="chart-label">
                    {String(item.hour).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No event trend data available.</div>
          )}
        </div>

        <div className="panel breakdown-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">EVENT BREAKDOWN</div>
              <h2>Violation Types</h2>
            </div>
            <Icon name="dashboard" size={21} />
          </div>

          <div className="breakdown-list">
            {[
              ["helmetless", "Helmetless Riding", counts.helmetless],
              ["triple_riding", "Triple Riding", counts.triple_riding],
              ["mobile_usage", "Mobile Phone Usage", counts.mobile_usage],
              ["wrong_way", "Wrong-Way Movement", counts.wrong_way],
            ].map(([key, label, value]) => {
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;

              return (
                <div className="breakdown-row" key={key}>
                  <div className="breakdown-info">
                    <span className={`breakdown-dot ${key}`} />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>

                  <div className="progress">
                    <div
                      className={`progress-fill ${key}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading recent-heading">
          <div>
            <div className="panel-eyebrow">LATEST EVENTS</div>
            <h2>Recent Traffic Violations</h2>
          </div>

          <Link to="/violations" className="view-all">
            View all
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>VIOLATION</th>
                <th>TIME</th>
                <th>TRACK ID</th>
                <th>PLATE</th>
                <th>LOCATION</th>
                <th>EVIDENCE</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.slice(0, 7).map((row, index) => (
                <tr key={`${row.Time}-${row.Violation}-${index}`}>
                  <td>
                    <span className={getViolationClass(row.Violation)}>
                      {formatViolation(row.Violation)}
                    </span>
                  </td>

                  <td>
                    <span className="table-time">
                      <Icon name="clock" size={15} />
                      {formatTime(row.Time)}
                    </span>
                  </td>

                  <td>{row.Track_ID || "NA"}</td>

                  <td>
                    <span className="plate-value">
                      {row.Plate || "UNKNOWN"}
                    </span>
                  </td>

                  <td>{row.Location || "Saranathan Junction, Trichy"}</td>

                  <td>
                    {getSnapshotName(row.Snapshot) ? (
                      <button
                        className="evidence-button"
                        onClick={() => setOpenEvidence(row)}
                      >
                        View
                      </button>
                    ) : (
                      <span className="muted">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="table-empty">
                      No matching violation records found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openEvidence && (
        <EvidenceModal
          row={openEvidence}
          onClose={() => setOpenEvidence(null)}
        />
      )}
    </>
  );
}

function ViolationsPage({
  rows,
  search,
  setSearch,
  selectedViolation,
  setSelectedViolation,
  openEvidence,
  setOpenEvidence,
}) {
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        const type = normalizeViolation(row.Violation);
        return selectedViolation === "all" || type === selectedViolation;
      })
      .filter((row) => {
        if (!query) return true;

        return [
          row.Violation,
          row.Time,
          row.Track_ID,
          row.Plate,
          row.Location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice()
      .reverse();
  }, [rows, search, selectedViolation]);

  return (
    <>
      <header className="topbar">
        <div>
          <div className="page-kicker">EVENT MANAGEMENT</div>
          <h1>Traffic Violations</h1>
          <p>
            Review detected traffic events and associated digital evidence.
          </p>
        </div>

        <button
          className="export-button"
          onClick={() =>
            window.open(`${API_BASE}/download/csv`, "_blank")
          }
        >
          <Icon name="download" size={17} />
          Export CSV
        </button>
      </header>

      <section className="panel filters-panel">
        <div className="filter-row">
          <div className="search-box">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Search violations, plate, location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedViolation}
            onChange={(event) => setSelectedViolation(event.target.value)}
          >
            <option value="all">All Violations</option>
            <option value="helmetless">Helmetless Riding</option>
            <option value="triple_riding">Triple Riding</option>
            <option value="mobile_usage">Mobile Phone Usage</option>
            <option value="wrong_way">Wrong-Way Movement</option>
          </select>
        </div>
      </section>

      <section className="panel full-events-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-eyebrow">EVENT RECORDS</div>
            <h2>{filteredRows.length} Records</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="events-table">
            <thead>
