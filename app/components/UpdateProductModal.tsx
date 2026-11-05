"use client";

import { Loader2, Pencil } from "lucide-react";
import type { ProductFormState } from "../lib/actions/products";
import Modal from "./Modal";
import ProductFields, { FormError } from "./ProductFields";
import { buttonClass } from "./ui";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("id", product.id);
    onConfirm(form);
  };

  return (
    <Modal
      title="Edit product"
      description={`Update the details for ${product.name}.`}
      icon={Pencil}
      size="lg"
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={pending} className={buttonClass("secondary")}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
