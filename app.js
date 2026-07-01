/*
Ramalho Finance V22 Professional Architecture
Bootstrap modular seguro.

Estratégia:
1. Carrega o núcleo funcional da V21.5.2 como legacy-core.js.
2. Carrega módulos isolados depois do núcleo.
3. Se algum módulo falhar, o app principal continua funcionando.
*/

(function () {
  "use strict";

  const VERSION = "22proarch";
  const MODULES = [
    "utils.js",
    "core.js",
    "navigation.js",
    "dashboard.js",
    "transactions.js",
    "wallets.js",
    "goals.js",
    "investments.js",
    "reports.js",
    "ai.js",
    "cloud.js",
    "settings.js"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src + "?v=" + VERSION;
      s.defer = false;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Falha ao carregar " + src));
      document.head.appendChild(s);
    });
  }

  function showArchitectureStatus() {
    try {
      const el = document.getElementById("architectureStatus");
      if (!el) return;
      el.innerHTML = `
        <div class="stable-kpi">
          <div class="alert"><b>Arquitetura</b><p>V22</p></div>
          <div class="alert"><b>Núcleo</b><p>Preservado</p></div>
          <div class="alert"><b>Módulos</b><p>${MODULES.length}</p></div>
          <div class="alert"><b>Status</b><p>OK</p></div>
        </div>
        <div class="alert">
          <span class="stable-pill">legacy-core.js</span>
          <span class="stable-pill">navigation.js</span>
          <span class="stable-pill">ai.js</span>
          <span class="stable-pill">cloud.js</span>
        </div>
      `;
    } catch (err) {
      console.warn("Architecture status error", err);
    }
  }

  async function start() {
    try {
      await loadScript("./js/legacy-core.js");
      for (const moduleName of MODULES) {
        try {
          await loadScript("./js/" + moduleName);
        } catch (moduleError) {
          console.warn("Módulo isolado falhou:", moduleName, moduleError);
        }
      }
      window.RF_V22_READY = true;
      showArchitectureStatus();
      if (typeof window.RFNavigation?.rebind === "function") {
        window.RFNavigation.rebind();
      }
    } catch (err) {
      console.error("Erro crítico ao iniciar V22:", err);
      alert("Erro ao iniciar o Ramalho Finance V22: " + err.message);
    }
  }

  start();
})();
