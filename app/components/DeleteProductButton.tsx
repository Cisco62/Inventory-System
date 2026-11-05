"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "../lib/actions/products";
import DeleteProductModal from "./DeleteProductModal";
import toast from "react-hot-toast";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", productId);
      await deleteProduct(formData);
      toast.success("Product deleted successfully");
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
        title="Delete product"
        aria-label={`Delete ${productName}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showModal && (
        <DeleteProductModal
          productName={productName}
          pending={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => !isDeleting && setShowModal(false)}
        />
      )}
    </>
  );
}

