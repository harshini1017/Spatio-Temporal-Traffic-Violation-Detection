const styles = {
  app: {
    minHeight: "100vh",
    background: "#F7F9FC",
    color: "#263247",
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
    background: "#FFFFFF",
    borderRight: "1px solid #E8ECF3",
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
    background: "#E2ECFA",
    border: "1px solid #D3E2F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    color: "#486B91",
    letterSpacing: "0.04em",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#263247",
  },

  brandStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "5px",
    fontSize: "9px",
    color: "#5B9B78",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  aiDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#78B89A",
    display: "inline-block",
  },

  navLabel: {
    fontSize: "9px",
    color: "#98A2B3",
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
    color: "#667085",
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
    background: "#EAF2FC",
    border: "1px solid #D7E5F5",
    color: "#3F6288",
  },

  navIcon: {
    width: "23px",
    textAlign: "center",
    fontSize: "14px",
    color: "#8A96A8",
  },

  navIconActive: {
    color: "#55799F",
  },

  sidebarBottom: {
    marginTop: "30px",
  },

  edgeBox: {
    padding: "14px",
    borderRadius: "12px",
    background: "#F5F8FC",
    border: "1px solid #E5EAF1",
  },

  edgeTitle: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#344054",
    marginBottom: "12px",
  },

  edgeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "9px",
    fontSize: "10px",
    color: "#7A8698",
  },

  online: {
    color: "#5B9B78",
    fontWeight: 700,
  },

  version: {
    textAlign: "center",
    marginTop: "14px",
    fontSize: "9px",
    color: "#A1A9B6",
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
    color: "#98A2B3",
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
    color: "#263247",
  },

  pageSubtitle: {
    margin: "8px 0 0",
    color: "#7A8698",
    fontSize: "12px",
  },

  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "9px",
    color: "#5B9B78",
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
    background: "#EEF4FB",
    border: "1px solid #DCE7F3",
  },

  aiEngineTitle: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#344A63",
  },

  aiEngineText: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#738297",
  },

  aiEngineStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "9px",
    color: "#5B9B78",
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
    background: "#FFFFFF",
    border: "1px solid #E7EBF1",
    borderRadius: "13px",
    boxShadow: "0 3px 12px rgba(42, 58, 80, 0.04)",
  },

  kpiTop: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  kpiIndicator: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#91ABC7",
  },

  kpiLabel: {
    color: "#7A8698",
    fontSize: "10px",
    fontWeight: 700,
  },

  kpiValue: {
    marginTop: "13px",
    fontSize: "25px",
    fontWeight: 800,
    color: "#263247",
  },

  kpiSubtitle: {
    marginTop: "5px",
    fontSize: "9px",
    color: "#9AA4B2",
  },

  videoCard: {
    padding: "18px",
    background: "#FFFFFF",
    border: "1px solid #E7EBF1",
    borderRadius: "13px",
    marginBottom: "18px",
    boxShadow: "0 3px 12px rgba(42, 58, 80, 0.04)",
  },

  video: {
    width: "100%",
    maxHeight: "520px",
    display: "block",
    borderRadius: "10px",
    background: "#EEF2F7",
    marginTop: "15px",
  },

  aiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "7px",
    background: "#E6F3EC",
    color: "#5B8E72",
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
    background: "#FFFFFF",
    border: "1px solid #E7EBF1",
    borderRadius: "13px",
    padding: "18px",
    marginBottom: "18px",
    boxShadow: "0 3px 12px rgba(42, 58, 80, 0.04)",
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
    color: "#344054",
  },

  sectionSubtitle: {
    marginTop: "5px",
    color: "#8994A5",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  chart: {
    marginTop: "22px",
  },

  chartRow: {
    display: "grid",
    gridTemplateColumns:
      "105px 1fr 30px",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },

  chartLabel: {
    fontSize: "10px",
    color: "#7A8698",
  },

  chartTrack: {
    height: "7px",
    borderRadius: "10px",
    background: "#EEF1F5",
    overflow: "hidden",
  },

  chartBar: {
    height: "100%",
    borderRadius: "10px",
    background: "#A8BED8",
  },

  chartValue: {
    textAlign: "right",
    fontSize: "10px",
    fontWeight: 700,
    color: "#4F5D70",
  },

  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom:
      "1px solid #EEF1F5",
    fontSize: "10px",
    color: "#7A8698",
  },

  statusValue: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#5B9B78",
    fontWeight: 700,
    fontSize: "9px",
  },

  pipelineItem: {
    display: "flex",
    gap: "12px",
    padding: "13px 0",
    borderBottom:
      "1px solid #EEF1F5",
  },

  pipelineNumber: {
    width: "27px",
    height: "27px",
    borderRadius: "7px",
    background: "#ECE8F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 800,
    color: "#766A91",
    flexShrink: 0,
  },

  pipelineTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#344054",
  },

  pipelineText: {
    marginTop: "3px",
    fontSize: "9px",
    color: "#7A8698",
  },

  featureList: {
    marginTop: "20px",
  },

  feature: {
    display: "flex",
    gap: "11px",
    padding: "13px 0",
    borderBottom:
      "1px solid #EEF1F5",
  },

  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#A8BED8",
    marginTop: "4px",
    flexShrink: 0,
  },

  featureTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#344054",
  },

  featureText: {
    marginTop: "4px",
    fontSize: "9px",
    color: "#7A8698",
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
    border: "1px solid #E3EAF1",
    background: "#F3F7FB",
    color: "#718096",
    fontSize: "10px",
    fontWeight: 700,
  },

  parkingOccupied: {
    background: "#FFF2E8",
    color: "#B7794A",
    border:
      "1px solid #F5DCC9",
  },

  parkingLegend: {
    display: "flex",
    gap: "18px",
    marginTop: "18px",
    fontSize: "9px",
    color: "#7A8698",
  },

  legendDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#9DB4CB",
    marginRight: "5px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "16px",
    marginBottom: "15px",
    padding: "10px 12px",
    borderRadius: "8px",
    border:
      "1px solid #E1E6ED",
    background: "#FAFBFD",
    color: "#344054",
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
    color: "#8A95A5",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom:
      "1px solid #E8ECF2",
  },

  td: {
    padding: "12px 10px",
    fontSize: "10px",
    color: "#667085",
    borderBottom:
      "1px solid #F0F2F5",
  },

  eventBadge: {
    display: "inline-block",
    padding: "5px 7px",
    borderRadius: "5px",
    background: "#EEF3F8",
    color: "#5F7185",
    fontSize: "9px",
  },

  evidenceButton: {
    border:
      "1px solid #DDE4EC",
    background: "#F5F8FB",
    color: "#58708A",
    padding: "5px 9px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "9px",
  },

  exportButton: {
    border:
      "1px solid #DDE4EC",
    background: "#EEF4FA",
    color: "#58708A",
    padding: "7px 10px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: 700,
  },

  emptyCell: {
    textAlign: "center",
    padding: "30px",
    color: "#98A2B3",
    fontSize: "10px",
  },

  footer: {
    padding: "25px 0 10px",
    textAlign: "center",
    color: "#A1A9B6",
    fontSize: "9px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(38,50,71,0.25)",
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
    background: "#FFFFFF",
    border:
      "1px solid #E1E6ED",
    borderRadius: "14px",
    padding: "18px",
    boxShadow:
      "0 15px 45px rgba(42,58,80,0.15)",
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
    color: "#7A8698",
    fontSize: "25px",
    cursor: "pointer",
  },

  evidenceImage: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    background: "#F4F6F9",
    borderRadius: "9px",
  },

  noEvidence: {
    padding: "50px",
    textAlign: "center",
    color: "#8994A5",
    fontSize: "11px",
  },
};
