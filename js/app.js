import { initStore } from "./core/store.js";
import { initRouter, getRoute } from "./core/router.js";
import { $ } from "./core/dom.js";

import { renderToday } from "./render/today.js";
import { renderHistory } from "./render/history.js";
import { renderPlaceholder } from "./render/placeholder.js";

import { initSheets } from "./ui/sheets.js";
import { initNav } from "./ui/nav.js";
import { initAddMenu } from "./ui/addMenu.js";
import { initPurchase } from "./ui/purchase.js";
import { initSettings } from "./ui/settings.js";

const store = initStore();
initRouter(onRoute);
initSheets();
initNav();
initAddMenu(store);
initPurchase(store);
initSettings(store);

onRoute(getRoute());

function onRoute(route) {
  const state = store.getState();
  const view = $("#view");
  const title = $("#topbarTitle");

  if (route === "#today") {
    title.textContent = "Today";
    view.innerHTML = renderToday(state);
  } else if (route === "#history") {
    title.textContent = "History";
    view.innerHTML = renderHistory(state);
  } else if (route === "#calendar") {
    title.textContent = "Calendar";
    view.innerHTML = renderPlaceholder("Calendar", "Next: mark Work/PTO days.");
  } else if (route === "#bills") {
    title.textContent = "Bills";
    view.innerHTML = renderPlaceholder("Bills", "Next: bills + debt screens.");
  }
}
