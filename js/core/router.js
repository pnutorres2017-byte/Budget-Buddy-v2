let onRouteCb = null;

export function initRouter(onRoute) {
  onRouteCb = onRoute;
  window.addEventListener("hashchange", () => onRouteCb(getRoute()));
}

export function getRoute() {
  const h = window.location.hash || "#today";
  if (["#today", "#history", "#calendar", "#bills"].includes(h)) return h;
  return "#today";
}

