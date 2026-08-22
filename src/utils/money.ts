/** Format integer paise as crore for display. 1 crore rupees = 1_000_000_000 paise. */
export function formatCrore(paise: number): string {
  const crore = paise / 1_000_000_000;
  const rounded = Math.round(crore * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
  return `₹${text} Cr`;
}

export function formatPaiseFull(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
