import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Download, Package, Plus, Search, SearchX } from "lucide-react";
import Pagination from "../components/pagination";
import PageShell from "../components/PageShell";
import StockBadge from "../components/StockBadge";
import DeleteProductButton from "../components/DeleteProductButton";
import UpdateProductButton from "../components/UpdateProductButton";
import ToastListener from "../components/ToastListener";
import { buttonClass, EmptyState, inputClass } from "../components/ui";
import { getCurrentUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import {
  formatNaira,
  formatNumber,
  getStockStatus,
  inventoryWhere,
  parseStockStatus,
  STOCK_STATUS_LABELS,
  stockStatusWhere,
  type StockStatus,
} from "../lib/inventory";

export const metadata: Metadata = { title: "Inventory" };

const PAGE_SIZE = 10;

function inventoryUrl(params: { q?: string; status?: StockStatus }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `/inventory?${qs}` : "/inventory";
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  const userId = user.id;
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status = parseStockStatus(params.status);
  const requestedPage = Math.max(1, Math.floor(Number(params.page) || 1));
  const where = inventoryWhere(userId, q, status);
  const searchOnly = inventoryWhere(userId, q, undefined);

  const [totalCount, ownedCount, allCount, inCount, lowCount, outCount] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({ where: { userId } }),
    prisma.product.count({ where: searchOnly }),
    prisma.product.count({ where: { AND: [searchOnly, stockStatusWhere("in")] } }),
    prisma.product.count({ where: { AND: [searchOnly, stockStatusWhere("low")] } }),
    prisma.product.count({ where: { AND: [searchOnly, stockStatusWhere("out")] } }),
  ]);
  const hasAnyProducts = ownedCount > 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const isFiltered = Boolean(q || status);
  const firstItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, totalCount);

  const tabs: { label: string; status?: StockStatus; count: number }[] = [
    { label: "All", count: allCount },
    { label: STOCK_STATUS_LABELS.in, status: "in", count: inCount },
    { label: STOCK_STATUS_LABELS.low, status: "low", count: lowCount },
    { label: STOCK_STATUS_LABELS.out, status: "out", count: outCount },
  ];

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  const exportHref = `/inventory/export${exportParams.size ? `?${exportParams}` : ""}`;

  const rows = items.map((product) => ({
    product,
    status: getStockStatus(product.quantity, product.lowStockAt),
    editable: {
      id: product.id,
      name: product.name,
      price: product.price.toNumber(),
      quantity: product.quantity,
      sku: product.sku,
      lowStockAt: product.lowStockAt,
    },
  }));

  return (
    <PageShell
      title="Inventory"
      description="Manage your products and keep track of stock levels."
      actions={
        <>
          {hasAnyProducts && (
            <a href={exportHref} className={buttonClass("secondary")}>
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          )}
          <Link href="/add-product" className={buttonClass("primary")}>
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Filter by stock status">
            {tabs.map((tab) => {
              const active = tab.status === status;
              return (
                <Link
                  key={tab.label}
                  href={inventoryUrl({ q, status: tab.status })}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {formatNumber(tab.count)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <form className="flex gap-2 lg:w-96" action="/inventory" method="GET" role="search">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search name or SKU…"
                aria-label="Search products"
                className={inputClass(false, "pl-9")}
              />
            </div>
            <button className={buttonClass("secondary")}>Search</button>
            {q && (
              <Link href={inventoryUrl({ status })} className={buttonClass("ghost")}>
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Content */}
        {rows.length === 0 ? (
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No products match your filters"
              description={
                q ? `Nothing found for “${q}”. Try a different search or status.` : "No products have this status right now."
              }
              action={
                <Link href="/inventory" className={buttonClass("secondary")}>
                  Clear filters
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="Your inventory is empty"
              description="Add your first product to start tracking stock."
              action={
                <Link href="/add-product" className={buttonClass("primary")}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Link>
              }
            />
          )
        ) : (
          <>
            {/* Mobile: cards */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map(({ product, status: s, editable }) => (
                <li key={product.id} className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900">{product.name}</p>
                    </div>
                    {product.sku && (
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{product.sku}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium tabular-nums text-slate-900">
                        {formatNaira(product.price.toNumber())}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {formatNumber(product.quantity)} units
                      </span>
                      <StockBadge status={s} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <UpdateProductButton product={editable} />
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 sm:pl-6">Product</th>
                    <th scope="col" className="px-5 py-3 text-right">Price</th>
                    <th scope="col" className="px-5 py-3 text-right">Quantity</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Alert at</th>
                    <th scope="col" className="px-5 py-3 text-right sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(({ product, status: s, editable }) => (
                    <tr key={product.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 sm:pl-6">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="font-mono text-xs text-slate-500">
                          {product.sku || "No SKU"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-slate-900">
                        {formatNaira(product.price.toNumber())}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-900">
                        {formatNumber(product.quantity)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StockBadge status={s} />
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-500">
                        {product.lowStockAt ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 sm:pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <UpdateProductButton product={editable} />
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 sm:flex-row sm:px-6">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{firstItem}</span>–
                <span className="font-medium text-slate-900">{lastItem}</span> of{" "}
                <span className="font-medium text-slate-900">{formatNumber(totalCount)}</span>
              </p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{ q, status: status ?? "" }}
              />
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}
