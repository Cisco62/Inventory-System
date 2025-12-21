"use client";

import { Trash2, X } from "lucide-react";

interface DeleteProductModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteProductModal({
  productName,
  onConfirm,
  onCancel,
}: DeleteProductModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Product
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{productName}"</span>?
            This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

