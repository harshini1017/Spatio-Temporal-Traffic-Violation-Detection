import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter,
  NavLink,
  useLocation,
} from "react-router-dom";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE =
  "https://spatio-temporal-traffic-violation.onrender.com";

/*
  Video is stored in:
  frontend/public/final_video.mp4

  CDN is tried first because it avoids Vercel static-file
  delivery problems. Vercel is used as fallback.
*/
const VIDEO_SOURCES = [
  "https://cdn.jsdelivr.net/gh/harshini1017/Spatio-Temporal-Traffic-Violation-Detection@main/frontend/public/final_video.mp4",
  "https://raw.githubusercontent.com/harshini1017/Spatio-Temporal-Traffic-Violation-Detection/main/frontend/public/final_video.mp4",
  "/final_video.mp4",
];

/* Saranathan / Panjappur reference point */
const MAP_LAT = 10.757285;
const MAP_LNG = 78.651466;

const MAP_URL =
  `https://www.openstreetmap.org/export/embed.html?bbox=` +
  `${MAP_LNG - 0.012}%2C${MAP_LAT - 0.012}%2C` +
  `${MAP_LNG + 0.012}%2C${MAP_LAT + 0.012}` +
  `&layer=mapnik&marker=${MAP_LAT}%2C${MAP_LNG}`;


/* =========================================================
   APP
========================================================= */

export default function Dashboard() {
  return (
    <>
      <style>{styles}</style>

      <AppRouter />
    </>
  );
}


/* =========================================================
   ROUTER
========================================================= */

