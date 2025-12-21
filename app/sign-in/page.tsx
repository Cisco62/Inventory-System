import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SignInPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-500">
      <div className="max-w-md w-full space-y-8">
        <SignIn />
        <Link href="/">Go Back Home</Link>
      </div>
    </div>
  );
}
