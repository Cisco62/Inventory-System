import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  FileDown,
  Package,
} from "lucide-react";
import { stackServerApp } from "@/stack/server";
import { BrandMark } from "./components/Sidebar";
import { buttonClass, IconTile } from "./components/ui";

const features = [
  {
    icon: Package,
    title: "Every product in one place",
    text: "Names, SKUs, prices and quantities in a fast, searchable list.",
  },
  {
    icon: Bell,
    title: "Low stock alerts",
    text: "Set a threshold per product and see what needs restocking at a glance.",
  },
  {
    icon: BarChart3,
    title: "Clear insights",
    text: "Inventory value, stock health and new products over time.",
  },
  {
    icon: FileDown,
    title: "Export to CSV",
    text: "Download your inventory for spreadsheets or accounting in one click.",
  },
];

const points = ["Works on any device", "Secure sign-in", "Export your data anytime"];

export default async function Home() {
  const user = await stackServerApp.getUser();
  const cta = user
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/sign-in", label: "Get started" };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-0 flex justify-center blur-3xl"
      >
        <div className="aspect-[3/2] w-[56rem] bg-gradient-to-tr from-indigo-200 via-sky-100 to-violet-200 opacity-60 [clip-path:polygon(25%_0%,100%_20%,85%_100%,0%_75%)]" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <BrandMark href="/" />
        <Link href={cta.href} className={buttonClass("secondary", "sm")}>
          {user ? "Dashboard" : "Sign in"}
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
            Inventory management, simplified
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Know what&rsquo;s in stock.{" "}
            <span className="text-indigo-600">Always.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Track products, catch low stock before it becomes a problem, and see
            exactly what your inventory is worth, all in one place.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={cta.href} className={buttonClass("primary", "lg")}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <IconTile icon={icon} />
              <h2 className="mt-5 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Inventory System
      </footer>
    </div>
  );
}
