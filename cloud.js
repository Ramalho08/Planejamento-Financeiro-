/*
cloud.js - camada futura de Firebase/Cloud AI.
Não carrega Firebase automaticamente para não quebrar GitHub Pages.
*/
window.RFCloud = window.RFCloud || {
  enabled: false,
  reason: "Firebase isolado até configuração real.",
  checkConfig() {
    const cfg = window.RF_FIREBASE_CONFIG || {};
    return Boolean(cfg.apiKey && !String(cfg.apiKey).includes("COLE_AQUI"));
  }
};
