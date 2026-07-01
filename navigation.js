/*
navigation.js - camada segura de navegação.
Reforça botões sem substituir o núcleo.
*/
window.RFNavigation = window.RFNavigation || {
  rebind() {
    document.querySelectorAll("[data-page]").forEach((btn) => {
      if (btn.dataset.rfv22Nav) return;
      btn.dataset.rfv22Nav = "1";
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const page = btn.dataset.page;
        if (typeof window.setPage === "function") {
          window.setPage(page);
        } else {
          document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
          const target = document.getElementById(page);
          if (target) target.classList.add("active");
        }
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => setTimeout(() => window.RFNavigation.rebind(), 250));
