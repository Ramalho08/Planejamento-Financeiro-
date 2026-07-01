/*
reports.js - relatórios modulares.
*/
window.RFReports = window.RFReports || {
  exportState() {
    try {
      return JSON.stringify(window.state || {}, null, 2);
    } catch {
      return "{}";
    }
  }
};
