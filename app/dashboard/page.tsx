import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Package,
  PackageX,
  Plus,
} from "lucide-react";
import PageShell from "../components/PageShell";
import ActivityChart from "../components/ActivityChart";
import AdjustStockButton from "../components/AdjustStockButton";
import MovementList from "../components/MovementList";
import StockBadge from "../components/StockBadge";
import {
  buttonClass,
  Card,
  CardHeader,
  EmptyState,
  IconTile,
  TextLink,
} from "../components/ui";
import { getCurrentUser } from "../lib/auth";
import {
  DEFAULT_LOW_STOCK_AT,
  formatNaira,
  formatNumber,
  getStockStatus,
  stockStatusWhere,
} from "../lib/inventory";
import { prisma } from "../lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS_SHOWN = 12;

/** Start of the window shown in the activity chart. */
function chartStart() {
  return new Date(Date.now() - WEEKS_SHOWN * 7 * DAY_MS);
}

/** Units received and sold in each of the last WEEKS_SHOWN seven-day windows. */
function activityByWeek(
  movements: { type: string; change: number; createdAt: Date }[],
  now = Date.now()
) {
  return Array.from({ length: WEEKS_SHOWN }, (_, idx) => {
    const weeksAgo = WEEKS_SHOWN - 1 - idx;
    const end = now - weeksAgo * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    const inWeek = movements.filter((m) => {
      const t = m.createdAt.getTime();
      return t > start && t <= end;
    });
    const total = (type: string) =>
      inWeek.filter((m) => m.type === type).reduce((sum, m) => sum + Math.abs(m.change), 0);
    return {
      week: new Date(start + DAY_MS).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lagos",
      }),
      received: total("RECEIVED"),
      sold: total("SOLD"),
    };
  });
}

