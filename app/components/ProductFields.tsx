"use client";

import { AlertCircle } from "lucide-react";
import type { ProductField, ProductFormState } from "../lib/actions/products";
import { inputClass } from "./ui";

type Values = Partial<Record<ProductField, string>>;

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: ProductField;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

/**
 * Product inputs shared by the add and edit forms. Uncontrolled: pass
 * `defaults` for initial values, and a changing `key` on the parent form
 * to reset them.
 */
export default function ProductFields({
  defaults = {},
  state,
}: {
  defaults?: Values;
  state?: ProductFormState;
}) {
  const errors = state?.fieldErrors ?? {};
  const values = { ...defaults, ...state?.values };

  const a11y = (id: ProductField) => ({
    id,
    name: id,
    defaultValue: values[id] ?? "",
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
    className: inputClass(Boolean(errors[id])),
  });

  return (
    <>
      <Field id="name" label="Product name *" error={errors.name}>
        <input type="text" required placeholder="Enter product name" {...a11y("name")} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="price" label="Selling price (₦) *" error={errors.price}>
          <input type="number" min="0" step="0.01" required placeholder="0.00" {...a11y("price")} />
        </Field>
        <Field
          id="costPrice"
          label="Cost price (₦, optional)"
          error={errors.costPrice}
          hint="What one unit costs you. Used for profit."
        >
          <input type="number" min="0" step="0.01" placeholder="0.00" {...a11y("costPrice")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="quantity" label="Quantity *" error={errors.quantity}>
          <input type="number" min="0" step="1" required placeholder="0" {...a11y("quantity")} />
        </Field>
        <Field
          id="lowStockAt"
          label="Low stock alert (optional)"
          error={errors.lowStockAt}
          hint="Marked low at or below this. Default 5."
        >
          <input type="number" min="0" step="1" placeholder="5" {...a11y("lowStockAt")} />
        </Field>
      </div>

      <Field
        id="sku"
        label="SKU (optional)"
        error={errors.sku}
        hint="Your own code for this product."
      >
        <input type="text" placeholder="e.g. COKE-50CL" {...a11y("sku")} />
      </Field>
    </>
  );
}