function AppRouter() {
  const location = useLocation();

  const [violations, setViolations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedEvidence, setSelectedEvidence] =
    useState(null);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/api/violations`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        if (!active) return;

        setViolations(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        console.error(
          "RoadSense API Error:",
          error
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const result = {
      total: violations.length,
      helmetless: 0,
      triple: 0,
      wrongWay: 0,
      mobile: 0,
    };

    violations.forEach((item) => {
      const type = String(
        item?.Violation || ""
      )
        .trim()
        .toLowerCase();

      if (type === "helmetless") {
        result.helmetless += 1;
      }

      if (type === "triple_riding") {
        result.triple += 1;
      }

      if (type === "wrong_way") {
        result.wrongWay += 1;
      }

      if (
        type.includes("mobile") ||
        type === "mobile_use"
      ) {
        result.mobile += 1;
      }
    });

    return result;
  }, [violations]);

  const hourlyData = useMemo(() => {
    const hours = {};

    violations.forEach((item) => {
      const time = String(
        item?.Time || ""
      );

      if (time.length >= 13) {
        const hour = time.slice(11, 13);

        hours[hour] =
          (hours[hour] || 0) + 1;
      }
    });

    return Object.entries(hours)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([hour, value]) => ({
        hour,
        value,
      }));
  }, [violations]);

  const maxHourlyValue = Math.max(
    ...hourlyData.map(
      (item) => item.value
    ),
    1
  );

  const filteredViolations = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return violations;
    }

    return violations.filter((item) => {
      const text = [
        item?.Violation,
        item?.Plate,
        item?.Track_ID,
        item?.Time,
        item?.Location,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [violations, search]);

  const getViolationName = (type) => {
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
      value.includes("mobile") ||
      value === "mobile_use"
    ) {
      return "Mobile Phone Usage";
    }

    return type || "Unknown";
  };

  const getEvidenceURL = (snapshot) => {
    if (!snapshot) {
      return null;
    }

    const normalized = String(snapshot)
      .replaceAll("\\", "/");

    const filename =
      normalized.split("/").pop();

    if (!filename) {
      return null;
    }

    return (
      `${API_BASE}/snapshots/` +
      encodeURIComponent(filename)
    );
  };

  const exportCSV = () => {
    window.open(
      `${API_BASE}/download/csv`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  let page = "dashboard";

  if (location.pathname === "/analytics") {
    page = "analytics";
  }

  if (location.pathname === "/map") {
    page = "map";
  }

  if (location.pathname === "/violations") {
    page = "violations";
  }

  return (
    <div className="rs-app">

      <Sidebar />

      <main className="rs-main">

        {page === "dashboard" && (
          <DashboardPage
            counts={counts}
            violations={violations}
            loading={loading}
            hourlyData={hourlyData}
            maxHourlyValue={
              maxHourlyValue
            }
            getViolationName={
              getViolationName
            }
            getEvidenceURL={
              getEvidenceURL
            }
            onEvidence={
              setSelectedEvidence
            }
            exportCSV={exportCSV}
          />
        )}

        {page === "analytics" && (
          <AnalyticsPage
            counts={counts}
            hourlyData={hourlyData}
            maxHourlyValue={
              maxHourlyValue
            }
          />
        )}

        {page === "map" && (
          <MapPage
            locationName={
              violations[0]?.Location ||
              "Saranathan Junction, Trichy"
            }
          />
        )}

        {page === "violations" && (
          <ViolationsPage
            violations={
              filteredViolations
            }
            loading={loading}
            search={search}
            setSearch={setSearch}
            getViolationName={
              getViolationName
            }
            getEvidenceURL={
              getEvidenceURL
            }
            onEvidence={
              setSelectedEvidence
            }
            exportCSV={exportCSV}
          />
        )}

      </main>

      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() =>
          setSelectedEvidence(null)
        }
      />

    </div>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-mark">
          R
        </div>

        <div>
          <strong>
            RoadSense
          </strong>

          <span>
            Mobility Intelligence
          </span>
        </div>
      </div>

      <div className="nav-title">
        MAIN
      </div>

      <nav className="main-nav">

        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon="▦"
          end
        />

        <NavItem
          to="/analytics"
          label="Analytics"
          icon="◒"
        />

        <NavItem
          to="/map"
          label="Map"
          icon="⌖"
        />

        <NavItem
          to="/violations"
          label="Violations"
          icon="◉"
        />

      </nav>

      <div className="sidebar-bottom">

        <div className="edge-card">

          <span className="status-dot"></span>

          <div>
            <strong>
              System Online
            </strong>

            <small>
              Edge services operational
            </small>
          </div>

        </div>

        <div className="version">
          RoadSense AI • v1.0
        </div>

      </div>

    </aside>
  );
}


function NavItem({
  to,
  label,
  icon,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `nav-link ${
          isActive
            ? "active"
            : ""
        }`
      }
    >
      <span>
        {icon}
      </span>

      {label}
    </NavLink>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage({
  counts,
  violations,
  loading,
  hourlyData,
  maxHourlyValue,
  getViolationName,
  getEvidenceURL,
  onEvidence,
  exportCSV,
}) {
  const [videoIndex, setVideoIndex] =
    useState(0);

  const [videoReady, setVideoReady] =
    useState(false);

  const [videoError, setVideoError] =
    useState(false);

  const videoRef = useRef(null);

  const videoSource =
    VIDEO_SOURCES[videoIndex];

  const locationName =
    violations[0]?.Location ||
    "Saranathan Junction, Trichy";

  const handleVideoError = () => {
    console.error(
      "Video failed:",
      videoSource
    );

    if (
      videoIndex <
      VIDEO_SOURCES.length - 1
    ) {
      setVideoReady(false);
      setVideoError(false);

      setVideoIndex(
        (current) => current + 1
      );

      return;
    }

    setVideoReady(false);
    setVideoError(true);
  };

  const handleVideoReady = () => {
    setVideoReady(true);
    setVideoError(false);
  };

  const playVideo = () => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current
      .play()
      .catch((error) => {
        console.error(
          "Play failed:",
          error
        );
      });
  };

  return (
    <>

      <header className="page-header">

        <div>
          <span className="eyebrow">
            ROADSENSE / DASHBOARD
          </span>

          <h1>
            Mobility Intelligence
          </h1>

          <p>
            Vehicle activity, traffic
            events and system status.
          </p>
        </div>

        <div className="online-badge">
          <span className="status-dot"></span>
          System Online
        </div>

      </header>


      {/* HERO */}

      <section className="hero-card">

        <div className="hero-content">

          <span className="hero-label">
            EDGE-AI MOBILITY PLATFORM
          </span>

          <h2>
            Intelligent road monitoring
            from existing CCTV.
          </h2>

          <p>
            RoadSense processes traffic
            video locally at the Edge to
            identify mobility events,
            generate evidence and support
            traffic intelligence.
          </p>

        </div>

        <div className="hero-stat">

          <span>
            DETECTED EVENTS
          </span>

          <strong>
            {counts.total}
          </strong>

          <small>
            Processed records
          </small>

        </div>

      </section>


      {/* KPI */}

      <section className="stats-grid">

        <StatCard
          title="Total Events"
          value={counts.total}
          description="Detected traffic events"
          icon="◈"
        />

        <StatCard
          title="Helmetless Riding"
          value={counts.helmetless}
          description="Helmet violations"
          icon="◉"
        />

        <StatCard
          title="Triple Riding"
          value={counts.triple}
          description="Excess rider events"
          icon="◆"
        />

        <StatCard
          title="Wrong-Way"
          value={counts.wrongWay}
          description="Direction violations"
          icon="↗"
        />

      </section>


      {/* VIDEO + ANALYSIS */}

      <section className="dashboard-grid">

        <div className="panel video-panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                PROCESSED TRAFFIC VIDEO
              </span>

              <h2>
                RoadSense Detection Output
              </h2>
            </div>

            <span className="ai-badge">
              AI PROCESSED
            </span>

          </div>


          <div className="video-wrapper">

            <video
              ref={videoRef}
              className="main-video"
              controls
              playsInline
              preload="auto"
              src={videoSource}
              onLoadedData={
                handleVideoReady
              }
              onCanPlay={
                handleVideoReady
              }
              onError={
                handleVideoError
              }
            >
              Your browser does not
              support HTML5 video.
            </video>


            {!videoReady &&
              !videoError && (
                <div className="video-overlay">

                  <div className="video-loader">

                    <div className="loader-circle"></div>

                    <span>
                      Loading RoadSense
                      video...
                    </span>

                  </div>

                </div>
              )}


            {videoError && (
              <div className="video-error">

                <div className="video-error-icon">
                  !
                </div>

                <strong>
                  Video could not be loaded
                </strong>

                <span>
                  Source:
                  {" "}
                  {videoIndex + 1}
                  {" / "}
                  {VIDEO_SOURCES.length}
                </span>

                <button
                  className="open-video-btn"
                  onClick={() => {
                    setVideoIndex(0);
                    setVideoError(false);
                    setVideoReady(false);
                  }}
                >
                  Retry Video
                </button>

              </div>
            )}


            {videoReady && (
              <button
                className="floating-play"
                onClick={playVideo}
                aria-label="Play video"
              >
                ▶
              </button>
            )}

          </div>


          <div className="video-footer">

            <span>
              Processed CCTV detection output
            </span>

            <a
              href={VIDEO_SOURCES[0]}
              target="_blank"
              rel="noreferrer"
            >
              Open Video ↗
            </a>

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                EVENT ANALYSIS
              </span>

              <h2>
                Violation Intelligence
              </h2>
            </div>

          </div>


          <AnalysisBar
            label="Helmetless Riding"
            value={counts.helmetless}
            total={counts.total}
          />

          <AnalysisBar
            label="Triple Riding"
            value={counts.triple}
            total={counts.total}
          />

          <AnalysisBar
            label="Wrong-Way Movement"
            value={counts.wrongWay}
            total={counts.total}
          />

          <AnalysisBar
            label="Mobile Phone Usage"
            value={counts.mobile}
            total={counts.total}
          />

        </div>

      </section>


      {/* ANALYTICS + MAP */}

      <section className="dashboard-grid">

        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                TRAFFIC ACTIVITY
              </span>

              <h2>
                Events by Hour
              </h2>
            </div>

            <NavLink
              to="/analytics"
              className="panel-link"
            >
              View Analytics →
            </NavLink>

          </div>


          <div className="hour-chart">

            {hourlyData.length === 0 ? (
              <div className="empty">
                No activity data
              </div>
            ) : (
              hourlyData.map(
                (item) => (
                  <div
                    className="hour-column"
                    key={item.hour}
                  >

                    <span className="hour-value">
                      {item.value}
                    </span>

                    <div className="hour-track">

                      <div
                        className="hour-bar"
                        style={{
                          height:
                            `${Math.max(
                              5,
                              (item.value /
                                maxHourlyValue) *
                                100
                            )}%`,
                        }}
                      />

                    </div>

                    <span className="hour-label">
                      {item.hour}:00
                    </span>

                  </div>
                )
              )
            )}

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                MONITORING ZONE
              </span>

              <h2>
                Live Location
              </h2>
            </div>

            <NavLink
              to="/map"
              className="panel-link"
            >
              Open Map →
            </NavLink>

          </div>


          <div className="mini-map">

            <iframe
              title="RoadSense monitoring map"
              src={MAP_URL}
              loading="lazy"
            />

          </div>


          <div className="location-footer">

            <div className="location-pin">
              ●
            </div>

            <div>

              <strong>
                {locationName}
              </strong>

              <span>
                Active monitoring zone
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* SYSTEM STATUS */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <span className="panel-label">
              SYSTEM HEALTH
            </span>

            <h2>
              RoadSense Services
            </h2>
          </div>

        </div>


        <div className="health-grid">

          <HealthItem
            label="Edge AI Processing"
          />

          <HealthItem
            label="Traffic Detection"
          />

          <HealthItem
            label="Evidence Service"
          />

          <HealthItem
            label="Backend API"
          />

        </div>

      </section>


      {/* RECENT EVENTS */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <span className="panel-label">
              DETECTION LOG
            </span>

            <h2>
              Recent Traffic Events
            </h2>
          </div>

          <button
            className="export-btn"
            onClick={exportCSV}
          >
            Export CSV
          </button>

        </div>


        {loading ? (
          <div className="empty">
            Loading events...
          </div>
        ) : (
          <EventTable
            violations={
              violations.slice(0, 10)
            }
            onEvidence={onEvidence}
            getEvidenceURL={
              getEvidenceURL
            }
            getViolationName={
              getViolationName
            }
          />
        )}

      </section>


      <Footer />

    </>
  );
}


/* =========================================================
   ANALYTICS PAGE
========================================================= */

function AnalyticsPage({
  counts,
  hourlyData,
  maxHourlyValue,
}) {
  const total =
    counts.total || 1;

  const helmetPct =
    Math.round(
      (counts.helmetless /
        total) *
        100
    );

  const triplePct =
    Math.round(
      (counts.triple /
        total) *
        100
    );

  const wrongPct =
    Math.round(
      (counts.wrongWay /
        total) *
        100
    );

  const mobilePct =
    Math.round(
      (counts.mobile /
        total) *
        100
    );

  return (
    <>

      <header className="page-header">

        <div>
          <span className="eyebrow">
            ROADSENSE / ANALYTICS
          </span>

          <h1>
            Traffic Analytics
          </h1>

          <p>
            Detection patterns from
            recorded RoadSense events.
          </p>
        </div>

      </header>


      <section className="stats-grid">

        <StatCard
          title="Total Events"
          value={counts.total}
          description="Recorded events"
          icon="◈"
        />

        <StatCard
          title="Helmetless"
          value={`${helmetPct}%`}
          description={`${counts.helmetless} events`}
          icon="◉"
        />

        <StatCard
          title="Triple Riding"
          value={`${triplePct}%`}
          description={`${counts.triple} events`}
          icon="◆"
        />

        <StatCard
          title="Wrong-Way"
          value={`${wrongPct}%`}
          description={`${counts.wrongWay} event`}
          icon="↗"
        />

      </section>


      <section className="analytics-layout">

        <div className="panel">

          <div className="panel-heading">
            <div>
              <span className="panel-label">
                EVENT DISTRIBUTION
              </span>

              <h2>
                Violation Breakdown
              </h2>
            </div>
          </div>


          <AnalysisBar
            label="Helmetless Riding"
            value={counts.helmetless}
            total={counts.total}
          />

          <AnalysisBar
            label="Triple Riding"
            value={counts.triple}
            total={counts.total}
          />

          <AnalysisBar
            label="Wrong-Way Movement"
            value={counts.wrongWay}
            total={counts.total}
          />

          <AnalysisBar
            label="Mobile Phone Usage"
            value={counts.mobile}
            total={counts.total}
          />

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                TRAFFIC ACTIVITY
              </span>

              <h2>
                Hourly Event Pattern
              </h2>
            </div>

          </div>


          <div className="large-hour-chart">

            {hourlyData.length === 0 ? (
              <div className="empty">
                No activity data
              </div>
            ) : (
              hourlyData.map(
                (item) => (
                  <div
                    className="large-hour-column"
                    key={item.hour}
                  >

                    <strong>
                      {item.value}
                    </strong>

                    <div className="large-hour-track">

                      <div
                        className="large-hour-bar"
                        style={{
                          height:
                            `${Math.max(
                              5,
                              (item.value /
                                maxHourlyValue) *
                                100
                            )}%`,
                        }}
                      />

                    </div>

                    <span>
                      {item.hour}:00
                    </span>

                  </div>
                )
              )
            )}

          </div>

        </div>

      </section>

    </>
  );
}


/* =========================================================
   MAP PAGE
========================================================= */

function MapPage({
  locationName,
}) {
  return (
    <>

      <header className="page-header">

        <div>

          <span className="eyebrow">
            ROADSENSE / MAP
          </span>

          <h1>
            Monitoring Map
          </h1>

          <p>
            Geographic view of the
            RoadSense monitoring zone.
          </p>

        </div>

        <div className="online-badge">
          <span className="status-dot"></span>
          Monitoring Active
        </div>

      </header>


      <section className="map-page-card">

        <iframe
          title="RoadSense monitoring map"
          src={MAP_URL}
          loading="lazy"
        />

      </section>


      <section className="map-info-grid">

        <div className="panel">

          <span className="panel-label">
            MONITORING LOCATION
          </span>

          <h2 className="location-title">
            {locationName}
          </h2>

          <p className="muted-text">
            Active RoadSense observation
            zone.
          </p>

        </div>


        <div className="panel">

          <span className="panel-label">
            REFERENCE POINT
          </span>

          <h2 className="location-title">
            {MAP_LAT.toFixed(6)},
            {" "}
            {MAP_LNG.toFixed(6)}
          </h2>

          <p className="muted-text">
            Saranathan / Panjappur area
          </p>

        </div>

      </section>

    </>
  );
}


/* =========================================================
   VIOLATIONS PAGE
========================================================= */

function ViolationsPage({
  violations,
  loading,
  search,
  setSearch,
  getViolationName,
  getEvidenceURL,
  onEvidence,
  exportCSV,
}) {
  return (
    <>

      <header className="page-header">

        <div>

          <span className="eyebrow">
            ROADSENSE / VIOLATIONS
          </span>

          <h1>
            Traffic Violations
          </h1>

          <p>
            Detected event records
            and evidence.
          </p>

        </div>


        <button
          className="export-btn"
          onClick={exportCSV}
        >
          Export CSV
        </button>

      </header>


      <section className="panel">

        <div className="violation-toolbar">

          <strong>
            {violations.length}
            {" "}
            records
          </strong>

          <input
            className="search-input"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search events..."
          />

        </div>


        {loading ? (
          <div className="empty">
            Loading violations...
          </div>
        ) : (
          <EventTable
            violations={violations}
            onEvidence={onEvidence}
            getEvidenceURL={
              getEvidenceURL
            }
            getViolationName={
              getViolationName
            }
          />
        )}

      </section>

    </>
  );
}


/* =========================================================
   EVENT TABLE
========================================================= */

function EventTable({
  violations,
  onEvidence,
  getEvidenceURL,
  getViolationName,
}) {
  if (!violations.length) {
    return (
      <div className="empty">
        No events found.
      </div>
    );
  }

  return (
    <div className="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Violation</th>
            <th>Plate</th>
            <th>Track ID</th>
            <th>Time</th>
            <th>Location</th>
            <th>Evidence</th>
          </tr>
        </thead>

        <tbody>

          {violations.map(
            (item, index) => (
              <tr key={index}>

                <td>
                  <span className="violation-tag">
                    {getViolationName(
                      item.Violation
                    )}
                  </span>
                </td>

                <td>
                  {item.Plate ||
                    "UNKNOWN"}
                </td>

                <td>
                  {item.Track_ID ||
                    "NA"}
                </td>

                <td>
                  {item.Time ||
                    "—"}
                </td>

                <td>
                  {item.Location ||
                    "—"}
                </td>

                <td>

                  <button
                    className="evidence-btn"
                    onClick={() =>
                      onEvidence({
                        ...item,
                        url:
                          getEvidenceURL(
                            item.Snapshot
                          ),
                      })
                    }
                  >
                    View Evidence
                  </button>

                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>
  );
}


function AnalysisBar({
  label,
  value,
  total,
}) {
  const percent =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div className="analysis-item">

      <div className="analysis-top">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <div className="analysis-track">
        <div
          className="analysis-fill"
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>

      <small>
        {percent}% of events
      </small>

    </div>
  );
}


function HealthItem({
  label,
}) {
  return (
    <div className="health-item">

      <div className="health-check">
        ✓
      </div>

      <div>
        <strong>
          {label}
        </strong>

        <span>
          Operational
        </span>
      </div>

    </div>
  );
}


function EvidenceModal({
  evidence,
  onClose,
}) {
  if (!evidence) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-heading">

          <div>

            <span className="panel-label">
              EVENT EVIDENCE
            </span>

            <h2>
              {evidence.Violation ||
                "Traffic Event"}
            </h2>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {evidence.url ? (
          <img
            src={evidence.url}
            alt="RoadSense evidence"
            className="evidence-image"
          />
        ) : (
          <div className="empty">
            Evidence unavailable.
          </div>
        )}


        <div className="evidence-details">

          <div>
            <span>Time</span>
            <strong>
              {evidence.Time ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Plate</span>
            <strong>
              {evidence.Plate ||
                "UNKNOWN"}
            </strong>
          </div>

          <div>
            <span>Location</span>
            <strong>
              {evidence.Location ||
                "—"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}


function Footer() {
  return (
    <footer className="footer">
      RoadSense AI
      <span>•</span>
      Edge-AI Based Mobility Intelligence Platform
    </footer>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = `
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #060f1b;
  color: #eaf2fb;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  text-decoration: none;
}

