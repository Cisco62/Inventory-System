import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Match Stack Auth's sign-in and account screens to the app's indigo accent.
const stackTheme = {
  light: {
    primary: "hsl(243 75% 59%)",
    primaryForeground: "hsl(0 0% 100%)",
    ring: "hsl(243 75% 59%)",
  },
  radius: "0.5rem",
};

export const metadata: Metadata = {
  title: {
    default: "Inventory System",
    template: "%s | Inventory System",
  },
  description:
    "Track products, monitor stock levels, and get insights into your inventory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <StackProvider app={stackClientApp}>
          <StackTheme theme={stackTheme}>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px -6px rgba(15, 23, 42, 0.15)",
                  color: "#0f172a",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