function ProductInitial({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold uppercase text-slate-600">
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

function StockRing({ percentage }: { percentage: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-slate-100" />
        {percentage > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="stroke-emerald-500"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">
          {percentage}%
        </span>
        <span className="text-xs font-medium text-slate-500">in stock</span>
      </div>
    </div>
  );
}

function ViewAll({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <TextLink href="/inventory">
      View all <ArrowRight className="h-4 w-4" />
    </TextLink>
  );
}

const addProductButton = (
  <Link href="/add-product" className={buttonClass("primary")}>
    <Plus className="h-4 w-4" />
    Add Product
  </Link>
);

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const since = chartStart();

  const [totalProducts, lowStockCount, outOfStockCount, allProducts, lowest, recentActivity, chartMovements] =
    await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.product.count({ where: { userId, ...stockStatusWhere("low") } }),
      prisma.product.count({ where: { userId, ...stockStatusWhere("out") } }),
      prisma.product.findMany({
        where: { userId },
        select: { price: true, quantity: true },
      }),
      prisma.product.findMany({
        where: { userId },
        orderBy: [{ quantity: "asc" }, { name: "asc" }],
        take: 5,
      }),
      prisma.stockMovement.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.stockMovement.findMany({
        where: { userId, type: { in: ["RECEIVED", "SOLD"] }, createdAt: { gt: since } },
        select: { type: true, change: true, createdAt: true },
      }),
    ]);

  const inStockCount = totalProducts - lowStockCount - outOfStockCount;
  const totalUnits = allProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = allProducts.reduce(
    (sum, p) => sum + p.price.toNumber() * p.quantity,
    0
  );
  const percent = (count: number) =>
    totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
  const activity = activityByWeek(chartMovements);
  const soldThisPeriod = activity.reduce((s, w) => s + w.sold, 0);
  const receivedThisPeriod = activity.reduce((s, w) => s + w.received, 0);

  const stats = [
    {
      label: "Total products",
      value: formatNumber(totalProducts),
      sub: `${formatNumber(totalUnits)} units in stock`,
      icon: Package,
      tone: "indigo" as const,
      href: "/inventory",
    },
    {
      label: "Inventory value",
      value: formatNaira(totalValue, { whole: true }),
      sub: "Price × quantity on hand",
      icon: Banknote,
      tone: "green" as const,
    },
    {
      label: "Low stock",
      value: formatNumber(lowStockCount),
      sub: lowStockCount > 0 ? "Need restocking soon" : "Nothing running low",
      icon: AlertTriangle,
      tone: "amber" as const,
      href: "/inventory?status=low",
    },
    {
      label: "Out of stock",
      value: formatNumber(outOfStockCount),
      sub: outOfStockCount > 0 ? "Currently unavailable" : "Everything available",
      icon: PackageX,
      tone: "red" as const,
      href: "/inventory?status=out",
    },
  ];

  const legend = [
    { label: "In stock", count: inStockCount, color: "bg-emerald-500", href: "/inventory?status=in" },
    { label: "Low stock", count: lowStockCount, color: "bg-amber-500", href: "/inventory?status=low" },
    { label: "Out of stock", count: outOfStockCount, color: "bg-red-500", href: "/inventory?status=out" },
  ];

  const firstName = user.displayName?.trim().split(/\s+/)[0];

  return (
    <PageShell
      title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
      description="Here's an overview of your inventory today."
      actions={addProductButton}
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const content = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
              </div>
              <IconTile icon={s.icon} tone={s.tone} />
            </div>
          );
          const base = "rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm";
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className={`${base} transition hover:border-indigo-200 hover:shadow-md`}
            >
              {content}
            </Link>
          ) : (
            <div key={s.label} className={base}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Chart + stock health */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Stock activity"
            subtitle={`Last ${WEEKS_SHOWN} weeks: ${formatNumber(receivedThisPeriod)} units received, ${formatNumber(soldThisPeriod)} sold`}
          />
          {chartMovements.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <EmptyState
                icon={Activity}
                title="No deliveries or sales recorded yet"
                description="Use “Adjust stock” on a product to record what you receive and sell. Your weekly activity will appear here."
              />
            </div>
          ) : (
            <div className="h-64">
              <ActivityChart data={activity} />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Stock health" subtitle="Products by status" />
          {totalProducts === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Stock health appears once you add products."
            />
          ) : (
            <>
              <div className="flex justify-center">
                <StockRing percentage={percent(inStockCount)} />
              </div>
              <div className="mt-6 flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-100">
                {legend.map((item) =>
                  item.count > 0 ? (
                    <div
                      key={item.label}
                      className={item.color}
                      style={{ width: `${(item.count / totalProducts) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
              <ul className="mt-4 space-y-1">
                {legend.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="font-medium tabular-nums text-slate-900">
                        {formatNumber(item.count)}
                        <span className="ml-1 font-normal text-slate-400">
                          · {percent(item.count)}%
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardHeader
              title="Needs attention"
              subtitle="Products with the lowest stock"
              action={<ViewAll show={totalProducts > 0} />}
            />
          </div>
          {lowest.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No stock levels to show yet"
              description="Add your first product to start tracking stock."
              action={addProductButton}
            />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {lowest.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <ProductInitial name={product.name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/inventory/${product.id}`}
                      className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatNumber(product.quantity)} units · alert at{" "}
                      {product.lowStockAt ?? DEFAULT_LOW_STOCK_AT}
                    </p>
                  </div>
                  <StockBadge status={getStockStatus(product.quantity, product.lowStockAt)} />
                  <AdjustStockButton
                    initialType="RECEIVED"
                    product={{ id: product.id, name: product.name, quantity: product.quantity }}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padded={false}>
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardHeader title="Recent activity" subtitle="Latest stock changes across products" />
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Deliveries, sales and corrections will show up here."
            />
          ) : (
            <MovementList movements={recentActivity} showProduct />
          )}
        </Card>
      </div>
    </PageShell>
  );
}