.rs-app {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(
      circle at 80% 0%,
      rgba(24, 113, 214, 0.12),
      transparent 28%
    ),
    #060f1b;
}

/* SIDEBAR */

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 245px;
  padding: 25px 17px;
  background: #081522;
  border-right: 1px solid #172a40;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 8px 30px;
}

.brand-mark {
  width: 41px;
  height: 41px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background:
    linear-gradient(
      135deg,
      #1982ff,
      #0b5ed7
    );
  color: white;
  font-size: 19px;
  font-weight: 800;
  box-shadow:
    0 10px 28px
    rgba(23, 121, 255, 0.25);
}

.brand strong {
  display: block;
  font-size: 17px;
}

.brand span {
  display: block;
  color: #687d94;
  font-size: 10px;
  margin-top: 3px;
}

.nav-title {
  padding: 0 10px 10px;
  color: #536a83;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.main-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 13px;
  border-radius: 10px;
  color: #7f95ab;
  font-size: 12px;
  transition: 0.2s;
}

.nav-link span {
  width: 18px;
  text-align: center;
  color: #579fff;
}

.nav-link:hover {
  color: white;
  background: #0d2136;
}

.nav-link.active {
  color: white;
  background:
    linear-gradient(
      90deg,
      #10365c,
      #0c243d
    );
  border: 1px solid #17466f;
}

