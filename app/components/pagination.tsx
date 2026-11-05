import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

const cell =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium tabular-nums";

function PageArrow({
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
      <span aria-disabled="true" aria-label={label} className={`${cell} cursor-not-allowed text-slate-300`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={`${cell} text-slate-600 hover:bg-slate-100 hover:text-slate-900`}>
      {children}
    </Link>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const delta = 1;
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, value]) => value)
    );
    params.set("page", String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PageArrow href={getPageUrl(currentPage - 1)} disabled={currentPage <= 1} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </PageArrow>

      {getVisiblePages(currentPage, totalPages).map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className={`${cell} text-slate-400`}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${cell} ${
              page === currentPage
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <PageArrow href={getPageUrl(currentPage + 1)} disabled={currentPage >= totalPages} label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </PageArrow>
    </nav>
  );
}
