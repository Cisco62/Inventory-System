import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, History } from "lucide-react";
import AdjustStockButton from "../../components/AdjustStockButton";
import DeleteProductButton from "../../components/DeleteProductButton";
import MovementList from "../../components/MovementList";
import PageShell from "../../components/PageShell";
import StockBadge from "../../components/StockBadge";
import UpdateProductButton from "../../components/UpdateProductButton";
import { Card, CardHeader, EmptyState } from "../../components/ui";
import { getCurrentUser } from "../../lib/auth";
import {
  DEFAULT_LOW_STOCK_AT,
  formatNaira,
  formatNumber,
  getStockStatus,
} from "../../lib/inventory";
import { prisma } from "../../lib/prisma";
import { marginPercent, summarizeSales } from "../../lib/profit";

const HISTORY_LIMIT = 100;

type Props = { params: Promise<{ id: string }> };

async function getProduct(id: string) {
  const user = await getCurrentUser();
  return prisma.product.findFirst({ where: { id, userId: user.id } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [movements, totals, sales] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
    }),
    prisma.stockMovement.groupBy({
      by: ["type"],
      where: { productId: product.id },
      _sum: { change: true },
    }),
    prisma.stockMovement.findMany({
      where: { productId: product.id, type: "SOLD" },
      select: { change: true, unitPrice: true, unitCost: true },
    }),
  ]);

  const sum = (type: string) =>
    Math.abs(totals.find((t) => t.type === type)?._sum.change ?? 0);
  const price = product.price.toNumber();
  const cost = product.costPrice?.toNumber() ?? null;
  const margin = marginPercent(price, cost);
  const salesSummary = summarizeSales(sales);
  const status = getStockStatus(product.quantity, product.lowStockAt);

  const stats = [
    { label: "In stock", value: formatNumber(product.quantity), extra: <StockBadge status={status} /> },
    {
      label: "Selling price",
      value: formatNaira(price),
      sub: cost != null ? `Cost ${formatNaira(cost)}` : "No cost price set",
    },
    {
      label: "Margin",
      value: margin != null ? `${margin}%` : "—",
      sub:
        cost != null
          ? `${formatNaira(price - cost)} profit per unit`
          : "Add a cost price to see margin",
    },
    {
      label: "Stock value",
      value: formatNaira(price * product.quantity, { whole: true }),
      sub:
        cost != null
          ? `${formatNaira(cost * product.quantity, { whole: true })} at cost`
          : `Alert at ≤ ${product.lowStockAt ?? DEFAULT_LOW_STOCK_AT}`,
    },
  ];

  const lifetime = [
    { label: "Received", value: sum("RECEIVED"), tone: "text-indigo-600" },
    { label: "Sold", value: sum("SOLD"), tone: "text-emerald-600" },
    { label: "Damaged / lost", value: sum("DAMAGED"), tone: "text-red-600" },
  ];

  return (
    <PageShell
      title={product.name}
      description={product.sku ? `SKU ${product.sku}` : "No SKU"}
      actions={
        <>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Inventory
          </Link>
          <div className="flex items-center rounded-lg bg-white shadow-sm ring-1 ring-inset ring-slate-300">
            <UpdateProductButton
              product={{
                id: product.id,
                name: product.name,
                price,
                costPrice: product.costPrice?.toNumber() ?? null,
                quantity: product.quantity,
                sku: product.sku,
                lowStockAt: product.lowStockAt,
              }}
            />
            <DeleteProductButton
              productId={product.id}
              productName={product.name}
              redirectTo="/inventory"
            />
          </div>
          <AdjustStockButton
            variant="button"
            product={{
                      id: product.id,
                      name: product.name,
                      quantity: product.quantity,
                      price: product.price.toNumber(),
                      costPrice: product.costPrice?.toNumber() ?? null,
                    }}
          />
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-5">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                {s.value}
              </p>
              {"extra" in s ? s.extra : null}
            </div>
            {"sub" in s && <p className="mt-1 text-xs text-slate-500">{s.sub}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padded={false} className="lg:col-span-2">
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardHeader
              title="Stock history"
              subtitle={
                movements.length === HISTORY_LIMIT
                  ? `Latest ${HISTORY_LIMIT} changes`
                  : "Every change to this product's stock"
              }
            />
          </div>
          {movements.length === 0 ? (
            <EmptyState
              icon={History}
              title="No stock changes yet"
              description="Record a delivery or sale with “Adjust stock” and it will show up here."
            />
          ) : (
            <MovementList movements={movements} />
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="All-time totals" subtitle="Units moved since tracking began" />
          <dl className="space-y-3">
            {lifetime.map((l) => (
              <div key={l.label} className="flex items-center justify-between text-sm">
                <dt className="text-slate-600">{l.label}</dt>
                <dd className={`font-semibold tabular-nums ${l.tone}`}>{formatNumber(l.value)}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <dt className="text-slate-600">Revenue</dt>
              <dd className="font-semibold tabular-nums text-slate-900">
                {formatNaira(salesSummary.revenue, { whole: true })}
              </dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">Profit</dt>
              <dd
                className={`font-semibold tabular-nums ${
                  salesSummary.profit < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {salesSummary.revenueWithCost > 0 || salesSummary.units === 0
                  ? formatNaira(salesSummary.profit, { whole: true })
                  : "—"}
              </dd>
            </div>
          </dl>
          {salesSummary.unitsWithoutCost > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {formatNumber(salesSummary.unitsWithoutCost)} unit
              {salesSummary.unitsWithoutCost === 1 ? "" : "s"} sold without a cost price
              {" "}aren&rsquo;t included in profit.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
