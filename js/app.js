import { loadState, saveState, exportEnvelope } from "./persistence.js";
import { dollarsToCents } from "./money.js";
import { getRoute, setActiveNav } from "./routes.js";
import { renderToday, renderHistory, renderPlaceholder } from "./render.js";

let state = loadState();

const view = document.getElementById("view");
const topbarTitle = document.getElementById("topbarTitle");

const overlay = document.getElementById("overlay");
const sheetAddMenu = document.getElementById("sheetAddMenu");
const sheetPurchase = document.getElementById("sheetPurchase");
const sheetSettings = document.getElementById("sheetSettings");

applyTheme();
render();

window.addEventListener("hashchange", render);

document.querySelectorAll(".navBtn[data-route]").forEach(btn => {
  btn.addEventListener("click", () => (window.location.hash = btn.dataset.route));
});

document.getElementById("btnAdd").addEventListener("click", () => openSheet(sheetAddMenu));
document.getElementById("btnSettings").addEventListener("click", () => {
  hydrateSettingsUI();
  openSheet(sheetSettings);
});

document.querySelectorAll("[data-close-sheet]").forEach(btn => btn.addEventListener("click", closeSheets));
overlay.addEventListener("click", closeSheets);

// Add menu actions
document.getElementById("btnOpenNewPurchase").addEventListener("click", () => {
  closeSheets();
  hydratePurchaseUI();
  openSheet(sheetPurchase);
});
document.getElementById("btnOpenNewCheck").addEventListener("click", () => alert("New Check: next step after purchases work"));

// Purchase apply
document.getElementById("btnApplyPurchase").addEventListener("click", () => {
  const amtCents = dollarsToCents(document.getElementById("pAmount").value);
  const podId = document.getElementById("pPod").value;
  const date = document.getElementById("pDate").value || new Date().toISOString().slice(0,10);
  const note = document.getElementById("pNote").value?.trim() || "";

  const err = document.getElementById("pError");
  err.classList.add("hidden");
  err.textContent = "";

  if (!amtCents || amtCents <= 0) return showPurchaseError("Enter a valid amount.");
  const pod = state.pods.find(p => p.id === podId);
  if (!pod) return showPurchaseError("Select a pod.");

  // HARD RULE: pods cannot go negative
  if (amtCents > pod.balanceCents) {
    return showPurchaseError("Not enough funds in this pod.");
  }

  pod.balanceCents -= amtCents;
  pod.updatedAtISO = new Date().toISOString();

  state.transactions.push({
    id: crypto.randomUUID(),
    type: "purchase",
    date,
    amountCents: amtCents,
    podId: pod.id,
    note,
    createdAtISO: new Date().toISOString(),
  });

  saveState(state);
  closeSheets();
  render();
});

function showPurchaseError(msg) {
  const err = document.getElementById("pError");
  err.textContent = msg;
  err.classList.remove("hidden");
}

// Settings tabs
document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabBtn").forEach(b => b.classList.toggle("active", b === btn));
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tabPane").forEach(p => p.classList.add("hidden"));
    document.getElementById(`tab_${tab}`).classList.remove("hidden");
  });
});

// Save balances
document.getElementById("btnSaveBalances").addEventListener("click", () => {
  const s = dollarsToCents(document.getElementById("sSavings").value);
  if (s == null || s < 0) return;
  state.savings.balanceCents = s;
  state.savings.updatedAtISO = new Date().toISOString();

  state.pods.forEach((p, i) => {
    const val = dollarsToCents(document.getElementById(`podBal_${i}`).value);
    if (val == null) return;
    p.balanceCents = Math.max(0, val); // pods never negative
    p.updatedAtISO = new Date().toISOString();
  });

  saveState(state);
  closeSheets();
  render();
});

