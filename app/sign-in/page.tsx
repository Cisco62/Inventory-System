import type { Metadata } from "next";
import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Bell, Package } from "lucide-react";
import { BrandMark } from "../components/Sidebar";

export const metadata: Metadata = { title: "Sign In" };

const highlights = [
  { icon: Package, text: "All your products in one searchable list" },
  { icon: Bell, text: "Low stock alerts before you run out" },
  { icon: BarChart3, text: "Inventory value and stock health at a glance" },
];

export default async function SignInPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-indigo-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-500/40 blur-3xl"
        />
        <div className="relative">
          <BrandMark href="/" light />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Stay on top of your stock.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-indigo-200">
          © {new Date().getFullYear()} Inventory System
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col bg-white px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <BrandMark href="/" />
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
