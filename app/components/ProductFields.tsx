"use client";

import type { ProductField, ProductFormState } from "../lib/actions/products";

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
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
  }`;
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
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
      <Field id="name" label="Product Name *" error={errors.name}>
        <input type="text" required placeholder="Enter product name" {...a11y("name")} />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field id="quantity" label="Quantity *" error={errors.quantity}>
          <input type="number" min="0" step="1" required placeholder="0" {...a11y("quantity")} />
        </Field>
        <Field id="price" label="Price (₦) *" error={errors.price}>
          <input type="number" min="0" step="0.01" required placeholder="0.00" {...a11y("price")} />
        </Field>
      </div>

      <Field
        id="sku"
        label="SKU (optional)"
        error={errors.sku}
        hint="A unique code you use to identify this product."
      >
        <input type="text" placeholder="e.g. TSHIRT-RED-M" {...a11y("sku")} />
      </Field>

      <Field
        id="lowStockAt"
        label="Low Stock At (optional)"
        error={errors.lowStockAt}
        hint="Flag as low stock at or below this quantity. Defaults to 5."
      >
        <input type="number" min="0" step="1" placeholder="5" {...a11y("lowStockAt")} />
      </Field>
    </>
  );
}
