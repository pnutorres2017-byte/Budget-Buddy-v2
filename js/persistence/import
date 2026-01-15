export function parseImportFile(text) {
  const env = JSON.parse(text);
  if (env?.app !== "BudgetBuddy" || !env?.data) throw new Error("Invalid file");
  return env.data;
}
