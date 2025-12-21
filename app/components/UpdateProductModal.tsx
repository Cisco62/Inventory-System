"use client";

import { Edit, X } from "lucide-react";
import { useState } from "react";

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
  onConfirm: (formData: FormData) => void;
  onCancel: () => void;
}

export default function UpdateProductModal({
  product,
  onConfirm,
  onCancel,
}: UpdateProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: Number(product.price).toString(),
    quantity: product.quantity.toString(),
    sku: product.sku || "",
    lowStockAt: product.lowStockAt?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("id", product.id);
    form.append("name", formData.name);
    form.append("price", formData.price);
    form.append("quantity", formData.quantity);
    if (formData.sku) form.append("sku", formData.sku);
    if (formData.lowStockAt) form.append("lowStockAt", formData.lowStockAt);
    onConfirm(form);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Product
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter Product Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SKU (optional)
                </label>
                <input
                  type="text"
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label
                  htmlFor="lowStockAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Low Stock At (optional)
                </label>
                <input
                  type="number"
                  id="lowStockAt"
                  min="0"
                  value={formData.lowStockAt}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockAt: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter low stock threshold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

