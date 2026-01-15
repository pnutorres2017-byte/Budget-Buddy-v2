import { seedState, SCHEMA_VERSION } from "./state.js";

const KEY = "budgetBuddyV2";

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return seedState();

  try {
    const parsed = JSON.parse(raw);
    // minimal validation + migration stub
    if (!parsed?.meta?.schemaVersion) return seedState();
    if (parsed.meta.schemaVersion > SCHEMA_VERSION) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state) {
  state.meta.updatedAtISO = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportEnvelope(state) {
  return {
    app: "BudgetBuddy",
    version: "2",
    exportedAtISO: new Date().toISOString(),
    schemaVersion: state.meta.schemaVersion,
    data: state,
  };
}

