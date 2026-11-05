"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">{children}</div>
  );
}

function MainContentSkeleton({ showSidebar }: { showSidebar: boolean }) {
  return (
    <main
      className={
        showSidebar ? "px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:p-8" : "p-4 sm:p-8"
      }
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="mb-8">
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <Skeleton className="mb-6 h-6 w-28" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-4">
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Skeleton className="mb-6 h-6 w-48" />
          <Skeleton className="h-56 w-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <Skeleton className="mb-6 h-6 w-28" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Skeleton className="mb-6 h-6 w-28" />
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
            <div className="w-full space-y-3 sm:w-48">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function Loading() {
  const pathname = usePathname();
  const showSidebar = !["/", "/sign-in", "/sign-up"].includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <MainContentSkeleton showSidebar={showSidebar} />
    </div>
  );
}
