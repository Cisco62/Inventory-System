"use client";

import { UserButton } from "@stackframe/stack";
import {
  Boxes,
  LayoutDashboard,
  Menu,
  Package,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Add Product", href: "/add-product", icon: PlusCircle },
];

const secondary = [{ name: "Settings", href: "/settings", icon: Settings }];

export function BrandMark({
  href = "/dashboard",
  light = false,
}: {
  href?: string;
  light?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${
          light ? "bg-white/15 ring-1 ring-inset ring-white/25" : "bg-indigo-600"
        }`}
      >
        <Boxes className="h-4.5 w-4.5 text-white" />
      </span>
      <span
        className={`text-[15px] font-semibold tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        Inventory
      </span>
    </Link>
  );
}

function NavItem({
  item,
  active,
  onNavigate,
}: {
  item: (typeof navigation)[number];
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${
          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
        }`}
      />
      {item.name}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <BrandMark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <BrandMark />
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6" aria-label="Main">
          <div className="space-y-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Inventory
            </p>
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={pathname === item.href}
                onNavigate={close}
              />
            ))}
          </div>
          <div className="space-y-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Account
            </p>
            {secondary.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={pathname === item.href}
                onNavigate={close}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <UserButton showUserInfo />
        </div>
      </aside>
    </>
  );
}
