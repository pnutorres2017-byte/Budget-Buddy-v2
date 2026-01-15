import { centsToDollars } from "../money/cents.js";
import { escapeHtml } from "../core/dom.js";

export function renderHistory(state) {
  const rows = [...state.transactions]
    .slice()
    .sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")))
    .map(t => `
      <div class="card">
        <div class="muted">${escapeHtml(t.type)} • ${escapeHtml(t.date || "")}</div>
        <div class="big">$${centsToDollars(t.amountCents || 0)}</div>
      </div>
    `)
    .join("");

  return rows || `<div class="card"><div class="muted">No history yet</div></div>`;
}
