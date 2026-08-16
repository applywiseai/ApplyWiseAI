import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  Gift,
  Plus,
  Sparkles,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui";

export default async function ApplicationsPage() {
  const user = await requireUser();
  const db = createAdminClient();

  let query = db
    .from("applications")
    .select(
      "id,profile_id,created_by,job_title,company,location,status,created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (user.role !== "ADMIN") {
    query = query.eq("created_by", user.id);
  }

  const { data, error, count } = await query;

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-100 p-2 text-red-600">
            <BriefcaseBusiness size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-red-900">
              Unable to load applications
            </h2>

            <p className="mt-1 text-sm text-red-700">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rows = data ?? [];

  const counts = {
    all: count ?? rows.length,
    applied: rows.filter((x) => x.status === "Applied").length,
    interview: rows.filter((x) => x.status === "Interview").length,
    offer: rows.filter((x) => x.status === "Offer").length,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Sparkles size={13} />
            {user.role === "ADMIN"
              ? "Admin workspace"
              : "Your workspace"}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your job applications, interviews and offers.
          </p>
        </div>

        <Link href="/applications/new">
          <Button className="group h-11 rounded-xl px-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <Plus
              size={17}
              className="mr-2 transition-transform duration-200 group-hover:rotate-90"
            />
            New Application
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="All Applications"
          value={counts.all}
          icon={BriefcaseBusiness}
        />

        <StatCard
          label="Applied"
          value={counts.applied}
          icon={FileCheck2}
        />

        <StatCard
          label="Interviews"
          value={counts.interview}
          icon={Clock3}
        />

        <StatCard
          label="Offers"
          value={counts.offer}
          icon={Gift}
        />
      </div>

      {/* TABLE CARD */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.05)]">
        {/* CARD HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h2 className="font-bold text-slate-950">
              Application History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {rows.length
                ? `Showing your latest ${rows.length} applications`
                : "No applications found"}
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
            {user.role === "ADMIN"
              ? "All applications"
              : "Your applications"}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Position
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Company
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Created
                </th>

                <th className="px-7 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((application) => (
                <tr
                  key={application.id}
                  className="group border-b border-slate-100 last:border-0 transition-all duration-200 hover:bg-slate-50/70"
                >
                  {/* POSITION */}
                  <td className="px-7 py-5">
                    <Link
                      href={`/applications/${application.id}`}
                      className="group/link block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-200 group-hover:bg-slate-950 group-hover:text-white">
                          <BriefcaseBusiness size={17} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 transition-colors group-hover/link:text-slate-600">
                            {application.job_title ||
                              "Untitled Position"}
                          </p>

                          <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                            #{application.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* COMPANY */}
                  <td className="px-5 py-5">
                    <span className="font-medium text-slate-700">
                      {application.company || "Unknown"}
                    </span>
                  </td>

                  {/* LOCATION */}
                  <td className="px-5 py-5 text-slate-500">
                    {application.location || "—"}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-5">
                    <StatusBadge status={application.status} />
                  </td>

                  {/* DATE */}
                  <td className="px-5 py-5 text-slate-500">
                    {formatDate(application.created_at)}
                  </td>

                  {/* ACTION */}
                  <td className="px-7 py-5 text-right">
                    <Link
                      href={`/applications/${application.id}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 opacity-70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-md group-hover:opacity-100"
                    >
                      View
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* EMPTY */}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-20">
                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
                        <BriefcaseBusiness
                          size={25}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="mt-5 font-semibold text-slate-900">
                        No applications yet
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Start by adding a public job URL.
                      </p>

                      <Link href="/applications/new">
                        <Button className="mt-5 rounded-xl">
                          <Plus size={16} className="mr-2" />
                          Create Application
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- */
/* STAT CARD */
/* -------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_25px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-slate-950 group-hover:text-white">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* STATUS */
/* -------------------------------- */

function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-600 ring-slate-200",
    "Job Extracted":
      "bg-blue-50 text-blue-700 ring-blue-100",
    "Resume Ready":
      "bg-violet-50 text-violet-700 ring-violet-100",
    Applied:
      "bg-indigo-50 text-indigo-700 ring-indigo-100",
    Interview:
      "bg-amber-50 text-amber-700 ring-amber-100",
    Rejected:
      "bg-red-50 text-red-700 ring-red-100",
    Offer:
      "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Withdrawn:
      "bg-slate-100 text-slate-500 ring-slate-200",
  };

  const value = status || "Draft";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        styles[value] || styles.Draft
      }`}
    >
      {value}
    </span>
  );
}

/* -------------------------------- */
/* DATE */
/* -------------------------------- */

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
