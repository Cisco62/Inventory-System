import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/** Threshold used when a product has no "Low Stock At" value set. */
export const DEFAULT_LOW_STOCK_AT = 5;

export type StockStatus = "in" | "low" | "out";

export const STOCK_STATUSES: StockStatus[] = ["in", "low", "out"];

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

/** Single source of truth for a product's stock status. */
export function getStockStatus(
  quantity: number,
  lowStockAt: number | null | undefined
): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= (lowStockAt ?? DEFAULT_LOW_STOCK_AT)) return "low";
  return "in";
}

/** Prisma filter matching the same rule as getStockStatus. */
export function stockStatusWhere(
  status: StockStatus
): Prisma.ProductWhereInput {
  switch (status) {
    case "out":
      return { quantity: { lte: 0 } };
    case "low":
      return {
        quantity: { gt: 0 },
        OR: [
          { lowStockAt: null, quantity: { lte: DEFAULT_LOW_STOCK_AT } },
          {
            lowStockAt: { not: null },
            quantity: { lte: prisma.product.fields.lowStockAt },
          },
        ],
      };
    case "in":
      return {
        OR: [
          { lowStockAt: null, quantity: { gt: DEFAULT_LOW_STOCK_AT } },
          {
            lowStockAt: { not: null },
            quantity: { gt: prisma.product.fields.lowStockAt },
          },
        ],
      };
  }
}

export function parseStockStatus(value: unknown): StockStatus | undefined {
  return STOCK_STATUSES.includes(value as StockStatus)
    ? (value as StockStatus)
    : undefined;
}

/** Filter shared by the inventory page and the CSV export. */
export function inventoryWhere(
  userId: string,
  q: string,
  status: StockStatus | undefined
): Prisma.ProductWhereInput {
  return {
    userId,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { AND: [stockStatusWhere(status)] } : {}),
  };
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nairaWholeFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(value: number, { whole = false } = {}) {
  return (whole ? nairaWholeFormatter : nairaFormatter).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}
