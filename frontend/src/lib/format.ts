// eBay fee constants — ported verbatim from BiddingView.tsx:70-71
const EBAY_NET_FACTOR = 1 - 0.1325 // 0.8675
const EBAY_FIXED_FEE = 0.4

export function computeProjectedProfit(
  estimatedValue: number | null | undefined,
  bidAmount: number | null | undefined,
): number | null {
  if (estimatedValue == null || bidAmount == null) return null
  return estimatedValue * EBAY_NET_FACTOR - EBAY_FIXED_FEE - bidAmount
}

export function computeRoi(
  estimatedValue: number | null | undefined,
  bidAmount: number | null | undefined,
): number | null {
  const profit = computeProjectedProfit(estimatedValue, bidAmount)
  if (profit == null || bidAmount == null || bidAmount === 0) return null
  return profit / bidAmount
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—"
  return `${(value * 100).toFixed(0)}%`
}

export function truncateTitle(title: string, max = 65): string {
  return title.length > max ? title.slice(0, max).trimEnd() + "…" : title
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}
