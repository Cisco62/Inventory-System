import type { Metadata } from "next";
import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <BarChart3 className="h-6 w-6 text-white" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Welcome to Inventory System
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to manage your products and stock.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SignIn />
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
