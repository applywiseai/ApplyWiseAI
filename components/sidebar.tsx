"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserRound,
  BriefcaseBusiness,
  FileText,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type User = {
  id: string;
  role: string;
  full_name?: string | null;
  email?: string | null;
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user.role === "ADMIN";

  const adminItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Client Profiles",
      href: "/admin/profiles",
      icon: UserRound,
    },
    {
      label: "Applications",
      href: "/admin/applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "Generated Resumes",
      href: "/admin/resumes",
      icon: FileText,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const userItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Applications",
      href: "/applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Profiles",
      href: "/profiles",
      icon: UserRound,
    },
  ];

  const items = isAdmin ? adminItems : userItems;

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await createClient().auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">
              ApplyWise AI
            </div>
            <div className="text-[10px] text-slate-500">
              Career Intelligence
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-100 px-5">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Sparkles size={19} />
            </div>

            <div>
              <div className="font-bold tracking-tight text-slate-950">
                ApplyWise AI
              </div>
              <div className="text-[11px] text-slate-500">
                Career Intelligence
              </div>
            </div>
          </Link>
        </div>

        {/* Quick action */}
        <div className="px-4 pt-5">
          <Link
            href="/applications/new"
            onClick={() => setOpen(false)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus size={17} />
            New Application
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-700"
                  }
                />

                <span className="flex-1">{item.label}</span>

                {active && <ChevronRight size={15} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                {(user.full_name || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user.full_name || "User"}
                </div>

                <div className="truncate text-xs text-slate-500">
                  {user.email || ""}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                {isAdmin ? "Administrator" : "User"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={17} />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
