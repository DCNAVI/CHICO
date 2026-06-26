const app = document.getElementById("app");
const routeStylesheet = document.getElementById("routeStylesheet");
const appBaseUrl = new URL("../../", import.meta.url);
let currentCleanup = null;

const routes = {
  home: {
    title: "Academia Chico",
    template: "frontend/views/client/home.html",
    stylesheet: "frontend/css/styles.css",
    init: () => import("./script.js").then(({ initHome }) => initHome())
  },
  login: {
    title: "Iniciar sesion | Academia Chico",
    template: "frontend/views/client/login.html",
    stylesheet: "frontend/css/login.css",
    init: () => import("./login.js").then(({ initLogin }) => initLogin())
  },
  registro: {
    title: "Registro | Academia Chico",
    template: "frontend/views/client/registro.html",
    stylesheet: "frontend/css/registro.css",
    init: () => import("./registro.js").then(({ initRegister }) => initRegister())
  },
  "client-dashboard": {
    title: "Mi aprendizaje | Academia Chico",
    template: "frontend/views/client/dashboard.html",
    stylesheet: "frontend/css/dashboard.css",
    init: () => import("./dashboard.js").then(({ initDashboard }) => initDashboard())
  },
  "admin-dashboard": {
    title: "Administracion | Academia Chico",
    template: "frontend/views/admin/dashboard.html",
    stylesheet: "frontend/css/admin.css",
    init: () => import("./admin-dashboard.js")
      .then(({ initAdminDashboard }) => initAdminDashboard())
  },
  "error-401": {
    title: "401 | Sesion requerida",
    template: "frontend/views/errors/401.html",
    stylesheet: "frontend/css/errors.css",
    init: () => import("./errors.js").then(({ initErrorPage }) => initErrorPage())
  },
  "error-403": {
    title: "403 | Acceso prohibido",
    template: "frontend/views/errors/403.html",
    stylesheet: "frontend/css/errors.css",
    init: () => import("./errors.js").then(({ initErrorPage }) => initErrorPage())
  },
  "error-404": {
    title: "404 | Pagina no encontrada",
    template: "frontend/views/errors/404.html",
    stylesheet: "frontend/css/errors.css",
    init: () => import("./errors.js").then(({ initErrorPage }) => initErrorPage())
  },
  "error-500": {
    title: "500 | Error interno",
    template: "frontend/views/errors/500.html",
    stylesheet: "frontend/css/errors.css",
    init: () => import("./errors.js").then(({ initErrorPage }) => initErrorPage())
  },
  "error-offline": {
    title: "Sin conexion | Academia Chico",
    template: "frontend/views/errors/offline.html",
    stylesheet: "frontend/css/errors.css",
    init: () => import("./errors.js").then(({ initErrorPage }) => initErrorPage())
  }
};

function getRouteName() {
  const relativePath = window.location.pathname
    .slice(appBaseUrl.pathname.length)
    .replace(/^\/+|\/+$/g, "");

  if (relativePath === "") return "home";
  if (relativePath === "login") return "login";
  if (relativePath === "registro") return "registro";
  if (
    relativePath === "dashboard" ||
    relativePath === "cliente" ||
    relativePath === "cliente/dashboard"
  ) {
    return "client-dashboard";
  }
  if (relativePath === "admin" || relativePath === "admin/dashboard") {
    return "admin-dashboard";
  }
  if (relativePath === "401" || relativePath === "error/401") return "error-401";
  if (relativePath === "403" || relativePath === "error/403") return "error-403";
  if (relativePath === "404" || relativePath === "error/404") return "error-404";
  if (relativePath === "500" || relativePath === "error/500") return "error-500";
  if (
    relativePath === "offline" ||
    relativePath === "sin-conexion" ||
    relativePath === "error/offline"
  ) {
    return "error-offline";
  }

  return "error-404";
}

function navigate(path, { replace = false } = {}) {
  const targetUrl = new URL(path.replace(/^\/+/, ""), appBaseUrl);
  const method = replace ? "replaceState" : "pushState";

  window.history[method]({}, "", targetUrl);
  renderRoute();
}

async function renderRoute() {
  const routeName = getRouteName();
  const route = routes[routeName];

  if (typeof currentCleanup === "function") {
    currentCleanup();
    currentCleanup = null;
  }

  try {
    const response = await fetch(new URL(route.template, appBaseUrl));

    if (!response.ok) {
      throw new Error(`No se pudo cargar la vista: ${response.status}`);
    }

    const html = await response.text();
    const viewDocument = new DOMParser().parseFromString(html, "text/html");

    document.title = route.title;
    routeStylesheet.href = new URL(route.stylesheet, appBaseUrl);
    app.innerHTML = viewDocument.body.innerHTML;
    window.scrollTo(0, 0);

    currentCleanup = await route.init();
  } catch (error) {
    console.error(error);

    if (routeName.startsWith("error-")) {
      routeStylesheet.removeAttribute("href");
      app.innerHTML = `
        <main style="font-family: Arial, sans-serif; padding: 4rem; text-align: center">
          <h1>No se pudo cargar la pagina de error</h1>
          <a href="${appBaseUrl.pathname}">Volver al inicio</a>
        </main>
      `;
      return;
    }

    navigate(navigator.onLine ? "error/500" : "error/offline", {
      replace: true
    });
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }

  const href = link.getAttribute("href") || "";

  if (href.startsWith("#")) {
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (link.hasAttribute("data-route")) {
    event.preventDefault();
    navigate(href);
  }
});

window.addEventListener("popstate", renderRoute);
window.addEventListener("app:navigate", (event) => navigate(event.detail));
window.addEventListener("offline", () => {
  navigate("error/offline", { replace: true });
});

renderRoute();
