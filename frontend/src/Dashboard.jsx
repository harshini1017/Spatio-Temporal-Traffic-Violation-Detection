import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  "https://spatio-temporal-traffic-violation.onrender.com";

const VIDEO_URL = "/output_video.mp4";

const FALLBACK_VIDEO_URL =
  `${API_BASE}/videos/output_video.mp4`;

/* Saranathan / Panjappur reference location */
const MAP_LAT = 10.757285;
const MAP_LNG = 78.651466;

const MAP_URL =
  `https://www.openstreetmap.org/export/embed.html?bbox=` +
  `${MAP_LNG - 0.012}%2C${MAP_LAT - 0.012}%2C` +
  `${MAP_LNG + 0.012}%2C${MAP_LAT + 0.012}` +
  `&layer=mapnik&marker=${MAP_LAT}%2C${MAP_LNG}`;


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Dashboard() {
  const location = useLocation();

  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvidence, setSelectedEvidence] =
    useState(null);

  const [videoSource, setVideoSource] =
    useState(VIDEO_URL);

  const [videoError, setVideoError] =
    useState(false);

  const [videoReady, setVideoReady] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const videoRef = useRef(null);


  /* =========================================================
     LOAD BACKEND DATA
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/api/violations`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `API error: ${res.status}`
          );
        }

        return res.json();
      })
      .then((data) => {
        if (!mounted) return;

        setViolations(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        console.error(
          "Violation API error:",
          error
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);


  /* =========================================================
     COUNTS
  ========================================================= */

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
      ).toLowerCase();

      if (type === "helmetless") {
        result.helmetless++;
      }

      if (type === "triple_riding") {
        result.triple++;
      }

      if (type === "wrong_way") {
        result.wrongWay++;
      }

      if (
        type.includes("mobile") ||
        type === "mobile_use"
      ) {
        result.mobile++;
      }
    });

    return result;
  }, [violations]);


  /* =========================================================
     HOURLY ANALYTICS
  ========================================================= */

  const hourlyData = useMemo(() => {
    const hours = {};

    violations.forEach((item) => {
      const value = String(
        item?.Time || ""
      );

      if (value.length >= 13) {
        const hour =
          value.substring(11, 13);

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


  /* =========================================================
     FILTERED VIOLATIONS
  ========================================================= */

  const filteredViolations = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase();

    if (!q) {
      return violations;
    }

    return violations.filter(
      (item) =>
        String(item?.Violation || "")
          .toLowerCase()
          .includes(q) ||
        String(item?.Plate || "")
          .toLowerCase()
          .includes(q) ||
        String(item?.Location || "")
          .toLowerCase()
          .includes(q) ||
        String(item?.Time || "")
          .toLowerCase()
          .includes(q)
    );
  }, [violations, search]);


  /* =========================================================
     VIDEO
  ========================================================= */

  const handleVideoError = () => {
    if (videoSource === VIDEO_URL) {
      setVideoSource(
        FALLBACK_VIDEO_URL
      );
    } else {
      setVideoError(true);
    }
  };


  const handleVideoLoaded = () => {
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
        console.log(
          "Video play:",
          error
        );
      });
  };


  /* =========================================================
     HELPERS
  ========================================================= */

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

    const normalized = String(
      snapshot
    ).replaceAll("\\", "/");

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
      "_blank"
    );
  };


  /* =========================================================
     PAGE SWITCH
  ========================================================= */

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
    <>
      <style>{styles}</style>

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
              locationName={
                violations[0]?.Location ||
                "Saranathan Junction, Trichy"
              }
              videoRef={videoRef}
              videoSource={videoSource}
              videoError={videoError}
              videoReady={videoReady}
              onVideoError={
                handleVideoError
              }
              onVideoLoaded={
                handleVideoLoaded
              }
              onPlay={playVideo}
              onEvidence={
                setSelectedEvidence
              }
              getEvidenceURL={
                getEvidenceURL
              }
              getViolationName={
                getViolationName
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
              onEvidence={
                setSelectedEvidence
              }
              getEvidenceURL={
                getEvidenceURL
              }
              getViolationName={
                getViolationName
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
    </>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: "▦",
      end: true,
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: "◒",
    },
    {
      to: "/map",
      label: "Map",
      icon: "⌖",
    },
    {
      to: "/violations",
      label: "Violations",
      icon: "◉",
    },
  ];

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
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              {item.icon}
            </span>

            {item.label}
          </NavLink>
        ))}
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


