import type { Metadata } from "next";
import { AccountSettings } from "@stackframe/stack";
import PageShell from "../components/PageShell";
import { getCurrentUser } from "../lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await getCurrentUser();

  return (
    <PageShell
      title="Settings"
      description="Manage your account settings and preferences."
    >
      <div className="max-w-6xl">
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <AccountSettings fullPage />
        </div>
      </div>
    </PageShell>
  );
}
