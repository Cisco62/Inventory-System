import { stackServerApp } from "@/stack/server";
import {
  getStockStatus,
  inventoryWhere,
  parseStockStatus,
  STOCK_STATUS_LABELS,
} from "../../lib/inventory";
import { prisma } from "../../lib/prisma";

function csvCell(value: string | number | null | undefined): string {
  let text = value == null ? "" : String(value);
  // Stop spreadsheet apps from treating user text as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = parseStockStatus(searchParams.get("status"));

  const products = await prisma.product.findMany({
    where: inventoryWhere(user.id, q, status),
    orderBy: { name: "asc" },
  });

  const header = ["Name", "SKU", "Price (NGN)", "Quantity", "Low Stock At", "Status", "Value (NGN)", "Added"];
  const rows = products.map((p) => {
    const price = p.price.toNumber();
    return [
      p.name,
      p.sku,
      price.toFixed(2),
      p.quantity,
      p.lowStockAt,
      STOCK_STATUS_LABELS[getStockStatus(p.quantity, p.lowStockAt)],
      (price * p.quantity).toFixed(2),
      p.createdAt.toISOString().slice(0, 10),
    ];
  });

  // Leading BOM so Excel opens the file as UTF-8 (keeps ₦ and accents intact).
  const csv =
    "﻿" +
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
