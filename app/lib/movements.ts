// Client-safe (no Prisma import): labels and styles for stock movement types.

export type MovementType = "INITIAL" | "RECEIVED" | "SOLD" | "DAMAGED" | "ADJUSTED";

/** Types a user can record from the "Adjust stock" dialog. */
export const ADJUSTABLE_TYPES = ["RECEIVED", "SOLD", "DAMAGED"] as const;
export type AdjustableType = (typeof ADJUSTABLE_TYPES)[number];

export const MOVEMENT_META: Record<
  MovementType,
  { label: string; verb: string; direction: 1 | -1 | 0; badge: string; dot: string }
> = {
  INITIAL: {
    label: "Opening stock",
    verb: "Added to inventory",
    direction: 1,
    badge: "bg-slate-100 text-slate-700 ring-slate-500/20",
    dot: "bg-slate-400",
  },
  RECEIVED: {
    label: "Received",
    verb: "Received",
    direction: 1,
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    dot: "bg-indigo-500",
  },
  SOLD: {
    label: "Sold",
    verb: "Sold",
    direction: -1,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  DAMAGED: {
    label: "Damaged / lost",
    verb: "Removed as damaged or lost",
    direction: -1,
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },
  ADJUSTED: {
    label: "Adjusted",
    verb: "Quantity corrected",
    direction: 0,
    badge: "bg-amber-50 text-amber-800 ring-amber-600/20",
    dot: "bg-amber-500",
  },
};

export function formatChange(change: number) {
  return change > 0 ? `+${change}` : String(change);
}