/* =========================================================
   DASHBOARD PAGE
========================================================= */

function DashboardPage({
  counts,
  violations,
  loading,
  hourlyData,
  maxHourlyValue,
  locationName,
  videoRef,
  videoSource,
  videoError,
  videoReady,
  onVideoError,
  onVideoLoaded,
  onPlay,
  onEvidence,
  getEvidenceURL,
  getViolationName,
  exportCSV,
}) {
  return (
    <>

      {/* HEADER */}

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


      {/* VIDEO + INTELLIGENCE */}

      <section className="dashboard-grid">

        {/* VIDEO */}

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
              key={videoSource}
              className="main-video"
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={
                onVideoLoaded
              }
              onCanPlay={
                onVideoLoaded
              }
              onError={
                onVideoError
              }
            >

              <source
                src={videoSource}
                type="video/mp4"
              />

              Your browser does not support
              HTML5 video.

            </video>


            {!videoReady &&
              !videoError && (
                <div className="video-overlay">

                  <div className="video-loader">
                    <div className="loader-circle"></div>

                    <span>
                      Loading processed video...
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
                  Verify that
                  <b>
                    frontend/public/output_video.mp4
                  </b>
                  is included in the Vercel deployment.
                </span>

                <a
                  href={VIDEO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="open-video-btn"
                >
                  Open Video File
                </a>

              </div>
            )}


            {!videoError &&
              videoReady && (
                <button
                  className="play-overlay"
                  onClick={onPlay}
                  aria-label="Play video"
                >
                  ▶
                </button>
              )}

          </div>

          <div className="video-footer">

            <span>
              Processed CCTV output
            </span>

            <a
              href={VIDEO_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open video ↗
            </a>

          </div>

        </div>


        {/* INTELLIGENCE */}

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


          <div className="intel-list">

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


          <div className="mini-summary">

            <div>
              <span>
                EVENTS
              </span>

              <strong>
                {counts.total}
              </strong>
            </div>

            <div>
              <span>
                LOCATION
              </span>

              <strong>
                Trichy
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* ANALYTICS + MAP */}

      <section className="dashboard-grid">

        {/* ANALYTICS */}

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
                No activity data available
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


        {/* MAP */}

        <div className="panel map-preview-panel">

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


      {/* SYSTEM */}

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

      <section className="panel recent-panel">

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

  const helmetPct = Math.round(
    (counts.helmetless / total) *
      100
  );

  const triplePct = Math.round(
    (counts.triple / total) *
      100
  );

  const wrongPct = Math.round(
    (counts.wrongWay / total) *
      100
  );

  const mobilePct = Math.round(
    (counts.mobile / total) *
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
            Detection patterns from recorded
            RoadSense events.
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

        <div className="panel analytics-donut-card">

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


          <div className="donut-layout">

            <DonutChart
              helmetless={
                counts.helmetless
              }
              triple={
                counts.triple
              }
              wrongWay={
                counts.wrongWay
              }
              mobile={
                counts.mobile
              }
              total={
                counts.total
              }
            />

            <div className="legend">

              <LegendItem
                label="Helmetless Riding"
                value={
                  counts.helmetless
                }
                percentage={
                  helmetPct
                }
              />

              <LegendItem
                label="Triple Riding"
                value={
                  counts.triple
                }
                percentage={
                  triplePct
                }
              />

              <LegendItem
                label="Wrong-Way Movement"
                value={
                  counts.wrongWay
                }
                percentage={
                  wrongPct
                }
              />

              <LegendItem
                label="Mobile Phone"
                value={
                  counts.mobile
                }
                percentage={
                  mobilePct
                }
              />

            </div>

          </div>

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

            {hourlyData.map(
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
            )}

          </div>

        </div>

      </section>


      <section className="panel analytics-summary">

        <div className="summary-box">
          <span>
            DETECTED EVENTS
          </span>
          <strong>
            {counts.total}
          </strong>
        </div>

        <div className="summary-box">
          <span>
            HELMETLESS
          </span>
          <strong>
            {counts.helmetless}
          </strong>
        </div>

        <div className="summary-box">
          <span>
            TRIPLE RIDING
          </span>
          <strong>
            {counts.triple}
          </strong>
        </div>

        <div className="summary-box">
          <span>
            WRONG-WAY
          </span>
          <strong>
            {counts.wrongWay}
          </strong>
        </div>

      </section>

    </>
  );
}


/* =========================================================
   REAL MAP PAGE
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
            Geographic view of the RoadSense
            monitoring zone.
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
          className="full-map"
        />

      </section>


      <section className="map-info-grid">

        <div className="panel location-card">

          <span className="panel-label">
            MONITORING LOCATION
          </span>

          <h2>
            {locationName}
          </h2>

          <p>
            RoadSense observation zone
            in Tiruchirappalli.
          </p>

        </div>


        <div className="panel location-card">

          <span className="panel-label">
            REFERENCE POINT
          </span>

          <h2>
            {MAP_LAT.toFixed(6)},
            {" "}
            {MAP_LNG.toFixed(6)}
          </h2>

          <p>
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
  onEvidence,
  getEvidenceURL,
  getViolationName,
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
            Complete detected event records
            and evidence.
          </p>

        </div>


        <button
          className="export-btn large"
          onClick={exportCSV}
        >
          Export CSV
        </button>

      </header>


      <section className="panel">

        <div className="violation-toolbar">

          <div className="record-count">
            {violations.length}
            {" "}
            records
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search violation, plate, time or location..."
            className="search-input"
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
            full
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

                  <span
                    className={
                      `violation-tag ${
                        String(
                          item.Violation
                        ).toLowerCase()
                      }`
                    }
                  >
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
   COMPONENTS
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
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
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
              `${percentage}%`,
          }}
        />

      </div>

      <small>
        {percentage}% of events
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


function DonutChart({
  helmetless,
  triple,
  wrongWay,
  mobile,
  total,
}) {
  const radius = 58;
  const circumference =
    2 *
    Math.PI *
    radius;

  const values = [
    helmetless,
    triple,
    wrongWay,
    mobile,
  ];

  const percentages =
    values.map(
      (value) =>
        total
          ? value / total
          : 0
    );

  let offset = 0;

  const circles =
    percentages.map(
      (pct, index) => {

        const length =
          pct *
          circumference;

        const currentOffset =
          -offset;

        offset += length;

        return {
          length,
          offset:
            currentOffset,
          index,
        };
      }
    );

  return (
    <div className="donut">

      <svg
        width="190"
        height="190"
        viewBox="0 0 190 190"
      >

        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke="#152b42"
          strokeWidth="18"
        />

        {circles.map(
          (circle) => (
            circle.length > 0 && (
              <circle
                key={circle.index}
                cx="95"
                cy="95"
                r={radius}
                fill="none"
                stroke={
                  [
                    "#2188ff",
                    "#42a5ff",
                    "#68c2ff",
                    "#94d7ff",
                  ][
                    circle.index
                  ]
                }
                strokeWidth="18"
                strokeDasharray={
                  `${circle.length} ${circumference}`
                }
                strokeDashoffset={
                  circle.offset
                }
                strokeLinecap="round"
                transform="rotate(-90 95 95)"
              />
            )
          )
        )}

      </svg>


      <div className="donut-center">

        <strong>
          {total}
        </strong>

        <span>
          EVENTS
        </span>

      </div>

    </div>
  );
}


function LegendItem({
  label,
  value,
  percentage,
}) {
  return (
    <div className="legend-item">

      <div>
        <span
          className="legend-dot"
        />

        <span>
          {label}
        </span>
      </div>

      <strong>
        {value}
        <small>
          {" "}
          ({percentage}%)
        </small>
      </strong>

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
        onClick={(e) =>
          e.stopPropagation()
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
            className="evidence-image"
            src={evidence.url}
            alt="RoadSense evidence"
          />
        ) : (
          <div className="empty">
            Evidence image unavailable.
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
    ui-sans-serif,
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
      rgba(24, 113, 214, 0.14),
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
  align-items: center;
  gap: 12px;
  padding: 0 8px 29px;
}

.brand-mark {
  width: 41px;
  height: 41px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(
    135deg,
    #1982ff,
    #0b5ed7
  );
  color: #fff;
  font-weight: 800;
  font-size: 19px;
  box-shadow:
    0 10px 28px
    rgba(23, 121, 255, 0.25);
}

.brand strong {
  display: block;
  font-size: 17px;
  color: #f4f8fd;
}

.brand span {
  display: block;
  margin-top: 3px;
  color: #687d94;
  font-size: 10px;
}

.nav-title {
  color: #536a83;
  padding: 0 10px 10px;
  font-size: 9px;
  letter-spacing: 1.6px;
  font-weight: 800;
}

.main-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  color: #7f95ab;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 13px;
  border-radius: 10px;
  font-size: 12px;
  transition: 0.2s ease;
}

.nav-link span {
  width: 18px;
  text-align: center;
  color: #579fff;
}

.nav-link:hover {
  color: #fff;
  background: #0d2136;
}

.nav-link.active {
  color: #fff;
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.eyebrow {
  color: #52708f;
  font-size: 9px;
  letter-spacing: 1.7px;
  font-weight: 800;
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
  color: #88dcb9;
  background: #0b1d2a;
  border: 1px solid #194337;
  border-radius: 30px;
  padding: 9px 13px;
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
      rgba(28, 126, 233, 0.18),
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
  background: #0a1a2c;
  border-radius: 14px;
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
  color: #f4f9ff;
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
  border: 1px solid #172e46;
  border-radius: 15px;
  background: #0a1929;
  overflow: hidden;
}

.stat-card:after {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  right: -55px;
  bottom: -65px;
  border-radius: 50%;
  background: rgba(30, 126, 230, 0.08);
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #102b47;
  color: #63afff;
  margin-bottom: 14px;
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
  letter-spacing: -0.8px;
}

.stat-card small {
  color: #536a82;
  font-size: 9px;
}

/* PANELS */

.panel {
  margin-bottom: 17px;
  padding: 20px;
  border: 1px solid #172e46;
  border-radius: 16px;
  background: rgba(9, 25, 41, 0.94);
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
  margin-bottom: 0;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 16px;
}

.panel-label {
  color: #56728f;
  font-size: 8px;
  letter-spacing: 1.3px;
  font-weight: 800;
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
  border: 1px solid #194877;
  background: #0e2a46;
  color: #70b6ff;
  border-radius: 20px;
  padding: 6px 9px;
  font-size: 8px;
  font-weight: 800;
}

/* VIDEO */

.video-panel {
  padding-bottom: 13px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 340px;
  overflow: hidden;
  border-radius: 13px;
  background: #02070e;
  border: 1px solid #172e46;
}

.main-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #02070e;
}

.video-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  place-items: center;
  background: rgba(2, 8, 14, 0.35);
}

