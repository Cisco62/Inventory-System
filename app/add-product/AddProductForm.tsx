"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import ProductFields, { FormError } from "../components/ProductFields";
import { createProduct, type ProductFormState } from "../lib/actions/products";

export default function AddProductForm() {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  return (
    <form className="space-y-6" action={formAction}>
      <FormError message={state.error} />
      <ProductFields state={state} />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Adding…" : "Add Product"}
        </button>
        <Link
          href="/inventory"
          className="rounded-lg bg-gray-200 px-6 py-3 text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
