import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { formatNaira } from "../lib/format";
import { formatChange, MOVEMENT_META, type MovementType } from "../lib/movements";

export type MovementRow = {
  id: string;
  type: MovementType;
  change: number;
  quantityAfter: number;
  note: string | null;
  createdAt: Date;
  unitPrice?: Prisma.Decimal | null;
  unitCost?: Prisma.Decimal | null;
  product?: { id: string; name: string };
};

// Server renders in UTC on Vercel; show times in Nigerian time.
const TIME_ZONE = "Africa/Lagos";

function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE }); // YYYY-MM-DD
}

function formatWhen(date: Date) {
  const now = new Date();
  const time = date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
  if (dayKey(date) === dayKey(now)) return `Today, ${time}`;
  if (dayKey(date) === dayKey(new Date(now.getTime() - 86_400_000))) return `Yesterday, ${time}`;
  const sameYear = dayKey(date).slice(0, 4) === dayKey(now).slice(0, 4);
  const day = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone: TIME_ZONE,
  });
  return `${day}, ${time}`;
}

function priceDetail(m: MovementRow) {
  if (m.type === "SOLD" && m.unitPrice != null) {
    return `@ ${formatNaira(m.unitPrice.toNumber())}`;
  }
  if (m.type === "RECEIVED" && m.unitCost != null) {
    return `@ ${formatNaira(m.unitCost.toNumber())} cost`;
  }
  return null;
}

export default function MovementList({
  movements,
  showProduct = false,
}: {
  movements: MovementRow[];
  showProduct?: boolean;
}) {
  return (
    <ul className="divide-y divide-slate-100 border-t border-slate-100">
      {movements.map((m) => {
        const meta = MOVEMENT_META[m.type];
        const changeTone =
          m.change > 0 ? "text-indigo-600" : m.change < 0 ? "text-slate-900" : "text-slate-500";
        return (
          <li key={m.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {showProduct && m.product ? (
                  <Link
                    href={`/inventory/${m.product.id}`}
                    className="truncate text-sm font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {m.product.name}
                  </Link>
                ) : null}
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {[formatWhen(m.createdAt), priceDetail(m), m.note].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-semibold tabular-nums ${changeTone}`}>
                {formatChange(m.change)}
              </p>
              <p className="text-xs tabular-nums text-slate-400">→ {m.quantityAfter}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
