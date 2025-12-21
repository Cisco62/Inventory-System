"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "../lib/actions/products";
import UpdateProductModal from "./UpdateProductModal";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string | null;
  lowStockAt: number | null;
}

interface UpdateProductButtonProps {
  product: Product;
}

export default function UpdateProductButton({
  product,
}: UpdateProductButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdate = async (formData: FormData) => {
    setIsUpdating(true);
    try {
      await updateProduct(formData);
      toast.success("Product updated successfully", { duration: 4000 });
      router.refresh();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-blue-600 hover:text-blue-900 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
        title="Update product"
        disabled={isUpdating}
      >
        <Pencil className="w-5 h-5" />
      </button>

      {showModal && (
        <UpdateProductModal
          product={product}
          onConfirm={handleUpdate}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