.video-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #9ab0c8;
  font-size: 10px;
  background: rgba(3, 11, 19, 0.72);
  padding: 17px 20px;
  border-radius: 12px;
  border: 1px solid #1a344d;
}

.loader-circle {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border:
    2px solid #24425e;
  border-top-color: #55aaff;
  animation:
    spin 0.8s linear infinite;
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
  padding: 25px;
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
}

.video-error strong {
  color: #eaf1f8;
  font-size: 13px;
}

.video-error span {
  max-width: 390px;
  color: #778da4;
  font-size: 10px;
  line-height: 1.6;
}

.video-error b {
  color: #8fb3d6;
  margin-left: 4px;
}

.open-video-btn {
  margin-top: 8px;
  padding: 8px 12px;
  color: #fff;
  background: #106edb;
  border-radius: 8px;
  font-size: 10px;
}

.play-overlay {
  position: absolute;
  left: 19px;
  bottom: 45px;
  width: 42px;
  height: 42px;
  border: 1px solid #2b608f;
  border-radius: 50%;
  background: rgba(8, 26, 43, 0.9);
  color: #eaf5ff;
  z-index: 4;
}

.video-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* INTELLIGENCE */

.intel-list {
  padding-top: 5px;
}

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

.mini-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 8px;
}

.mini-summary div {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #172e46;
  background: #0a1d30;
}

