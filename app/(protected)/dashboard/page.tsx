import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  UserRound,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Dashboard() {
  const user = await requireUser();
  const db = createAdminClient();

  const profiles =
    user.role === "ADMIN"
      ? await db
          .from("client_profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
      : await db
          .from("user_profile_assignments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

  const apps =
    user.role === "ADMIN"
      ? await db
          .from("applications")
          .select(
            "id,status,job_title,company,created_at",
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .limit(6)
      : await db
          .from("applications")
          .select(
            "id,status,job_title,company,created_at",
            { count: "exact" }
          )
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(6);

  const resumes =
    user.role === "ADMIN"
      ? await db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
      : await db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id);

  const stats = [
    {
      label:
        user.role === "ADMIN"
          ? "Client Profiles"
          : "Assigned Profiles",
      value: profiles.count || 0,
      icon: UserRound,
      href:
        user.role === "ADMIN"
          ? "/admin/profiles"
          : "/profiles",
    },
    {
      label: "Applications",
      value: apps.count || 0,
      icon: BriefcaseBusiness,
      href: "/applications",
    },
    {
      label: "Resumes Generated",
      value: resumes.count || 0,
      icon: FileText,
      href:
        user.role === "ADMIN"
          ? "/admin/resumes"
          : "/applications",
    },
  ];

  return (
    <div className="w-full space-y-7 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-br from-[#0d2038] via-[#0b1a2e] to-[#081321] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/10 bg-blue-400/5 px-3 py-1.5 text-[11px] font-semibold text-blue-300">
              <Sparkles size={13} />

              {user.role === "ADMIN"
                ? "Admin workspace"
                : "AI workspace"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome, {user.full_name || "there"} 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Manage your job applications and create
              intelligent, targeted resumes from one place.
            </p>
          </div>

          <Link
            href="/applications/new"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/30 active:translate-y-0"
          >
            <Plus size={17} />

            New Application

            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid w-full gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="min-w-0"
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c192b] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-[#0e1d32] hover:shadow-xl hover:shadow-black/20">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-blue-500/10" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                      {stat.value}
                    </p>

                    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition group-hover:text-blue-400">
                      View details

                      <ArrowUpRight size={13} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-400/10 bg-blue-500/10 p-3 text-blue-400 transition-all duration-200 group-hover:bg-blue-500/15 group-hover:text-blue-300">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Applications */}
      <section className="w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c192b] shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white">
                Recent Applications
              </h2>

              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                Latest
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Your latest application activity.
            </p>
          </div>

          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-blue-400"
          >
            View all

            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.015] text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                <th className="px-6 py-4">
                  Position
                </th>

                <th className="px-6 py-4">
                  Company
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Created
                </th>

                <th className="px-6 py-4" />
              </tr>
            </thead>

            <tbody>
              {(apps.data || []).map((application: any) => (
                <tr
                  key={application.id}
                  className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-slate-200 transition hover:text-blue-400"
                    >
                      {application.job_title ||
                        "Untitled position"}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {application.company || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      status={application.status}
                    />
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {application.created_at
                      ? new Date(
                          application.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${application.id}`}
                      className="inline-flex rounded-lg border border-white/[0.06] p-2 text-slate-600 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}

              {!apps.data?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <BriefcaseBusiness
                          size={22}
                          className="text-slate-600"
                        />
                      </div>

                      <p className="mt-4 font-semibold text-slate-300">
                        No applications yet
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Start by adding a public job URL.
                      </p>

                      <Link
                        href="/applications/new"
                        className="mt-4 text-xs font-bold text-blue-400 transition hover:text-blue-300"
                      >
                        Create your first application →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer insight */}
      <div className="flex items-center gap-2 px-1 text-xs text-slate-600">
        <TrendingUp size={13} />

        Keep your applications updated to track your progress.
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Draft:
      "border-slate-400/10 bg-slate-400/5 text-slate-400",

    "Job Extracted":
      "border-blue-400/10 bg-blue-400/10 text-blue-400",

    "Resume Ready":
      "border-violet-400/10 bg-violet-400/10 text-violet-400",

    Applied:
      "border-cyan-400/10 bg-cyan-400/10 text-cyan-400",

    Interview:
      "border-amber-400/10 bg-amber-400/10 text-amber-400",

    Rejected:
      "border-red-400/10 bg-red-400/10 text-red-400",

    Offer:
      "border-emerald-400/10 bg-emerald-400/10 text-emerald-400",

    Withdrawn:
      "border-slate-400/10 bg-slate-400/5 text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] ||
        "border-slate-400/10 bg-slate-400/5 text-slate-400"
      }`}
    >
      {status || "Draft"}
    </span>
  );
}
