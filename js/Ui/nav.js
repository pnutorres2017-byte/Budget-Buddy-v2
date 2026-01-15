import { $all } from "../core/dom.js";
import { getRoute } from "../core/router.js";

export function initNav() {
  $all(".navBtn[data-route]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.hash = btn.dataset.route;
      setActive(btn.dataset.route);
    });
  });

  window.addEventListener("hashchange", () => setActive(getRoute()));
  setActive(getRoute());
}

function setActive(route) {
  $all(".navBtn").forEach(btn => {
    const r = btn.getAttribute("data-route");
    btn.classList.toggle("active", r === route);
  });
}