.sidebar-bottom {
  margin-top: auto;
}

.edge-card {
  padding: 13px;
  display: flex;
  gap: 10px;
  background: #0b1b2b;
  border: 1px solid #183047;
  border-radius: 12px;
}

.edge-card strong {
  display: block;
  font-size: 11px;
}

.edge-card small {
  display: block;
  color: #667b91;
  font-size: 9px;
  margin-top: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-top: 4px;
  border-radius: 50%;
  background: #30d596;
  box-shadow:
    0 0 12px
    rgba(48, 213, 150, 0.65);
}

.version {
  color: #485e74;
  font-size: 9px;
  padding: 15px 4px 0;
}

/* MAIN */

.rs-main {
  width: calc(100% - 245px);
  margin-left: 245px;
  padding: 34px;
  max-width: 1550px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.eyebrow {
  color: #52708f;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.page-header h1 {
  margin: 7px 0 6px;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -1px;
}

.page-header p {
  margin: 0;
  color: #70849a;
  font-size: 12px;
}

.online-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid #194337;
  border-radius: 30px;
  background: #0b1d2a;
  color: #88dcb9;
  font-size: 10px;
}

/* HERO */

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 28px;
  margin-bottom: 17px;
  border: 1px solid #193550;
  border-radius: 18px;
  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(28, 126, 233, 0.16),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      #0b1d31,
      #091827
    );
}

