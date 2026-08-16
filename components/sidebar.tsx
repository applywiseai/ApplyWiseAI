"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SidebarUser = {
  full_name?: string | null;
  email?: string | null;
  role: "ADMIN" | "USER";
};

type SidebarProps = {
  user: SidebarUser;
};

const adminItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "♙",
  },
  {
    label: "Client Profiles",
    href: "/profiles",
    icon: "◎",
  },
  {
    label: "Applications",
    href: "/applications",
    icon: "▣",
  },
  {
    label: "Generated Resumes",
    href: "/resumes",
    icon: "▤",
  },
];

const userItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "My Profiles",
    href: "/profiles",
    icon: "◎",
  },
  {
    label: "Applications",
    href: "/applications",
    icon: "▣",
  },
  {
    label: "Generated Resumes",
    href: "/resumes",
    icon: "▤",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user.role === "ADMIN" ? adminItems : userItems;

  const initials =
    user.full_name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            ✦
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight text-slate-950">
              ApplyWise AI
            </div>
            <div className="text-[10px] font-medium text-slate-400">
              Career Intelligence
            </div>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-95"
        >
          {mobileOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200/80 bg-white",
          "shadow-[12px_0_40px_rgba(15,23,42,0.04)]",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-[82px] items-center border-b border-slate-100 px-6">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-3"
          >
            <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-slate-950 text-lg text-white shadow-lg shadow-slate-950/10 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
              <span className="relative z-10">✦</span>

              <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/10 blur-md" />
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-tight text-slate-950">
                ApplyWise AI
              </div>
              <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-slate-400">
                CAREER INTELLIGENCE
              </div>
            </div>
          </Link>
        </div>

        {/* New application */}
        <div className="px-4 pt-5">
          <Link
            href="/applications/new"
            onClick={() => setMobileOpen(false)}
            className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/15 active:translate-y-0 active:scale-[0.985]"
          >
            <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
              +
            </span>

            <span>New Application</span>

            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-7">
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium",
                    "transition-all duration-200 ease-out",
                    active
                      ? "bg-slate-100 text-slate-950 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
                  ].join(" ")}
                >
                  {/* Animated active indicator */}
                  <span
                    className={[
                      "absolute left-0 h-6 w-[3px] rounded-r-full bg-slate-950 transition-all duration-200",
                      active
                        ? "scale-y-100 opacity-100"
                        : "scale-y-0 opacity-0",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "grid h-8 w-8 place-items-center rounded-lg text-base transition-all duration-200",
                      active
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 group-hover:bg-white group-hover:text-slate-700",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.label}</span>

                  <span
                    className={[
                      "text-xs transition-all duration-200",
                      active
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60",
                    ].join(" ")}
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Small workspace card */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Workspace
              </span>

              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]" />
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Your workspace is ready for new applications and tailored
              resumes.
            </p>
          </div>
        </div>

        {/* User area */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-bold text-slate-700 ring-4 ring-slate-50">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">
                {user.full_name || user.email || "User"}
              </div>

              <div className="truncate text-xs text-slate-400">
                {user.email || ""}
              </div>

              <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-slate-500">
                {user.role === "ADMIN" ? "ADMINISTRATOR" : "USER"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/signout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.985]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-base transition-colors group-hover:bg-white">
              ↪
            </span>

            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
