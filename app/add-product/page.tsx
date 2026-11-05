import type { Metadata } from "next";
import { AlertTriangle, Barcode, Lightbulb } from "lucide-react";
import PageShell from "../components/PageShell";
import { Card, IconTile } from "../components/ui";
import { getCurrentUser } from "../lib/auth";
import AddProductForm from "./AddProductForm";

export const metadata: Metadata = { title: "Add Product" };

const tips = [
  {
    icon: Barcode,
    title: "Use SKUs",
    text: "A short code like COKE-50CL makes products easy to search and export.",
  },
  {
    icon: AlertTriangle,
    title: "Set a low stock alert",
    text: "Products at or below this quantity are flagged on your dashboard. If left empty, 5 is used.",
  },
];

export default async function AddProductPage() {
  await getCurrentUser();

  return (
    <PageShell title="Add product" description="Add a new product to your inventory.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padded={false} className="lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">Product details</h2>
            <p className="mt-0.5 text-sm text-slate-500">Fields marked * are required.</p>
          </div>
          <AddProductForm />
        </Card>

        <Card className="h-fit">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Tips
          </div>
          <ul className="space-y-4">
            {tips.map((tip) => (
              <li key={tip.title} className="flex gap-3">
                <IconTile icon={tip.icon} tone="slate" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{tip.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{tip.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
