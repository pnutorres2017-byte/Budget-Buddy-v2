import { openSheet, closeAllSheets } from "./sheets.js";
import { $ } from "../core/dom.js";
import { hydratePurchaseUI } from "./purchase.js";

export function initAddMenu(store) {
  $("#btnAdd").addEventListener("click", () => openSheet("#sheetAddMenu"));

  $("#btnOpenNewPurchase").addEventListener("click", () => {
    closeAllSheets();
    hydratePurchaseUI(store.getState());
    openSheet("#sheetPurchase");
  });

  $("#btnOpenNewCheck").addEventListener("click", () => {
    alert("New Check: later step (after Calendar + limiter + check preview).");
  });
}
