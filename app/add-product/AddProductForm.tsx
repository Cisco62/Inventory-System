"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import ProductFields, { FormError } from "../components/ProductFields";
import { buttonClass } from "../components/ui";
import { createProduct, type ProductFormState } from "../lib/actions/products";

export default function AddProductForm() {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  return (
    <form action={formAction}>
      <div className="space-y-5 p-5 sm:p-6">
        <FormError message={state.error} />
        <ProductFields state={state} />
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Link href="/inventory" className={buttonClass("secondary")}>
          Cancel
        </Link>
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Adding…" : "Add product"}
        </button>
      </div>
    </form>
  );
}
