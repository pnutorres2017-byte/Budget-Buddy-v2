import { $ } from "../core/dom.js";
import { dollarsToCents } from "../money/cents.js";
import { todayLocalYYYYMMDD } from "../date/today.js";
import { closeAllSheets } from "./sheets.js";

export function initPurchase(store) {
  $("#btnApplyPurchase").addEventListener("click", () => {
    const state = store.getState();

    const amtCents = dollarsToCents($("#pAmount").value);
    const podId = $("#pPod").value;
    const date = $("#pDate").value || todayLocalYYYYMMDD();
    const note = ($("#pNote").value || "").trim();

    clearError();

    if (!amtCents || amtCents <= 0) return showError("Enter a valid amount.");
    const pod = state.pods.find(p => p.id === podId);
    if (!pod) return showError("Select a pod.");

    // HARD RULE: cannot afford -> deny
    if (amtCents > pod.balanceCents) return showError("Not enough funds in this pod.");

    store.update(next => {
      const p = next.pods.find(x => x.id === podId);
      p.balanceCents -= amtCents;
      p.updatedAtISO = new Date().toISOString();

      next.transactions.push({
        id: crypto.randomUUID(),
        type: "purchase",
        date,
        amountCents: amtCents,
        podId,
        note,
        createdAtISO: new Date().toISOString(),
      });
    });

    closeAllSheets();
    // re-render by hashchange listener in app.js (we’re simple here)
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

export function hydratePurchaseUI(state) {
  const select = $("#pPod");
  select.innerHTML = state.pods.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  $("#pAmount").value = "";
  $("#pNote").value = "";
  $("#pDate").value = todayLocalYYYYMMDD();
  clearError();
}

function showError(msg) {
  const el = $("#pError");
  el.textContent = msg;
  el.classList.remove("hidden");
}
function clearError() {
  const el = $("#pError");
  el.textContent = "";
  el.classList.add("hidden");
}
