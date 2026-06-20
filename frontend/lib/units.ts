// Number/unit formatting helpers. Model yield target is hg/ha.

export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
