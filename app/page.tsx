import Link from "next/link";
import { BarChart3, Bell, FileDown, Package } from "lucide-react";
import { stackServerApp } from "@/stack/server";

const features = [
  {
    icon: Package,
    title: "Track every product",
    text: "Keep names, SKUs, prices and quantities in one searchable list.",
  },
  {
    icon: Bell,
    title: "Catch low stock early",
    text: "Set a threshold per product and see what needs restocking at a glance.",
  },
  {
    icon: BarChart3,
    title: "See the big picture",
    text: "Dashboards for total value, stock health and new products over time.",
  },
  {
    icon: FileDown,
    title: "Export anytime",
    text: "Download your inventory as a CSV for spreadsheets or accounting.",
  },
];

export default async function Home() {
  const user = await stackServerApp.getUser();
  const cta = user
    ? { href: "/dashboard", label: "Go to Dashboard" }
    : { href: "/sign-in", label: "Get Started" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold text-gray-900">
            Inventory System
          </span>
        </div>
        <Link
          href={user ? "/dashboard" : "/sign-in"}
          className="text-sm font-medium text-gray-700 hover:text-blue-700"
        >
          {user ? "Dashboard" : "Sign in"}
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Inventory management that stays out of your way
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Track products, monitor stock levels, and know exactly what your
            inventory is worth, all in one place.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href={cta.href}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {cta.label}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Icon className="h-5 w-5 text-blue-600" />
              </span>
              <h2 className="mt-4 font-semibold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