.mini-summary span {
  display: block;
  color: #526a83;
  font-size: 8px;
  letter-spacing: 1px;
}

.mini-summary strong {
  display: block;
  margin-top: 5px;
  color: #dce8f3;
  font-size: 14px;
}

/* HOURLY CHART */

.hour-chart {
  height: 215px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 52px;
  padding: 18px 18px 0;
  border-bottom: 1px solid #172e46;
}

.hour-column {
  height: 100%;
  width: 48px;
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

.map-preview-panel {
  overflow: hidden;
}

.mini-map {
  height: 215px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #17304a;
  background: #0b1827;
}

.mini-map iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.location-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.location-pin {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #65b1ff;
  background: #0d2b47;
}

.location-footer strong {
  display: block;
  color: #dce8f3;
  font-size: 10px;
}

.location-footer span {
  display: block;
  color: #587087;
  font-size: 8px;
  margin-top: 3px;
}

/* SYSTEM */

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
  border-radius: 10px;
  border: 1px solid #172e46;
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
  min-width: 900px;
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
  color: #7bbaff;
  background: #102c48;
  font-size: 8px;
  font-weight: 800;
  white-space: nowrap;
}

.evidence-btn {
  padding: 6px 9px;
  border: 1px solid #205183;
  border-radius: 6px;
  background: #0d2944;
  color: #76b9ff;
  font-size: 8px;
}

