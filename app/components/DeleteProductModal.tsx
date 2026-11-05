"use client";

import { Loader2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { buttonClass } from "./ui";

interface DeleteProductModalProps {
  productName: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteProductModal({
  productName,
  pending = false,
  onConfirm,
  onCancel,
}: DeleteProductModalProps) {
  return (
    <Modal
      title="Delete product"
      icon={Trash2}
      tone="red"
      onClose={onCancel}
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-900">&ldquo;{productName}&rdquo;</span>?
          This can&rsquo;t be undone.
        </>
      }
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={pending} className={buttonClass("secondary")}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={pending} className={buttonClass("danger")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Deleting…" : "Delete product"}
        </button>
      </div>
    </Modal>
  );
}
