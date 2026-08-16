import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui";

export default async function ApplicationsPage() {
  const user = await requireUser();
  const db = createAdminClient();

  const query =
    user.role === "ADMIN"
      ? db
          .from("applications")
          .select(
            "id,profile_id,created_by,job_title,company,location,status,created_at,updated_at"
          )
          .order("created_at", { ascending: false })
      : db
          .from("applications")
          .select(
            "id,profile_id,created_by,job_title,company,location,status,created_at,updated_at"
          )
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

  const { data: applications, error } = await query;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load applications
        </h2>

        <p className="text-sm text-red-700 mt-1">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  const rows = applications || [];

  const counts = {
    all: rows.length,
    applied: rows.filter((x: any) => x.status === "Applied").length,
    interview: rows.filter((x: any) => x.status === "Interview").length,
    offer: rows.filter((x: any) => x.status === "Offer").length,
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <div className="text-sm text-gray-500 mb-2">
            Workspace / Applications
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Applications
          </h1>

          <p className="text-gray-500 mt-1">
            Track jobs, statuses and AI-generated resumes.
          </p>
        </div>

        <Link href="/applications/new">
          <Button className="px-5">
            + New Application
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="All Applications"
          value={counts.all}
        />

        <MiniStat
          label="Applied"
          value={counts.applied}
        />

        <MiniStat
          label="Interviews"
          value={counts.interview}
        />

        <MiniStat
          label="Offers"
          value={counts.offer}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">
                Application History
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {rows.length} application
                {rows.length === 1 ? "" : "s"} total
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm text-gray-500">
              {user.role === "ADMIN"
                ? "All applications"
                : "Your applications"}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b text-left text-xs uppercase tracking-wide text-gray-500">
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
              {rows.map((application: any) => (
                <tr
                  key={application.id}
                  className="border-b last:border-0 hover:bg-gray-50/70 transition"
                >
                  <td className="px-6 py-5">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-700 transition"
                    >
                      {application.job_title ||
                        "Untitled Position"}
                    </Link>

                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      #{application.id.slice(0, 8)}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="font-medium">
                      {application.company || "Unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-500">
                    {application.location || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={application.status} />
                  </td>

                  <td className="px-6 py-5 text-gray-500">
                    {formatDate(application.created_at)}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/applications/${application.id}`}
                      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 transition"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 grid place-items-center text-gray-400 text-xl">
                      ▦
                    </div>

                    <h3 className="font-semibold mt-4">
                      No applications yet
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Create an application from a public job URL.
                    </p>

                    <Link href="/applications/new">
                      <Button className="mt-5">
                        Create First Application
                      </Button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    "Job Extracted": "bg-blue-50 text-blue-700",
    "Resume Ready": "bg-violet-50 text-violet-700",
    Applied: "bg-indigo-50 text-indigo-700",
    Interview: "bg-amber-50 text-amber-700",
    Rejected: "bg-red-50 text-red-700",
    Offer: "bg-emerald-50 text-emerald-700",
    Withdrawn: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Draft"}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
