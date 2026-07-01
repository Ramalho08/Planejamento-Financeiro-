import { $ } from "./utils.js";

const ROUTES = [
  "dashboard",
  "transactions",
  "wallets",
  "goals",
  "reports",
  "ai",
  "cloud",
  "architecture",
  "settings"
];

const RouteState = {
  current: "dashboard",
  initialized: false,
  lastGoodRoute: "dashboard"
};

function normalizeRoute(route) {
  const clean = String(route || "").replace("#", "").trim();
  return ROUTES.includes(clean) ? clean : "dashboard";
}

function getRouteFromHash() {
  return normalizeRoute(location.hash ? location.hash.slice(1) : "");
}

function allRouteButtons() {
  return Array.from(document.querySelectorAll("[data-route], [data-page]"));
}

function allPages() {
  return Array.from(document.querySelectorAll(".page"));
}

function showNavError(message) {
  console.warn("[RF Navigation]", message);
  let box = document.getElementById("navErrorBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "navErrorBox";
    box.className = "nav-error";
    document.body.appendChild(box);
  }
  box.textContent = message;
  clearTimeout(showNavError.timer);
  showNavError.timer = setTimeout(() => box.remove(), 4200);
}

function validateRoutes() {
  const missing = ROUTES.filter((route) => !document.getElementById(route));
  if (missing.length) {
    showNavError("Rotas ausentes: " + missing.join(", "));
    return false;
  }
  return true;
}

export function openDrawer() {
  const drawer = $("drawer");
  const backdrop = $("drawerBackdrop");
  if (drawer) {
    drawer.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
  }
  if (backdrop) backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closeDrawer() {
  const drawer = $("drawer");
  const backdrop = $("drawerBackdrop");
  if (drawer) {
    drawer.classList.add("hidden");
    drawer.setAttribute("aria-hidden", "true");
  }
  if (backdrop) backdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateButtons(route) {
  allRouteButtons().forEach((btn) => {
    const target = btn.dataset.route || btn.dataset.page;
    const active = target === route;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
}

function activatePage(route) {
  let found = false;
  allPages().forEach((page) => {
    const active = page.id === route;
    page.classList.toggle("active", active);
    page.hidden = !active;
    if (active) found = true;
  });
  return found;
}

export function setPage(route, options = {}) {
  const targetRoute = normalizeRoute(route);

  try {
    const found = activatePage(targetRoute);
    if (!found) {
      throw new Error("Página não encontrada: " + targetRoute);
    }

    RouteState.current = targetRoute;
    RouteState.lastGoodRoute = targetRoute;
    document.body.dataset.route = targetRoute;
    updateButtons(targetRoute);
    closeDrawer();

    try {
      localStorage.setItem("rf_last_route", targetRoute);
    } catch {}

    if (!options.skipHash) {
      const nextHash = "#" + targetRoute;
      if (location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
    }

    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.dispatchEvent(new CustomEvent("rf:route", { detail: { route: targetRoute } }));
  } catch (err) {
    showNavError("Erro ao abrir página. Voltando para início.");
    console.error(err);
    activatePage(RouteState.lastGoodRoute || "dashboard");
    updateButtons(RouteState.lastGoodRoute || "dashboard");
  }
}

function bindRouteDelegation() {
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-route], [data-page]");
    if (!btn) return;

    const route = btn.dataset.route || btn.dataset.page;
    if (!route) return;

    ev.preventDefault();
    setPage(route);
  }, true);
}

function bindDrawer() {
  $("menuBtn")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    openDrawer();
  });

  $("closeDrawerBtn")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    closeDrawer();
  });

  $("drawerBackdrop")?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeDrawer();
  });

  const drawer = $("drawer");
  if (drawer) {
    drawer.addEventListener("touchmove", (ev) => ev.stopPropagation(), { passive: true });
  }
}

function startRoute() {
  let route = getRouteFromHash();

  if (route === "dashboard") {
    try {
      route = normalizeRoute(localStorage.getItem("rf_last_route") || "dashboard");
    } catch {}
  }

  setPage(route, { skipHash: !location.hash, noScroll: true });
}

function bindHashRouter() {
  window.addEventListener("hashchange", () => {
    setPage(getRouteFromHash(), { skipHash: true });
  });
}

export function initNavigation() {
  if (RouteState.initialized) return;
  RouteState.initialized = true;

  validateRoutes();
  bindRouteDelegation();
  bindDrawer();
  bindHashRouter();
  startRoute();

  window.RFNavigation = {
    setPage,
    openDrawer,
    closeDrawer,
    routes: ROUTES,
    state: RouteState
  };

  console.log("[RF Navigation] Navigation Pro iniciado.");
}
