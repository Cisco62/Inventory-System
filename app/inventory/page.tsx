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
import { getCurrentUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import {
  formatNaira,
  formatNumber,
  getStockStatus,
  inventoryWhere,
  parseStockStatus,
  STOCK_STATUS_LABELS,
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
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status = parseStockStatus(params.status);
  const requestedPage = Math.max(1, Math.floor(Number(params.page) || 1));
  const where = inventoryWhere(user.id, q, status);

  const [totalCount, hasAnyProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({ where: { userId: user.id }, take: 1 }),
  ]);

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

  const tabs: { label: string; status?: StockStatus }[] = [
    { label: "All" },
    { label: STOCK_STATUS_LABELS.in, status: "in" },
    { label: STOCK_STATUS_LABELS.low, status: "low" },
    { label: STOCK_STATUS_LABELS.out, status: "out" },
  ];

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  const exportHref = `/inventory/export${
    exportParams.toString() ? `?${exportParams}` : ""
  }`;

  return (
    <PageShell
      title="Inventory"
      description="Manage your products and track inventory levels."
      actions={
        <>
          {hasAnyProducts > 0 && (
            <a
              href={exportHref}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          )}
          <Link
            href="/add-product"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      <div className="space-y-6">
        {/* Search & filters */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <form className="flex flex-col gap-2 sm:flex-row" action="/inventory" method="GET">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search by name or SKU..."
                aria-label="Search products"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 cursor-pointer sm:flex-none">
                Search
              </button>
              {q && (
                <Link
                  href={inventoryUrl({ status })}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by stock status">
            {tabs.map((tab) => {
              const active = tab.status === status;
              return (
                <Link
                  key={tab.label}
                  role="tab"
                  aria-selected={active}
                  href={inventoryUrl({ q, status: tab.status })}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Products */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              {isFiltered ? (
                <>
                  <SearchX className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    No products match your filters
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try a different search term or status.
                  </p>
                  <Link
                    href="/inventory"
                    className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Clear filters
                  </Link>
                </>
              ) : (
                <>
                  <Package className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    Your inventory is empty
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first product to start tracking stock.
                  </p>
                  <Link
                    href="/add-product"
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Add Product
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "SKU", "Price", "Quantity", "Status", "Low Stock At", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-500">
                        {product.sku || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatNaira(product.price.toNumber())}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatNumber(product.quantity)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StockBadge
                          status={getStockStatus(product.quantity, product.lowStockAt)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.lowStockAt ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UpdateProductButton
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price.toNumber(),
                              quantity: product.quantity,
                              sku: product.sku,
                              lowStockAt: product.lowStockAt,
                            }}
                          />
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:p-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{firstItem}</span>–
              <span className="font-medium">{lastItem}</span> of{" "}
              <span className="font-medium">{formatNumber(totalCount)}</span>{" "}
              products
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/inventory"
              searchParams={{ q, status: status ?? "" }}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