.hero-label {
  color: #4f9fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.hero-content h2 {
  max-width: 650px;
  margin: 8px 0 10px;
  font-size: 24px;
  line-height: 1.18;
}

.hero-content p {
  max-width: 690px;
  margin: 0;
  line-height: 1.65;
  color: #71869c;
  font-size: 12px;
}

.hero-stat {
  min-width: 170px;
  padding: 18px;
  border: 1px solid #1a3956;
  border-radius: 14px;
  background: #0a1a2c;
}

.hero-stat span {
  display: block;
  color: #5d7690;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

.hero-stat strong {
  display: block;
  margin-top: 7px;
  color: white;
  font-size: 34px;
}

.hero-stat small {
  color: #60768d;
  font-size: 9px;
}

/* STATS */

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 17px;
}

.stat-card {
  position: relative;
  min-height: 132px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid #172e46;
  border-radius: 15px;
  background: #0a1929;
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin-bottom: 13px;
  border-radius: 8px;
  background: #102b47;
  color: #63afff;
  font-size: 11px;
}

.stat-card span {
  display: block;
  color: #758aa0;
  font-size: 10px;
}

.stat-card strong {
  display: block;
  margin: 5px 0 2px;
  color: #f2f7fc;
  font-size: 28px;
}

.stat-card small {
  color: #536a82;
  font-size: 9px;
}

