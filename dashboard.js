/*
dashboard.js - reservado para dashboard modular.
*/
window.RFDashboard = window.RFDashboard || {
  refresh() {
    if (typeof window.render === "function") {
      try { window.render(); } catch (err) { console.warn("Dashboard refresh ignorado", err); }
    }
  }
};
