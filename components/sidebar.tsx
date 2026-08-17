"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "USER";
  is_active: boolean;
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const links = [
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
    ...(user.role === "ADMIN"
      ? [
          {
            label: "Profiles",
            href: "/admin/profiles",
            icon: Users,
          },
          {
            label: "Resumes",
            href: "/admin/resumes",
            icon: FileText,
          },
        ]
      : []),
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-white/10 bg-[#07111f] text-white lg:flex">
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <Sparkles
                size={20}
                strokeWidth={2.2}
                className="text-white"
              />
            </div>

            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-white">
                ApplyWise
              </div>

              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI Workspace
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;

              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" &&
                  pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-500/[0.12] text-blue-300"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2.5 h-6 w-0.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={
                      active
                        ? "text-blue-400"
                        : "text-slate-500 transition-colors group-hover:text-slate-300"
                    }
                  />

                  <span>{link.label}</span>

                  {active && (
                    <ChevronRight
                      size={14}
                      className="ml-auto text-blue-400/70"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/10">
                {(user.full_name || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {user.full_name || "User"}
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  {user.role === "ADMIN"
                    ? "Administrator"
                    : "Team member"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/10 bg-[#07111f]/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
            <Sparkles size={16} className="text-white" />
          </div>

          <span className="text-sm font-bold text-white">
            ApplyWise
          </span>
        </Link>
      </header>
    </>
  );
}
