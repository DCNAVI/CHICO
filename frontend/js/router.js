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

  return "not-found";
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

  if (!route) {
    document.title = "Pagina no encontrada | Academia Chico";
    routeStylesheet.removeAttribute("href");
    app.innerHTML = `
      <main style="font-family: Arial, sans-serif; padding: 4rem; text-align: center">
        <h1>Pagina no encontrada</h1>
        <p>La ruta que buscas no existe.</p>
        <a href="${appBaseUrl.pathname}" data-route>Volver al inicio</a>
      </main>
    `;
    return;
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
    app.innerHTML = `
      <main style="font-family: Arial, sans-serif; padding: 4rem; text-align: center">
        <h1>No se pudo cargar la pagina</h1>
        <p>Actualiza el navegador para intentarlo nuevamente.</p>
      </main>
    `;
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");

  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  navigate(link.getAttribute("href"));
});

window.addEventListener("popstate", renderRoute);
window.addEventListener("app:navigate", (event) => navigate(event.detail));

renderRoute();
