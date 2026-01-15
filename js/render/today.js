import { centsToDollars } from "../money/cents.js";
import { todayLocalYYYYMMDD } from "../date/today.js";
import { escapeHtml } from "../core/dom.js";

export function renderToday(state) {
  const today = todayLocalYYYYMMDD();

  const assetsCents =
    state.savings.balanceCents +
    state.pods.reduce((s,p) => s + p.balanceCents, 0);

  const liabilitiesCents =
    state.debts.reduce((s,d) => s + (d.balanceCents || 0), 0);

  const netWorthCents = assetsCents - liabilitiesCents;

  const podsHtml = state.pods.map(p => `
    <div class="card">
      <div class="muted">${escapeHtml(p.name)}</div>
      <div class="big">$${centsToDollars(p.balanceCents)}</div>
    </div>
  `).join("");

  return `
    <div class="card">
      <div class="muted">Today • ${today}</div>
      <div class="row" style="margin-top:8px;">
        <div class="col">
          <div class="muted">Days until next paycheck</div>
          <div class="big">0</div>
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
