import { $all, $ } from "../core/dom.js";
import { openSheet, closeAllSheets } from "./sheets.js";
import { dollarsToCents } from "../money/cents.js";
import { makeExportEnvelope } from "../persistence/export.js";
import { parseImportFile } from "../persistence/import.js";

export function initSettings(store) {
  $("#btnSettings").addEventListener("click", () => {
    hydrateSettingsUI(store.getState());
    openSheet("#sheetSettings");
  });

  // tabs
  $all(".tabBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      $all(".tabBtn").forEach(b => b.classList.toggle("active", b === btn));
      const tab = btn.dataset.tab;
      $all(".tabPane").forEach(p => p.classList.add("hidden"));
      $(`#tab_${tab}`).classList.remove("hidden");
    });
  });

  // balances
  $("#btnSaveBalances").addEventListener("click", () => {
    const s = dollarsToCents($("#sSavings").value);
    if (s == null || s < 0) return;

    store.update(next => {
      next.savings.balanceCents = s;
      next.savings.updatedAtISO = new Date().toISOString();

      next.pods.forEach((p, i) => {
        const v = dollarsToCents($(`#podBal_${i}`).value);
        if (v == null) return;
        p.balanceCents = Math.max(0, v);
        p.updatedAtISO = new Date().toISOString();
      });
    });

    closeAllSheets();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  // splits
  $("#btnSaveSplits").addEventListener("click", () => {
    const s = Number($("#spSavings").value);
    const p1 = Number($("#spPod1").value);
    const p2 = Number($("#spPod2").value);
    const p3 = Number($("#spPod3").value);

    const err = $("#splitError");
    err.classList.add("hidden");
    err.textContent = "";

    if (![s,p1,p2,p3].every(n => Number.isFinite(n) && n >= 0)) return showSplitError("Enter valid percentages.");
    const total = round2(s + p1 + p2 + p3);
    if (total !== 100.00) return showSplitError("Percentages must total 100.00.");

    store.update(next => {
      next.settings.splits = { savingsPct: s, pod1Pct: p1, pod2Pct: p2, pod3Pct: p3 };
    });

    closeAllSheets();
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    function showSplitError(msg) {
      err.textContent = msg;
      err.classList.remove("hidden");
    }
  });

  // export
  $("#btnExport").addEventListener("click", () => {
    const env = makeExportEnvelope(store.getState());
    const blob = new Blob([JSON.stringify(env, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget-buddy-v2.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // import
  $("#importFile").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const importError = $("#importError");
    importError.classList.add("hidden");
    importError.textContent = "";

    try {
      const text = await file.text();
      const data = parseImportFile(text);
      if (!confirm("Import will replace everything. Continue?")) return;

      store.setState(data);
      applyThemeFromState(store.getState());
      closeAllSheets();
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } catch {
      importError.textContent = "Import failed. Use a valid export file.";
      importError.classList.remove("hidden");
    } finally {
      e.target.value = "";
    }
  });

  // dark mode
  $("#toggleDark").addEventListener("change", (e) => {
    store.update(next => { next.meta.darkMode = !!e.target.checked; });
    applyThemeFromState(store.getState());
  });

  // initial theme at startup
  applyThemeFromState(store.getState());
}

function hydrateSettingsUI(state) {
  $("#sSavings").value = (state.savings.balanceCents / 100).toFixed(2);

  $("#podBalanceFields").innerHTML = state.pods.map((p, i) => `
    <label class="field">
      <div class="label">${p.name} Balance</div>
      <input id="podBal_${i}" type="number" inputmode="decimal" value="${(p.balanceCents/100).toFixed(2)}" />
    </label>
  `).join("");

  const sp = state.settings.splits;
  $("#spSavings").value = sp.savingsPct.toFixed(2);
  $("#spPod1").value = sp.pod1Pct.toFixed(2);
  $("#spPod2").value = sp.pod2Pct.toFixed(2);
  $("#spPod3").value = sp.pod3Pct.toFixed(2);

  $("#toggleDark").checked = !!state.meta.darkMode;

  // default tab
  $all(".tabBtn").forEach((b, idx) => b.classList.toggle("active", idx === 0));
  $all(".tabPane").forEach((p, idx) => p.classList.toggle("hidden", idx !== 0));
}

function applyThemeFromState(state) {
  if (state.meta.darkMode) document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}

function round2(n) { return Math.round(n * 100) / 100; }
