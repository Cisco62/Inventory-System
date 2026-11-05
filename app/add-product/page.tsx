import type { Metadata } from "next";
import PageShell from "../components/PageShell";
import { getCurrentUser } from "../lib/auth";
import AddProductForm from "./AddProductForm";

export const metadata: Metadata = { title: "Add Product" };

export default async function AddProductPage() {
  await getCurrentUser();

  return (
    <PageShell title="Add Product" description="Add a new product to your inventory.">
      <div className="max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <AddProductForm />
        </div>
      </div>
    </PageShell>
  );
}
