"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="flex justify-between">
              <div>
                <Skeleton className="mb-3 h-4 w-24" />
                <Skeleton className="mb-2 h-7 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="mb-6 h-4 w-48" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card>
          <Skeleton className="mb-6 h-5 w-28" />
          <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((card) => (
          <Card key={card}>
            <Skeleton className="mb-6 h-5 w-36" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="mb-1.5 h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function Loading() {
  const pathname = usePathname();
  const showSidebar = !["/", "/sign-in", "/sign-up"].includes(pathname);

  if (!showSidebar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Loading">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-10 lg:pt-10">
          <ContentSkeleton />
        </div>
      </main>
    </div>
  );
}
