import type { Prisma } from "@prisma/client";

type SaleLike = {
  change: number;
  unitPrice: Prisma.Decimal | null;
  unitCost: Prisma.Decimal | null;
};

export type SalesSummary = {
  units: number;
  revenue: number;
  /** Profit from sales that have a known cost. */
  profit: number;
  /** Revenue from sales that have a known cost (for margin). */
  revenueWithCost: number;
  /** Units sold without a recorded cost, so not counted in profit. */
  unitsWithoutCost: number;
};

/** Revenue and profit from SOLD movements, using the prices saved with each sale. */
export function summarizeSales(sales: SaleLike[]): SalesSummary {
  const summary: SalesSummary = {
    units: 0,
    revenue: 0,
    profit: 0,
    revenueWithCost: 0,
    unitsWithoutCost: 0,
  };
  for (const s of sales) {
    const units = Math.abs(s.change);
    const price = s.unitPrice?.toNumber() ?? 0;
    summary.units += units;
    summary.revenue += units * price;
    if (s.unitCost != null) {
      summary.profit += units * (price - s.unitCost.toNumber());
      summary.revenueWithCost += units * price;
    } else {
      summary.unitsWithoutCost += units;
    }
  }
  return summary;
}

/** Margin as a whole-number percentage of the selling price, or null if unknown. */
export function marginPercent(price: number, cost: number | null | undefined) {
  if (cost == null || price <= 0) return null;
  return Math.round(((price - cost) / price) * 100);
}
