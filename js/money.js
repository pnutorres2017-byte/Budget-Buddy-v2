
export function dollarsToCents(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}
