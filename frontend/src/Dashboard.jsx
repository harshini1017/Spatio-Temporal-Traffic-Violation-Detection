import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Modal,
  Avatar,
  TextField,
  Chip,
  Divider
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/violations")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, []);

  // ================= SUMMARY =================

  const summary = {
    helmetless: logs.filter(
      (l) => l.Violation === "helmetless"
    ).length,

    triple_riding: logs.filter(
      (l) => l.Violation === "triple_riding"
    ).length,

    wrong_way: logs.filter(
      (l) => l.Violation === "wrong_way"
    ).length,

    mobile_usage: logs.filter(
      (l) => l.Violation === "mobile_usage"
    ).length
  };

  const chartData = Object.entries(summary).map(([key, value]) => ({
    name: key.replace("_", " "),
    value
  }));

  const mostViolation =
    chartData.sort((a, b) => b.value - a.value)[0]?.name || "None";

  const totalViolations = Object.values(summary).reduce(
    (a, b) => a + b,
    0
  );

  // ================= STYLES =================

  const cardStyle = {
    borderRadius: 3,
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
    background: "#ffffff"
  };

  const statCards = [
    {
      key: "helmetless",
      title: "Helmetless Riding",
      value: summary.helmetless,
      icon: "🪖",
      description: "Helmet violations"
    },
    {
      key: "triple_riding",
      title: "Triple Riding",
      value: summary.triple_riding,
      icon: "🏍️",
      description: "Excess rider count"
    },
    {
      key: "wrong_way",
      title: "Wrong Way",
      value: summary.wrong_way,
      icon: "↔️",
      description: "Direction violations"
    },
    {
      key: "mobile_usage",
      title: "Mobile Usage",
      value: summary.mobile_usage,
      icon: "📱",
      description: "Phone usage while riding"
    }
  ];

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "▦"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "◩"
    },
    {
      id: "location map",
      label: "Location Map",
      icon: "⌖"
    },
    {
      id: "challan",
      label: "Challan",
      icon: "▤"
    }
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        color: "#0f172a"
      }}
    >
      {/* ================= SIDEBAR ================= */}

      <Box
        sx={{
          width: 245,
          minHeight: "100vh",
          bgcolor: "#0f172a",
          color: "white",
          p: 2.5,
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        {/* LOGO */}

        <Box sx={{ px: 1, mb: 4 }}>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.5
            }}
          >
            RoadSense
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#94a3b8",
              mt: 0.5
            }}
          >
            Edge-AI Mobility Intelligence
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: "#334155",
            mb: 3
          }}
        />

        {/* NAVIGATION */}

        <Typography
          sx={{
            fontSize: 11,
            color: "#64748b",
            fontWeight: 700,
            letterSpacing: 1,
            px: 1,
            mb: 1.5
          }}
        >
          MAIN MENU
        </Typography>

        {navItems.map((item) => {
          const active = page === item.id;

          return (
            <Button
              key={item.id}
              fullWidth
              onClick={() => setPage(item.id)}
              sx={{
                justifyContent: "flex-start",
                gap: 1.5,
                mb: 1,
                px: 1.5,
                py: 1.4,
                borderRadius: 2,
                color: active ? "white" : "#94a3b8",
                bgcolor: active
                  ? "#2563eb"
                  : "transparent",
                fontWeight: active ? 700 : 500,
                textTransform: "none",
                "&:hover": {
                  bgcolor: active
                    ? "#2563eb"
                    : "#1e293b"
                }
              }}
            >
              <Box
                sx={{
                  width: 24,
                  textAlign: "center",
                  fontSize: 17
                }}
              >
                {item.icon}
              </Box>

              {item.label}
            </Button>
          );
        })}

        {/* SYSTEM STATUS */}

        <Box
          sx={{
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,
            p: 2,
            borderRadius: 2,
            bgcolor: "#1e293b",
            border: "1px solid #334155"
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: "#94a3b8",
              mb: 1
            }}
          >
            SYSTEM STATUS
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#22c55e"
              }}
            />

            <Typography sx={{ fontSize: 13 }}>
              Monitoring Active
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ================= MAIN AREA ================= */}

      <Box
        sx={{
          flex: 1,
          marginLeft: "245px",
          minWidth: 0
        }}
      >
        {/* ================= HEADER ================= */}

        <Box
          sx={{
            height: 78,
            bgcolor: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 4,
            position: "sticky",
            top: 0,
            zIndex: 10
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 700
              }}
            >
              {page === "dashboard"
                ? "Dashboard Overview"
                : page === "analytics"
                ? "Traffic Analytics"
                : page === "location map"
                ? "Violation Location"
                : "Traffic Challans"}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "#64748b",
                mt: 0.3
              }}
            >
              RoadSense AI Mobility Intelligence Platform
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <TextField
              size="small"
              placeholder="Search..."
              sx={{
                width: 190,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2
                }
              }}
            />

            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "#2563eb",
                fontSize: 14,
                fontWeight: 700
              }}
            >
              RS
            </Avatar>
          </Box>
        </Box>

        {/* ================= CONTENT ================= */}

        <Box
          sx={{
            p: { xs: 2, md: 4 },
            maxWidth: 1500,
            margin: "0 auto"
          }}
        >
          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          {page === "dashboard" && (
            <>
              {/* TITLE */}

              <Box sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 30 },
                    fontWeight: 800,
                    letterSpacing: -0.5
                  }}
                >
                  Traffic Violation Detection
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.8,
                    fontSize: 14
                  }}
                >
                  Real-time Edge-AI monitoring and
                  spatio-temporal traffic analysis
                </Typography>
              </Box>

              {/* ================= KPI CARDS ================= */}

              <Grid
                container
                spacing={2.5}
                sx={{ mb: 3 }}
              >
                {statCards.map((item) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                    key={item.key}
                  >
                    <Card
                      sx={{
                        ...cardStyle,
                        p: 2.5,
                        height: "100%"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start"
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "#64748b",
                              fontWeight: 600
                            }}
                          >
                            {item.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 30,
                              fontWeight: 800,
                              mt: 1
                            }}
                          >
                            {item.value}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20
                          }}
                        >
                          {item.icon}
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#94a3b8",
                          mt: 1
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* ================= TOTAL + ALERT ================= */}

              <Grid
                container
                spacing={2.5}
                sx={{ mb: 3 }}
              >
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      ...cardStyle,
                      p: 3,
                      height: "100%"
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      TOTAL DETECTED VIOLATIONS
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 40,
                        fontWeight: 800,
                        mt: 1,
                        color: "#0f172a"
                      }}
                    >
                      {totalViolations}
                    </Typography>

                    <Chip
                      label="Edge-AI Detection"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: "#eff6ff",
                        color: "#2563eb",
                        fontWeight: 600
                      }}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      bgcolor: "#fff7ed",
                      border: "1px solid #fed7aa",
                      boxShadow: "none"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#9a3412",
                            fontWeight: 700
                          }}
                        >
                          TRAFFIC ALERT
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 20,
                            fontWeight: 700,
                            mt: 0.8
                          }}
                        >
                          High Violation Activity
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#7c2d12",
                            mt: 0.5
                          }}
                        >
                          Most frequently detected:
                          <strong> {mostViolation}</strong>
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "#ffedd5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 23
                        }}
                      >
                        !
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* ================= VIDEO ================= */}

              <Card
                sx={{
                  ...cardStyle,
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 700
                      }}
                    >
                      Processed Output Video
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#64748b",
                        mt: 0.4
                      }}
                    >
                      AI-processed traffic monitoring feed
                    </Typography>
                  </Box>

                  <Chip
                    label="LIVE PROCESSING"
                    size="small"
                    sx={{
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                      fontWeight: 700
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    bgcolor: "#0f172a",
                    p: 2.5
                  }}
                >
                  <video
                    src="http://127.0.0.1:5000/videos/helmetless_fixed.mp4"
                    controls
                    style={{
                      width: "100%",
                      maxHeight: 430,
                      display: "block",
                      borderRadius: 10
                    }}
                  />
                </Box>
              </Card>
            </>
          )}

          {/* ================================================= */}
          {/* ANALYTICS */}
          {/* ================================================= */}

          {page === "analytics" && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800
                  }}
                >
                  Violation Analytics
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 14,
                    mt: 0.5
                  }}
                >
                  Overview of detected traffic violations
                </Typography>
              </Box>

              <Grid
                container
                spacing={2.5}
              >
                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      ...cardStyle,
                      p: 3
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 700,
                        mb: 3
                      }}
                    >
                      Violation Distribution
                    </Typography>

                    <ResponsiveContainer
                      width="100%"
                      height={350}
                    >
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                        />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 12
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 12
                          }}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{
                            r: 5
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      ...cardStyle,
                      p: 3,
                      height: "100%"
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600
                      }}
                    >
                      MOST FREQUENT VIOLATION
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 27,
                        fontWeight: 800,
                        mt: 2,
                        textTransform: "capitalize"
                      }}
                    >
                      {mostViolation}
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#64748b"
                      }}
                    >
                      Total detected events
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 30,
                        fontWeight: 800,
                        mt: 0.5
                      }}
                    >
                      {totalViolations}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* ================================================= */}
          {/* LOCATION MAP */}
          {/* ================================================= */}

          {page === "location map" && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800
                  }}
                >
                  Violation Location
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 14,
                    mt: 0.5
                  }}
                >
                  Monitoring zone and detected traffic activity
                </Typography>
              </Box>

              <Card
                sx={{
                  ...cardStyle,
                  overflow: "hidden"
                }}
              >
                <Box sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 700
                    }}
                  >
                    Saranathan College Road
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#64748b",
                      mt: 0.5
                    }}
                  >
                    Violation monitoring zone
                  </Typography>
                </Box>

                <iframe
                  title="Saranathan College Road Violation Zone Map"
                  width="100%"
                  height="500"
                  style={{
                    border: 0,
                    display: "block"
                  }}
                  src="https://www.google.com/maps?q=Saranathan+College+Road+Trichy&output=embed"
                />
              </Card>
            </>
          )}

          {/* ================================================= */}
          {/* CHALLAN */}
          {/* ================================================= */}

          {page === "challan" && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800
                  }}
                >
                  Traffic Challans
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 14,
                    mt: 0.5
                  }}
                >
                  Detected violations and supporting evidence
                </Typography>
              </Box>

              {logs.length === 0 ? (
                <Card
                  sx={{
                    ...cardStyle,
                    p: 5,
                    textAlign: "center"
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 600
                    }}
                  >
                    No violations detected
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      mt: 1
                    }}
                  >
                    Detected events will appear here.
                  </Typography>
                </Card>
              ) : (
                logs.map((row, index) => (
                  <Card
                    key={index}
                    sx={{
                      ...cardStyle,
                      p: 2.5,
                      mb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 700,
                          textTransform: "capitalize"
                        }}
                      >
                        {row.Violation}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#64748b",
                          mt: 0.5
                        }}
                      >
                        {row.Time}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => setSelected(row)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: "#2563eb",
                        "&:hover": {
                          bgcolor: "#1d4ed8"
                        }
                      }}
                    >
                      Open Challan
                    </Button>
                  </Card>
                ))
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ================================================= */}
      {/* CHALLAN MODAL */}
      {/* ================================================= */}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              sm: 500
            },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "white",
            p: 4,
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
          }}
        >
          {selected && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 800
                    }}
                  >
                    Traffic Challan
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 13,
                      mt: 0.5
                    }}
                  >
                    RoadSense AI Evidence Record
                  </Typography>
                </Box>

                <Chip
                  label="DETECTED"
                  size="small"
                  sx={{
                    bgcolor: "#fee2e2",
                    color: "#b91c1c",
                    fontWeight: 700
                  }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 600
                  }}
                >
                  VIOLATION
                </Typography>

                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    mt: 0.5
                  }}
                >
                  {selected.Violation}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 600
                  }}
                >
                  DATE & TIME
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    mt: 0.5
                  }}
                >
                  {selected.Time}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 600
                  }}
                >
                  LOCATION
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    mt: 0.5
                  }}
                >
                  Saranathan Road
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 600,
                  mb: 1
                }}
              >
                EVIDENCE SNAPSHOT
              </Typography>

              <img
                src={`http://127.0.0.1:5000/snapshots/${selected.Snapshot?.split("/").pop()}`}
                width="100%"
                alt="Traffic violation evidence"
                style={{
                  borderRadius: 10,
                  display: "block"
                }}
              />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelected(null)}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