// Save splits
document.getElementById("btnSaveSplits").addEventListener("click", () => {
  const s = Number(document.getElementById("spSavings").value);
  const p1 = Number(document.getElementById("spPod1").value);
  const p2 = Number(document.getElementById("spPod2").value);
  const p3 = Number(document.getElementById("spPod3").value);

  const total = round2(s + p1 + p2 + p3);
  const err = document.getElementById("splitError");
  err.classList.add("hidden");

  if (![s,p1,p2,p3].every(n => Number.isFinite(n) && n >= 0)) {
    err.textContent = "Enter valid percentages.";
    err.classList.remove("hidden");
    return;
  }
  if (total !== 100.00) {
    err.textContent = "Percentages must total 100.00.";
    err.classList.remove("hidden");
    return;
  }

  state.settings.splits = { savingsPct: s, pod1Pct: p1, pod2Pct: p2, pod3Pct: p3 };
  saveState(state);
  closeSheets();
  render();
});

// Export
document.getElementById("btnExport").addEventListener("click", () => {
  const env = exportEnvelope(state);
  const blob = new Blob([JSON.stringify(env, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "budget-buddy-v2.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import (replace)
document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const importError = document.getElementById("importError");
  importError.classList.add("hidden");

  try {
    const text = await file.text();
    const env = JSON.parse(text);
    if (env?.app !== "BudgetBuddy" || !env?.data) throw new Error("Invalid file.");
    if (!confirm("Import will replace everything. Continue?")) return;

    state = env.data;
    saveState(state);
    applyTheme();
    closeSheets();
    render();
  } catch (err) {
    importError.textContent = "Import failed. Make sure you selected a valid export file.";
    importError.classList.remove("hidden");
  } finally {
    e.target.value = "";
  }
});

// Dark mode toggle
document.getElementById("toggleDark").addEventListener("change", (e) => {
  state.meta.darkMode = !!e.target.checked;
  saveState(state);
  applyTheme();
});

function applyTheme() {
  document.documentElement.toggleAttribute("data-theme", state.meta.darkMode ? "dark" : "");
  document.getElementById("toggleDark").checked = !!state.meta.darkMode;
}

function hydratePurchaseUI() {
  const select = document.getElementById("pPod");
  select.innerHTML = state.pods.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
  document.getElementById("pAmount").value = "";
  document.getElementById("pNote").value = "";
  document.getElementById("pDate").value = new Date().toISOString().slice(0,10);
  document.getElementById("pError").classList.add("hidden");
}

function hydrateSettingsUI() {
  // balances
  document.getElementById("sSavings").value = (state.savings.balanceCents / 100).toFixed(2);

  const holder = document.getElementById("podBalanceFields");
  holder.innerHTML = state.pods.map((p, i) => `
    <label class="field">
      <div class="label">${escapeHtml(p.name)} Balance</div>
      <input id="podBal_${i}" type="number" inputmode="decimal" placeholder="0.00" value="${(p.balanceCents/100).toFixed(2)}" />
    </label>
  `).join("");

  // splits
  const sp = state.settings.splits;
  document.getElementById("spSavings").value = sp.savingsPct.toFixed(2);
  document.getElementById("spPod1").value = sp.pod1Pct.toFixed(2);
  document.getElementById("spPod2").value = sp.pod2Pct.toFixed(2);
  document.getElementById("spPod3").value = sp.pod3Pct.toFixed(2);

  // default tab
  document.querySelectorAll(".tabBtn").forEach((b, idx) => b.classList.toggle("active", idx === 0));
  document.querySelectorAll(".tabPane").forEach((p, idx) => p.classList.toggle("hidden", idx !== 0));
}

function render() {
  const route = getRoute();
  setActiveNav(route);

  if (route === "#today") {
    topbarTitle.textContent = "Today";
    view.innerHTML = renderToday(state);
  } else if (route === "#history") {
    topbarTitle.textContent = "History";
    view.innerHTML = renderHistory(state);
  } else if (route === "#calendar") {
    topbarTitle.textContent = "Calendar";
    view.innerHTML = renderPlaceholder("Calendar", "Next: mark Work/PTO days.");
  } else if (route === "#bills") {
    topbarTitle.textContent = "Bills";
    view.innerHTML = renderPlaceholder("Bills", "Next: date bills, per-check bills, and debt list.");
  }
}

function openSheet(sheetEl) {
  overlay.classList.remove("hidden");
  sheetEl.classList.remove("hidden");
}

function closeSheets() {
  overlay.classList.add("hidden");
  document.querySelectorAll(".sheet").forEach(s => s.classList.add("hidden"));
}

function round2(n) { return Math.round(n * 100) / 100; }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

