import { STOCK_STATUS_LABELS, type StockStatus } from "../lib/inventory";

const styles: Record<StockStatus, string> = {
  in: "bg-green-50 text-green-700 ring-green-600/20",
  low: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  out: "bg-red-50 text-red-700 ring-red-600/20",
};

const dots: Record<StockStatus, string> = {
  in: "bg-green-500",
  low: "bg-yellow-500",
  out: "bg-red-500",
};

export default function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}
