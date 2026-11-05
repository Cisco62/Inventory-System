"use client";

import { Edit, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import type { ProductFormState } from "../lib/actions/products";
import ProductFields, { FormError } from "./ProductFields";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string | null;
  lowStockAt: number | null;
}

interface UpdateProductModalProps {
  product: Product;
  state: ProductFormState;
  pending: boolean;
  onConfirm: (formData: FormData) => void;
  onCancel: () => void;
}

export default function UpdateProductModal({
  product,
  state,
  pending,
  onConfirm,
  onCancel,
}: UpdateProductModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("id", product.id);
    onConfirm(form);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-product-title"
          className="pointer-events-auto mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        >
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <h3 id="update-product-title" className="text-lg font-semibold text-gray-900">
                  Edit Product
                </h3>
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close"
                className="text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormError message={state.error} />
              <ProductFields
                state={state}
                defaults={{
                  name: product.name,
                  price: String(product.price),
                  quantity: String(product.quantity),
                  sku: product.sku ?? "",
                  lowStockAt: product.lowStockAt?.toString() ?? "",
                }}
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={pending}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {pending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
