"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateProduct, type ProductFormState } from "../lib/actions/products";
import UpdateProductModal from "./UpdateProductModal";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string | null;
  lowStockAt: number | null;
}

export default function UpdateProductButton({ product }: { product: Product }) {
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [state, setState] = useState<ProductFormState>({});
  const router = useRouter();

  const open = () => {
    setState({});
    setShowModal(true);
  };

  const handleUpdate = async (formData: FormData) => {
    setIsUpdating(true);
    try {
      const result = await updateProduct(formData);
      if (result.error) {
        setState(result);
        return;
      }
      toast.success("Product updated successfully");
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      setState({ error: "Could not update the product. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
        title="Edit product"
        aria-label={`Edit ${product.name}`}
      >
        <Pencil className="h-4 w-4" />
      </button>

      {showModal && (
        <UpdateProductModal
          product={product}
          state={state}
          pending={isUpdating}
          onConfirm={handleUpdate}
          onCancel={() => !isUpdating && setShowModal(false)}
        />
      )}
    </>
  );
}
