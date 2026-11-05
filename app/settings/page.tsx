import type { Metadata } from "next";
import { AccountSettings } from "@stackframe/stack";
import PageShell from "../components/PageShell";
import { Card } from "../components/ui";
import { getCurrentUser } from "../lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await getCurrentUser();

  return (
    <PageShell
      title="Settings"
      description="Manage your profile, sign-in methods and security."
    >
      <Card padded={false} className="overflow-hidden">
        <div className="p-2 sm:p-4">
          <AccountSettings fullPage />
        </div>
      </Card>
    </PageShell>
  );
}
