export function getRoute() {
  const h = window.location.hash || "#today";
  if (["#today", "#history", "#calendar", "#bills"].includes(h)) return h;
  return "#today";
}

export function setActiveNav(route) {
  document.querySelectorAll(".navBtn").forEach(btn => {
    const r = btn.getAttribute("data-route");
    btn.classList.toggle("active", r === route);
  });
}