/* PANELS */

.panel {
  padding: 20px;
  margin-bottom: 17px;
  border: 1px solid #172e46;
  border-radius: 16px;
  background: rgba(9, 25, 41, 0.96);
  box-shadow:
    0 18px 50px
    rgba(0, 0, 0, 0.08);
}

.dashboard-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(0, 1fr);
  gap: 17px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 16px;
}

.panel-label {
  color: #56728f;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.panel-heading h2 {
  margin: 5px 0 0;
  color: #eef5fb;
  font-size: 15px;
}

.panel-link {
  color: #65adff;
  font-size: 10px;
  font-weight: 700;
}

.ai-badge {
  padding: 6px 9px;
  border: 1px solid #194877;
  border-radius: 20px;
  background: #0e2a46;
  color: #70b6ff;
  font-size: 8px;
  font-weight: 800;
}

/* VIDEO */

.video-panel {
  padding-bottom: 12px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  min-height: 390px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #17304a;
  border-radius: 13px;
  background: #01070d;
}

.main-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #01070d;
}

.video-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(1, 7, 13, 0.28);
  pointer-events: none;
}

.video-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 17px 20px;
  border: 1px solid #1a344d;
  border-radius: 12px;
  background: rgba(3, 11, 19, 0.8);
  color: #9ab0c8;
  font-size: 10px;
}

