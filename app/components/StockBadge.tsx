import { STOCK_STATUS_LABELS, type StockStatus } from "../lib/inventory";

const styles: Record<StockStatus, string> = {
  in: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  low: "bg-amber-50 text-amber-800 ring-amber-600/20",
  out: "bg-red-50 text-red-700 ring-red-600/20",
};

const dots: Record<StockStatus, string> = {
  in: "fill-emerald-500",
  low: "fill-amber-500",
  out: "fill-red-500",
};

export default function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <svg viewBox="0 0 6 6" aria-hidden="true" className={`h-1.5 w-1.5 ${dots[status]}`}>
        <circle cx="3" cy="3" r="3" />
      </svg>
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}
