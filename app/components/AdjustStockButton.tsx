"use client";

import { ArrowDownToLine, ArrowRight, ArrowUpDown, Loader2, PackageMinus, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { adjustStock, type AdjustStockState } from "../lib/actions/stock";
import { formatNaira } from "../lib/format";
import { MOVEMENT_META, type AdjustableType } from "../lib/movements";
import Modal from "./Modal";
import { FormError } from "./ProductFields";
import { buttonClass, inputClass } from "./ui";

const OPTIONS: { type: AdjustableType; label: string; hint: string; icon: LucideIcon }[] = [
  { type: "RECEIVED", label: "Received", hint: "Delivery or restock", icon: ArrowDownToLine },
  { type: "SOLD", label: "Sold", hint: "Sold to a customer", icon: ShoppingCart },
  { type: "DAMAGED", label: "Damaged", hint: "Damaged, expired or lost", icon: PackageMinus },
];

const selected: Record<AdjustableType, string> = {
  RECEIVED: "ring-2 ring-indigo-600 bg-indigo-50/60",
  SOLD: "ring-2 ring-emerald-600 bg-emerald-50/60",
  DAMAGED: "ring-2 ring-red-600 bg-red-50/60",
};

const iconTone: Record<AdjustableType, string> = {
  RECEIVED: "text-indigo-600",
  SOLD: "text-emerald-600",
  DAMAGED: "text-red-600",
};

type AdjustProduct = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  costPrice: number | null;
};

function AdjustStockModal({
  product,
  initialType,
  onClose,
}: {
  product: AdjustProduct;
  initialType: AdjustableType;
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<AdjustableType>(initialType);
  const [amount, setAmount] = useState("");
  // Per-unit money field: sale price for SOLD, cost for RECEIVED.
  const [unitAmount, setUnitAmount] = useState<Record<AdjustableType, string>>({
    SOLD: String(product.price),
    RECEIVED: product.costPrice != null ? String(product.costPrice) : "",
    DAMAGED: "",
  });
  const [state, setState] = useState<AdjustStockState>({});
  const [pending, setPending] = useState(false);

  const n = Number(amount);
  const valid = Number.isInteger(n) && n > 0;
  const direction = MOVEMENT_META[type].direction;
  const after = valid ? product.quantity + direction * n : product.quantity;
  const tooMany = valid && after < 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("productId", product.id);
    form.set("type", type);
    if (type === "DAMAGED") form.delete("unitAmount");
    setPending(true);
    try {
      const result = await adjustStock(form);
      if (result.error) {
        setState(result);
        return;
      }
      toast.success(
        `${MOVEMENT_META[type].label} ${n} × ${product.name}. Now ${result.quantityAfter} in stock.`
      );
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      setState({ error: "Could not update stock. Please try again." });
    } finally {
      setPending(false);
    }
  };

  const unit = Number(unitAmount[type]);
  const hasUnit = unitAmount[type].trim() !== "" && Number.isFinite(unit) && unit >= 0;
  const total = valid && hasUnit ? n * unit : null;

  const amountError = state.fieldErrors?.amount ?? (tooMany ? `Only ${product.quantity} in stock.` : undefined);

  return (
    <Modal
      title="Adjust stock"
      description={product.name}
      icon={ArrowUpDown}
      onClose={() => !pending && onClose()}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!state.fieldErrors && <FormError message={state.error} />}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">What happened?</legend>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map(({ type: t, label, hint, icon: Icon }) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                title={hint}
                className={`flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-sm font-medium ring-1 ring-inset transition cursor-pointer ${
                  type === t ? `${selected[t]} text-slate-900` : "ring-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${type === t ? iconTone[t] : "text-slate-400"}`} />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {OPTIONS.find((o) => o.type === type)?.hint}
          </p>
        </fieldset>

        <div>
          <label htmlFor="adjust-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input
            id="adjust-amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            required
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (state.error) setState({});
            }}
            placeholder="0"
            aria-invalid={amountError ? true : undefined}
            className={inputClass(Boolean(amountError))}
          />
          {amountError && <p className="mt-1.5 text-sm text-red-600">{amountError}</p>}
        </div>

        {type !== "DAMAGED" && (
          <div>
            <label htmlFor="adjust-unit" className="mb-1.5 block text-sm font-medium text-slate-700">
              {type === "SOLD" ? "Sale price per unit (₦)" : "Cost per unit (₦)"}{" "}
              {type === "RECEIVED" && <span className="font-normal text-slate-400">(optional)</span>}
            </label>
            <input
              id="adjust-unit"
              name="unitAmount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required={type === "SOLD"}
              value={unitAmount[type]}
              onChange={(e) => setUnitAmount({ ...unitAmount, [type]: e.target.value })}
              placeholder="0.00"
              aria-invalid={state.fieldErrors?.unitAmount ? true : undefined}
              className={inputClass(Boolean(state.fieldErrors?.unitAmount))}
            />
            {state.fieldErrors?.unitAmount ? (
              <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors.unitAmount}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                {type === "SOLD"
                  ? "Change this if you sold at a different price."
                  : "Also updates the product's cost price."}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="adjust-note" className="mb-1.5 block text-sm font-medium text-slate-700">
            Note <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="adjust-note"
            name="note"
            type="text"
            maxLength={200}
            placeholder={type === "RECEIVED" ? "e.g. Supplier delivery" : type === "SOLD" ? "e.g. Walk-in customer" : "e.g. Broken bottles"}
            className={inputClass(Boolean(state.fieldErrors?.note))}
          />
          {state.fieldErrors?.note && <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors.note}</p>}
        </div>

        {/* Before → after preview */}
        <div className="flex items-center justify-center gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <div className="text-center">
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900">{product.quantity}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="text-center">
            <p className="text-xs text-slate-500">After</p>
            <p
              className={`text-lg font-semibold tabular-nums ${
                tooMany ? "text-red-600" : valid ? (direction > 0 ? "text-indigo-600" : "text-emerald-700") : "text-slate-400"
              }`}
            >
              {valid ? after : "—"}
            </p>
          </div>
          {total != null && type !== "DAMAGED" && (
            <>
              <span className="h-8 w-px bg-slate-200" aria-hidden="true" />
              <div className="text-center">
                <p className="text-xs text-slate-500">{type === "SOLD" ? "Sale total" : "Total cost"}</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  {formatNaira(total, { whole: total >= 1000 })}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={pending} className={buttonClass("secondary")}>
            Cancel
          </button>
          <button type="submit" disabled={pending || !valid || tooMany} className={buttonClass("primary")}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdjustStockButton({
  product,
  initialType = "SOLD",
  variant = "icon",
}: {
  product: AdjustProduct;
  initialType?: AdjustableType;
  variant?: "icon" | "button";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
          title="Adjust stock"
          aria-label={`Adjust stock for ${product.name}`}
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary")}>
          <ArrowUpDown className="h-4 w-4" />
          Adjust stock
        </button>
      )}
      {open && (
        <AdjustStockModal product={product} initialType={initialType} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
