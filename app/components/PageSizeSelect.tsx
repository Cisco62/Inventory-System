"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZES } from "../lib/pagination";

export default function PageSizeSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const size = Number(e.target.value);
    if (size === PAGE_SIZES[0]) params.delete("pageSize");
    else params.set("pageSize", String(size));
    params.delete("page"); // back to the first page
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      <span className="hidden sm:inline">Rows per page</span>
      <span className="relative">
        <select
          value={value}
          onChange={onChange}
          aria-label="Rows per page"
          className="h-9 cursor-pointer appearance-none rounded-lg bg-white pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}
