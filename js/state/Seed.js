import { todayLocalYYYYMMDD } from "../date/today.js";

export const SCHEMA_VERSION = 1;

export function seedState() {
  const now = new Date().toISOString();
  const today = todayLocalYYYYMMDD();

  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
      currency: "USD",
      darkMode: false,
      createdAtISO: now,
      updatedAtISO: now,
    },
    settings: {
      splits: { savingsPct: 20.00, pod1Pct: 26.67, pod2Pct: 26.67, pod3Pct: 26.66 },
    },
    savings: { balanceCents: 0, updatedAtISO: now },
    pods: [
      { id: crypto.randomUUID(), name: "Snacks", balanceCents: 0, limiterEnabled: true, createdAtISO: now, updatedAtISO: now },
      { id: crypto.randomUUID(), name: "Entertainment", balanceCents: 0, limiterEnabled: true, createdAtISO: now, updatedAtISO: now },
      { id: crypto.randomUUID(), name: "TP / Household", balanceCents: 0, limiterEnabled: true, createdAtISO: now, updatedAtISO: now },
    ],
    payPeriod: { lastPaycheckDate: today, nextPaycheckDate: today },
    calendar: [],
    bills: [],
    debts: [],
    transactions: [],
    limiterDaily: [],
  };
}

