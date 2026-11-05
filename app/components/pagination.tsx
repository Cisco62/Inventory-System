import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

// Display is set per use: arrows are always "inline-flex", page numbers
// "hidden sm:inline-flex" (mobile shows "Page X of Y" instead).
const segment =
  "relative h-9 min-w-9 items-center justify-center px-3 text-sm font-medium tabular-nums ring-1 ring-inset ring-slate-300 -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

function Arrow({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={`${segment} inline-flex cursor-not-allowed bg-slate-50 text-slate-300`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${segment} inline-flex bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900`}
    >
      {children}
    </Link>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  const pageCount = Math.max(1, totalPages);

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, value]) => value)
    );
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  return (
    <div className="flex items-center gap-3">
      <p className="whitespace-nowrap text-sm text-slate-500 sm:hidden">
        Page <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-900">{pageCount}</span>
      </p>

      <nav aria-label="Pagination" className="isolate inline-flex shadow-sm rounded-lg">
        <Arrow
          href={getPageUrl(currentPage - 1)}
          disabled={currentPage <= 1}
          label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Arrow>

        {/* Page numbers (hidden on small screens, where "Page X of Y" is shown) */}
        {getVisiblePages(currentPage, pageCount).map((page, idx) =>
          page === "..." ? (
            <span
              key={`dots-${idx}`}
              className={`${segment} hidden bg-white text-slate-400 sm:inline-flex`}
            >
              …
            </span>
          ) : page === currentPage ? (
            <span
              key={page}
              aria-current="page"
              className={`${segment} z-10 hidden bg-indigo-600 text-white ring-indigo-600 sm:inline-flex`}
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`${segment} hidden bg-white text-slate-700 hover:bg-slate-50 sm:inline-flex`}
            >
              {page}
            </Link>
          )
        )}

        <Arrow
          href={getPageUrl(currentPage + 1)}
          disabled={currentPage >= pageCount}
          label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Arrow>
      </nav>
    </div>
  );
}