.loader-circle {
  width: 26px;
  height: 26px;
  border: 2px solid #24425e;
  border-top-color: #55aaff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.video-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 30px;
  text-align: center;
  background:
    radial-gradient(
      circle,
      #102239,
      #02070e
    );
}

.video-error-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #36201c;
  color: #ffab8c;
  font-weight: 800;
  font-size: 17px;
}

.video-error strong {
  color: #edf4fa;
  font-size: 13px;
}

.video-error span {
  color: #71879e;
  font-size: 9px;
}

.open-video-btn {
  margin-top: 8px;
  padding: 9px 13px;
  border: 0;
  border-radius: 8px;
  background: #1478ee;
  color: #fff;
  font-size: 10px;
}

.floating-play {
  position: absolute;
  left: 17px;
  bottom: 48px;
  width: 40px;
  height: 40px;
  z-index: 5;
  border: 1px solid #2b608f;
  border-radius: 50%;
  background: rgba(8, 26, 43, 0.92);
  color: #eef7ff;
}

.video-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 2px 0;
}

.video-footer span {
  color: #5b7189;
  font-size: 9px;
}

.video-footer a {
  color: #65adff;
  font-size: 9px;
}

/* ANALYSIS */

.analysis-item {
  margin-bottom: 23px;
}

.analysis-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  font-size: 11px;
}

.analysis-top span {
  color: #94a8bc;
}

.analysis-top strong {
  color: #fff;
}

.analysis-track {
  height: 7px;
  overflow: hidden;
  border-radius: 10px;
  background: #13273d;
}

.analysis-fill {
  height: 100%;
  border-radius: inherit;
  background:
    linear-gradient(
      90deg,
      #1477eb,
      #58b2ff
    );
}

.analysis-item small {
  display: block;
  margin-top: 5px;
  color: #566e86;
  font-size: 8px;
}

/* CHART */

.hour-chart {
  height: 215px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 52px;
  padding: 18px;
  border-bottom: 1px solid #172e46;
}

.hour-column {
  width: 48px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.hour-value {
  color: #a6d2fa;
  font-size: 10px;
  margin-bottom: 7px;
}

.hour-track {
  width: 31px;
  height: 155px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 7px;
  background: #0d2034;
}

.hour-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 7px;
  background:
    linear-gradient(
      180deg,
      #59b4ff,
      #126de2
    );
}

.hour-label {
  margin-top: 8px;
  color: #5d748c;
  font-size: 9px;
}

/* MAP */

.mini-map {
  height: 215px;
  overflow: hidden;
  border: 1px solid #17304a;
  border-radius: 12px;
  background: #0b1827;
}

.mini-map iframe,
.map-page-card iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.location-footer {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.location-pin {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #0d2b47;
  color: #65b1ff;
}

.location-footer strong {
  display: block;
  color: #dce8f3;
  font-size: 10px;
}

.location-footer span {
  display: block;
  color: #587087;
  margin-top: 3px;
  font-size: 8px;
}

/* HEALTH */

.health-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px;
  border: 1px solid #172e46;
  border-radius: 10px;
  background: #0a1b2c;
}

.health-check {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0e382b;
  color: #43d89c;
  font-size: 11px;
}

.health-item strong {
  display: block;
  color: #d9e6f1;
  font-size: 10px;
}

.health-item span {
  display: block;
  color: #5f758c;
  margin-top: 3px;
  font-size: 8px;
}

/* TABLE */

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

