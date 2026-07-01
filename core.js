/*
core.js - camada futura de estado.
No momento apenas expõe informações sem modificar localStorage.
*/
window.RFCore = window.RFCore || {
  getVersion() { return "V22 Professional Architecture"; },
  isLegacyPreserved() { return true; }
};
