export function makeExportEnvelope(state) {
  return {
    app: "BudgetBuddy",
    version: "2",
    exportedAtISO: new Date().toISOString(),
    schemaVersion: state.meta.schemaVersion,
    data: state,
  };
}
