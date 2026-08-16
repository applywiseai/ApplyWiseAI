import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  UserRound,
  Plus,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge } from "@/components/ui";

export default async function Dashboard() {
  const user = await requireUser();
  const db = createAdminClient();

  const isAdmin = user.role === "ADMIN";

  // Run all dashboard queries in parallel.
  const [profiles, apps, resumes] = await Promise.all([
    isAdmin
      ? db
          .from("client_profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
      : db
          .from("user_profile_assignments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),

    isAdmin
      ? db
          .from("applications")
          .select("id,status,job_title,company,created_at", {
            count: "exact",
          })
          .order("created_at", { ascending: false })
          .limit(6)
      : db
          .from("applications")
          .select("id,status,job_title,company,created_at", {
            count: "exact",
          })
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(6),

    isAdmin
      ? db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
      : db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id),
  ]);

  const stats = [
    {
      label: isAdmin ? "Client Profiles" : "Assigned Profiles",
      value: profiles.count || 0,
      icon: UserRound,
      href: isAdmin ? "/admin/profiles" : "/profiles",
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
      href: isAdmin ? "/admin/resumes" : "/applications",
    },
  ];

  return (
    <div className="space-y-8 pt-14 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">
            {isAdmin ? "Admin workspace" : "Your workspace"}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome, {user.full_name || "there"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage job applications and create targeted resumes.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          <Plus size={17} />
          New Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition-all duration-200 group-hover:scale-105 group-hover:bg-slate-950 group-hover:text-white">
                    <Icon size={19} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-900">
                  View details
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Applications */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-950">
              Recent Applications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your latest job application activity.
            </p>
          </div>

          <Link
            href="/applications"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-950"
          >
            View all
            <ArrowUpRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold text-slate-500">
                <th className="px-5 py-3.5">Position</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>

            <tbody>
              {(apps.data || []).map((application: any) => (
                <tr
                  key={application.id}
                  className="group border-b border-slate-100 last:border-0 transition-colors duration-150 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-slate-900 transition-colors hover:text-slate-600 hover:underline"
                    >
                      {application.job_title || "Untitled position"}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {application.company || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <Badge>{application.status || "Draft"}</Badge>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {application.created_at
                      ? new Date(application.created_at).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/applications/${application.id}`}
                      aria-label="Open application"
                      className="inline-flex rounded-lg p-2 text-slate-400 opacity-70 transition-all duration-150 hover:bg-white hover:text-slate-900 hover:shadow-sm group-hover:opacity-100"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}

              {!apps.data?.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <BriefcaseBusiness
                          size={22}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-4 font-semibold text-slate-900">
                        No applications yet
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Start by adding a public job URL.
                      </p>

                      <Link
                        href="/applications/new"
                        className="mt-4 text-xs font-bold text-slate-900 transition-colors hover:text-slate-500 hover:underline"
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
      </Card>
    </div>
  );
}