th {
  padding: 12px 14px;
  text-align: left;
  background: #091827;
  border-bottom: 1px solid #172e46;
  color: #58718b;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

td {
  padding: 13px 14px;
  border-bottom: 1px solid #13283e;
  color: #9cafc1;
  font-size: 10px;
}

tr:hover td {
  background: #0c2034;
}

.violation-tag {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 6px;
  background: #102c48;
  color: #7bbaff;
  font-size: 8px;
  font-weight: 800;
  white-space: nowrap;
}

.evidence-btn,
.export-btn {
  padding: 7px 10px;
  border: 1px solid #205183;
  border-radius: 7px;
  background: #0d2944;
  color: #76b9ff;
  font-size: 9px;
}

.evidence-btn:hover,
.export-btn:hover {
  background: #123a60;
}

/* ANALYTICS PAGE */

.analytics-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
}

.large-hour-chart {
  height: 290px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 60px;
  padding: 20px;
  border-bottom: 1px solid #172e46;
}

.large-hour-column {
  width: 52px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.large-hour-column strong {
  color: #a8d7ff;
  font-size: 11px;
  margin-bottom: 8px;
}

.large-hour-track {
  width: 38px;
  height: 225px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 8px;
  background: #0d1f33;
}

.large-hour-bar {
  width: 100%;
  min-height: 5px;
  border-radius: 8px;
  background:
    linear-gradient(
      180deg,
      #5bb4ff,
      #1470e3
    );
}

.large-hour-column span {
  color: #60768e;
  font-size: 9px;
  margin-top: 8px;
}

/* MAP PAGE */

.map-page-card {
  height: 65vh;
  min-height: 510px;
  overflow: hidden;
  margin-bottom: 17px;
  border: 1px solid #172e46;
  border-radius: 17px;
  background: #0a1725;
}

.map-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
}

.location-title {
  margin: 8px 0;
  color: #eaf2fa;
  font-size: 18px;
}

.muted-text {
  margin: 0;
  color: #657b92;
  font-size: 10px;
}

/* VIOLATIONS */

.violation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
}

.violation-toolbar strong {
  color: #92a7bb;
  font-size: 10px;
}

.search-input {
  width: 320px;
  max-width: 100%;
  padding: 9px 11px;
  outline: none;
  border: 1px solid #1b344e;
  border-radius: 8px;
  background: #081725;
  color: #dce8f3;
  font-size: 10px;
}

.search-input::placeholder {
  color: #526980;
}

.search-input:focus {
  border-color: #2d73ad;
}

/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(1, 6, 12, 0.84);
}

.modal {
  width: min(780px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: 19px;
  border: 1px solid #24405d;
  border-radius: 16px;
  background: #0a1b2d;
  box-shadow:
    0 30px 80px
    rgba(0, 0, 0, 0.4);
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.modal-heading h2 {
  margin: 5px 0 0;
  font-size: 17px;
}

.close-btn {
  width: 31px;
  height: 31px;
  border: 1px solid #1c3650;
  border-radius: 8px;
  background: #10253b;
  color: #9eb2c7;
  font-size: 19px;
}

.evidence-image {
  display: block;
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 10px;
  background: #02070d;
}

.evidence-details {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 9px;
  margin-top: 12px;
}

.evidence-details div {
  padding: 11px;
  border: 1px solid #172e46;
  border-radius: 9px;
  background: #0d2033;
}

.evidence-details span {
  display: block;
  color: #58708a;
  font-size: 8px;
}

.evidence-details strong {
  display: block;
  margin-top: 5px;
  color: #dce7f1;
  font-size: 9px;
}

/* EMPTY */

.empty {
  min-height: 130px;
  display: grid;
  place-items: center;
  color: #5b7189;
  font-size: 10px;
}

/* FOOTER */

.footer {
  padding: 15px;
  text-align: center;
  color: #40566d;
  font-size: 9px;
}

.footer span {
  margin: 0 5px;
  color: #257fe4;
}

/* MOBILE */

@media (max-width: 1180px) {

  .sidebar {
    width: 215px;
  }

  .rs-main {
    width: calc(100% - 215px);
    margin-left: 215px;
    padding: 25px;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .dashboard-grid,
  .analytics-layout {
    grid-template-columns: 1fr;
  }

  .health-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}

@media (max-width: 760px) {

  .rs-app {
    display: block;
  }

  .sidebar {
    position: static;
    width: 100%;
    min-height: auto;
  }

  .rs-main {
    width: 100%;
    margin-left: 0;
    padding: 18px;
  }

  .page-header {
    display: block;
  }

  .online-badge {
    display: inline-flex;
    margin-top: 14px;
  }

  .hero-card {
    display: block;
  }

  .hero-stat {
    margin-top: 18px;
  }

  .stats-grid,
  .health-grid,
  .map-info-grid {
    grid-template-columns: 1fr;
  }

  .video-wrapper {
    min-height: 245px;
  }

  .violation-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .evidence-details {
    grid-template-columns: 1fr;
  }

}
`;