.evidence-btn:hover,
.export-btn:hover {
  background: #123a60;
}

.export-btn {
  padding: 8px 11px;
  border: 1px solid #215082;
  border-radius: 7px;
  background: #0d2a46;
  color: #78b9ff;
  font-size: 9px;
}

.export-btn.large {
  padding: 9px 13px;
}

.recent-panel {
  margin-top: 17px;
}

/* ANALYTICS */

.analytics-layout {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 17px;
}

.analytics-donut-card {
  min-height: 390px;
}

.donut-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 270px;
}

.donut {
  position: relative;
  width: 190px;
  height: 190px;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.donut-center strong {
  color: #edf5fc;
  font-size: 27px;
}

.donut-center span {
  color: #5e7590;
  font-size: 8px;
  letter-spacing: 1.1px;
}

.legend {
  flex: 1;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #162c43;
  font-size: 10px;
}

.legend-item > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3a9aff;
}

.legend-item strong {
  color: #eff6fc;
}

.legend-item small {
  color: #5b728a;
  font-weight: 400;
}

.large-hour-chart {
  height: 290px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 60px;
  padding: 20px;
  border-bottom: 1px solid #172e46;
}

.large-hour-column {
  height: 100%;
  width: 52px;
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

.analytics-summary {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 10px;
}

.summary-box {
  padding: 16px;
  border-radius: 11px;
  border: 1px solid #172e46;
  background: #0a1b2c;
}

.summary-box span {
  display: block;
  color: #587089;
  font-size: 8px;
  letter-spacing: 1px;
}

.summary-box strong {
  display: block;
  color: #eef6fc;
  margin-top: 7px;
  font-size: 22px;
}

/* MAP PAGE */

.map-page-card {
  height: 64vh;
  min-height: 510px;
  overflow: hidden;
  border: 1px solid #172e46;
  border-radius: 17px;
  background: #0a1725;
  margin-bottom: 17px;
}

.full-map {
  width: 100%;
  height: 100%;
  border: 0;
}

.map-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
}

.location-card h2 {
  margin: 7px 0;
  color: #eaf2fa;
  font-size: 18px;
}

.location-card p {
  margin: 0;
  color: #657b92;
  font-size: 10px;
}

/* VIOLATIONS */

.violation-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 17px;
}

.record-count {
  color: #8196aa;
  font-size: 10px;
}

.search-input {
  width: 310px;
  max-width: 100%;
  padding: 9px 11px;
  border: 1px solid #1b344e;
  border-radius: 8px;
  outline: none;
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
  align-items: flex-start;
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
  border-radius: 9px;
  background: #0d2033;
  border: 1px solid #172e46;
}

.evidence-details span {
  display: block;
  color: #58708a;
  font-size: 8px;
}

.evidence-details strong {
  display: block;
  color: #dce7f1;
  margin-top: 5px;
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
  color: #257fe4;
  margin: 0 5px;
}

/* RESPONSIVE */

@media (max-width: 1180px) {

  .sidebar {
    width: 215px;
  }

  .rs-main {
    margin-left: 215px;
    width: calc(100% - 215px);
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
    margin-left: 0;
    width: 100%;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .video-wrapper {
    min-height: 245px;
  }

  .health-grid {
    grid-template-columns: 1fr;
  }

  .map-info-grid,
  .analytics-summary {
    grid-template-columns: 1fr;
  }

  .donut-layout {
    flex-direction: column;
  }

  .violation-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

}
`;
