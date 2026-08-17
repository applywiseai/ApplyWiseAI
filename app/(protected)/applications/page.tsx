import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button, Card } from "@/components/ui";

const PAGE_SIZE = 10;

type SearchParams = {
  page?: string;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const db = createAdminClient();

  const params = await searchParams;

  const requestedPage = Number(params.page || "1");

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const query =
    user.role === "ADMIN"
      ? db
          .from("applications")
          .select(
            "id,job_title,company,location,status,created_at",
            {
              count: "exact",
            }
          )
          .order("created_at", {
            ascending: false,
          })
          .range(from, to)
      : db
          .from("applications")
          .select(
            "id,job_title,company,location,status,created_at",
            {
              count: "exact",
            }
          )
          .eq("created_by", user.id)
          .order("created_at", {
            ascending: false,
          })
          .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load applications
        </h2>

        <p className="mt-1 text-sm text-red-700">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  const applications = data || [];
  const total = count || 0;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const startItem =
    total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    total
  );

  return (
    <div className="space-y-7 pb-10">

      {/* HEADER */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">
            Workspace / Applications
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track jobs, statuses and AI-generated resumes.
          </p>
        </div>

        <Link
          href="/applications/new"
          prefetch
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={17} />
          New Application
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <MiniStat
          label="Total Applications"
          value={total}
        />

        <MiniStat
          label="Showing"
          value={applications.length}
        />

        <MiniStat
          label="Current Page"
          value={currentPage}
        />

        <MiniStat
          label="Total Pages"
          value={totalPages}
        />

      </div>

      {/* TABLE */}
      <Card className="overflow-hidden p-0">

        {/* TABLE HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-slate-950">
              Application History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {total === 0
                ? "No applications found."
                : `Showing ${startItem}-${endItem} of ${total} applications`}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            {user.role === "ADMIN"
              ? "All applications"
              : "Your applications"}
          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-sm">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-6 py-4">
                  Position
                </th>

                <th className="px-6 py-4">
                  Company
                </th>

                <th className="px-6 py-4">
                  Location
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Created
                </th>

                <th className="px-6 py-4 text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {applications.map((application: any) => (

                <tr
                  key={application.id}
                  className="border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-slate-50/70"
                >

                  {/* POSITION */}
                  <td className="px-6 py-5">

                    <Link
                      href={`/applications/${application.id}`}
                      prefetch
                      className="font-semibold text-slate-900 transition-colors hover:text-slate-600"
                    >
                      {application.job_title ||
                        "Untitled Position"}
                    </Link>

                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                      #{application.id.slice(0, 8)}
                    </div>

                  </td>

                  {/* COMPANY */}
                  <td className="px-6 py-5">

                    <span className="font-medium text-slate-800">
                      {application.company ||
                        "Unknown"}
                    </span>

                  </td>

                  {/* LOCATION */}
                  <td className="px-6 py-5 text-slate-500">
                    {application.location || "—"}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <StatusBadge
                      status={application.status}
                    />
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-5 text-slate-500">
                    {formatDate(
                      application.created_at
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-5 text-right">

                    <Link
                      href={`/applications/${application.id}`}
                      prefetch
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.97]"
                    >
                      View
                      <ArrowUpRight size={14} />
                    </Link>

                  </td>

                </tr>

              ))}

              {/* EMPTY */}
              {!applications.length && (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                        <BriefcaseBusiness
                          size={23}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        No applications yet
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Create an application from a public job URL.
                      </p>

                      <Link
                        href="/applications/new"
                        prefetch
                        className="mt-5"
                      >
                        <Button>
                          Create First Application
                        </Button>
                      </Link>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <p className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">

              {currentPage > 1 ? (
                <Link
                  href={`/applications?page=${currentPage - 1}`}
                  prefetch
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ChevronLeft size={15} />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-300">
                  <ChevronLeft size={15} />
                  Previous
                </span>
              )}

              <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-xs font-bold text-white">
                {currentPage}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={`/applications?page=${currentPage + 1}`}
                  prefetch
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                  <ChevronRight size={15} />
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-300">
                  Next
                  <ChevronRight size={15} />
                </span>
              )}

            </div>

          </div>

        )}

      </Card>
    </div>
  );
}


/* -------------------------------- */
/* Mini Stat */
/* -------------------------------- */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

    </div>
  );
}


/* -------------------------------- */
/* Status Badge */
/* -------------------------------- */

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  const styles: Record<string, string> = {
    Draft:
      "bg-slate-100 text-slate-700",

    "Job Extracted":
      "bg-blue-50 text-blue-700",

    "Resume Ready":
      "bg-violet-50 text-violet-700",

    Applied:
      "bg-indigo-50 text-indigo-700",

    Interview:
      "bg-amber-50 text-amber-700",

    Rejected:
      "bg-red-50 text-red-700",

    Offer:
      "bg-emerald-50 text-emerald-700",

    Withdrawn:
      "bg-slate-100 text-slate-600",
  };

  const current = status || "Draft";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[current] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {current}
    </span>
  );
}


/* -------------------------------- */
/* Date */
/* -------------------------------- */

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}
