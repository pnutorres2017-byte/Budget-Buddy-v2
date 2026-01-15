import { centsToDollars } from "./money.js";

export function renderToday(state) {
  const today = new Date().toISOString().slice(0,10);

  const assetsCents =
    state.savings.balanceCents +
    state.pods.reduce((s,p) => s + p.balanceCents, 0);

  const liabilitiesCents =
    state.debts.reduce((s,d) => s + d.balanceCents, 0);

  const netWorthCents = assetsCents - liabilitiesCents;

  // top box placeholders for now (bills logic comes after)
  const daysTil = daysBetween(today, state.payPeriod.nextPaycheckDate);

  const podsHtml = state.pods.map((p, idx) => {
    // limiter hint (Option B) if limiter ON but no workdays
    const remainingWorkDays = getRemainingWorkDays(state, today);
    const showHint = p.limiterEnabled && remainingWorkDays === 0;
    return `
      <div class="card">
        <div class="muted">${escapeHtml(p.name)}</div>
        <div class="big">$${centsToDollars(p.balanceCents)}</div>
        ${showHint ? `<div class="hint">Mark work days to enable daily limit</div>` : ``}
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="muted">Today • ${today}</div>
      <div class="row" style="margin-top:8px;">
        <div class="col">
          <div class="muted">Days until next paycheck</div>
          <div class="big">${daysTil}</div>
        </div>
        <div class="col">
          <div class="muted">Next bill</div>
          <div class="big" style="font-size:16px;">No Upcoming bills 🎉</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card col">
        <div class="muted">Savings (Protected)</div>
        <div class="big">$${centsToDollars(state.savings.balanceCents)}</div>
      </div>
      <div class="card col">
        <div class="muted">Net Worth</div>
        <div class="big">$${centsToDollars(netWorthCents)}</div>
      </div>
    </div>

    ${podsHtml}
  `;
}

export function renderHistory(state) {
  const rows = [...state.transactions]
    .slice()
    .sort((a,b) => (b.date || "").localeCompare(a.date || ""))
    .map(t => `<div class="card"><div class="muted">${t.type} • ${t.date}</div><div class="big">$${(t.amountCents/100).toFixed(2)}</div></div>`)
    .join("");

  return rows || `<div class="card"><div class="muted">No history yet</div></div>`;
}

export function renderPlaceholder(title, text) {
  return `<div class="card"><div class="muted">${title}</div><div>${text}</div></div>`;
}

/* helpers */
function daysBetween(fromYYYYMMDD, toYYYYMMDD) {
  const a = new Date(fromYYYYMMDD + "T00:00:00");
  const b = new Date(toYYYYMMDD + "T00:00:00");
  return Math.max(0, Math.round((b - a) / 86400000));
}

function getRemainingWorkDays(state, todayYYYYMMDD) {
  // counts Work days today→next paycheck inclusive, excluding PTO
  const start = new Date(todayYYYYMMDD + "T00:00:00");
  const end = new Date(state.payPeriod.nextPaycheckDate + "T00:00:00");
  if (end < start) return 0;

  const calMap = new Map(state.calendar.map(d => [d.date, d]));
  let count = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0,10);
    const day = calMap.get(key);
    if (!day) continue;
    if (day.isPtoDay) continue;
    if (day.isWorkDay) count++;
  }
  return count;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

