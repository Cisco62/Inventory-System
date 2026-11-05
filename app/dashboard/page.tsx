import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import PageShell from "../components/PageShell";
import ProductsChart from "../components/Products-Chart";
import StockBadge from "../components/StockBadge";
import { getCurrentUser } from "../lib/auth";
import {
  formatNaira,
  formatNumber,
  getStockStatus,
  stockStatusWhere,
} from "../lib/inventory";
import { prisma } from "../lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS_SHOWN = 12;

/** Count dates into the last WEEKS_SHOWN seven-day windows ending now. */
function countByWeek(dates: Date[], now = Date.now()) {
  return Array.from({ length: WEEKS_SHOWN }, (_, idx) => {
    const weeksAgo = WEEKS_SHOWN - 1 - idx;
    const end = now - weeksAgo * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    const startDate = new Date(start + DAY_MS);
    return {
      week: `${String(startDate.getMonth() + 1).padStart(2, "0")}/${String(
        startDate.getDate()
      ).padStart(2, "0")}`,
      products: dates.filter((d) => {
        const t = d.getTime();
        return t > start && t <= end;
      }).length,
    };
  });
}

function EmptyProducts({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="mb-3 h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <p className="mt-1 text-sm text-gray-500">
        Add your first product to start tracking stock.
      </p>
      <Link
        href="/add-product"
        className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Product
      </Link>
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function StockRing({ percentage }: { percentage: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  return (
    <div className="relative h-48 w-48">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="stroke-gray-200"
        />
        {percentage > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="stroke-green-500"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const [totalProducts, lowStockCount, outOfStockCount, allProducts, lowest, recent] =
    await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.product.count({ where: { userId, ...stockStatusWhere("low") } }),
      prisma.product.count({ where: { userId, ...stockStatusWhere("out") } }),
      prisma.product.findMany({
        where: { userId },
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.product.findMany({
        where: { userId },
        orderBy: [{ quantity: "asc" }, { name: "asc" }],
        take: 5,
      }),
      prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
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
  const inStockPercentage = percent(inStockCount);

  const weeklyProductsData = countByWeek(allProducts.map((p) => p.createdAt));

  const metrics = [
    {
      label: "Total Products",
      value: formatNumber(totalProducts),
      sub: `${formatNumber(totalUnits)} units`,
      href: "/inventory",
      tone: "text-gray-900",
    },
    {
      label: "Total Value",
      value: formatNaira(totalValue, { whole: true }),
      sub: "Price × quantity",
      tone: "text-gray-900",
    },
    {
      label: "Low Stock",
      value: formatNumber(lowStockCount),
      sub: lowStockCount > 0 ? "Needs restocking" : "All good",
      href: "/inventory?status=low",
      tone: lowStockCount > 0 ? "text-yellow-600" : "text-gray-900",
    },
    {
      label: "Out of Stock",
      value: formatNumber(outOfStockCount),
      sub: outOfStockCount > 0 ? "Unavailable" : "All good",
      href: "/inventory?status=out",
      tone: outOfStockCount > 0 ? "text-red-600" : "text-gray-900",
    },
  ];

  const legend = [
    { label: "In Stock", count: inStockCount, dot: "bg-green-500", href: "/inventory?status=in" },
    { label: "Low Stock", count: lowStockCount, dot: "bg-yellow-500", href: "/inventory?status=low" },
    { label: "Out of Stock", count: outOfStockCount, dot: "bg-red-500", href: "/inventory?status=out" },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="Welcome back! Here is an overview of your inventory."
    >
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Key Metrics */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <CardHeader title="Key Metrics" />
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m) => {
              const body = (
                <>
                  <div className={`text-2xl font-bold sm:text-3xl ${m.tone}`}>
                    {m.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {m.label}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{m.sub}</div>
                </>
              );
              return m.href ? (
                <Link
                  key={m.label}
                  href={m.href}
                  className="rounded-lg border border-gray-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={m.label}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </div>

        {/* New products per week */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <CardHeader
            title="New Products per Week"
            subtitle={`Last ${WEEKS_SHOWN} weeks`}
          />
          <div className="h-56">
            <ProductsChart data={weeklyProductsData} />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Stock Levels */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <CardHeader
            title="Stock Levels"
            subtitle="Lowest stock first"
            href={totalProducts > 0 ? "/inventory" : undefined}
          />
          {lowest.length === 0 ? (
            <EmptyProducts message="No stock levels to show yet" />
          ) : (
            <div className="space-y-3">
              {lowest.map((product) => {
                const status = getStockStatus(
                  product.quantity,
                  product.lowStockAt
                );
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <span className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {formatNumber(product.quantity)} units
                      </span>
                      <StockBadge status={status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stock Health */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <CardHeader title="Stock Health" subtitle="Share of products by status" />
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <StockRing percentage={inStockPercentage} />
            <div className="w-full space-y-2 sm:w-auto">
              {legend.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between gap-6 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${item.dot}`} />
                    {item.label}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(item.count)} ({percent(item.count)}%)
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CardHeader
          title="Recent Products"
          subtitle="Latest additions to your inventory"
          href={totalProducts > 0 ? "/inventory" : undefined}
        />
        {recent.length === 0 ? (
          <EmptyProducts message="No products added yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Quantity</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((product) => (
                  <tr key={product.id}>
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {formatNaira(product.price.toNumber())}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {formatNumber(product.quantity)}
                    </td>
                    <td className="py-3 pr-4">
                      <StockBadge
                        status={getStockStatus(
                          product.quantity,
                          product.lowStockAt
                        )}
                      />
                    </td>
                    <td className="whitespace-nowrap py-3 text-gray-500">
                      {product.createdAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
