/*
utils.js - utilidades futuras.
Não altera o núcleo legado.
*/
window.RFUtils = window.RFUtils || {
  version: "22proarch",
  safeRun(name, fn) {
    try { return fn(); } catch (err) { console.warn("RFUtils.safeRun:", name, err); return null; }
  },
  money(value) {
    try { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
    catch { return "R$ 0,00"; }
  }
};
