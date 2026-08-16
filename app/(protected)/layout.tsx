import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui";

export default async function AdminDashboard() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-semibold text-red-800">
          Access denied
        </h1>

        <p className="text-sm text-red-700 mt-1">
          You do not have permission to access the admin dashboard.
        </p>
      </div>
    );
  }

  const db = createAdminClient();

  const [
    usersResult,
    profilesResult,
    applicationsResult,
    resumesResult,
    recentResult,
  ] = await Promise.all([
    db
      .from("users")
      .select("id", { count: "exact", head: true }),

    db
      .from("client_profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false),

    db
      .from("applications")
      .select("id", { count: "exact", head: true }),

    db
      .from("generated_resumes")
      .select("id", { count: "exact", head: true }),

    db
      .from("applications")
      .select(
        "id,job_title,company,status,created_at,created_by,profile_id"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const today = new Date();

  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();

  const startMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).toISOString();

  const [{ count: todayCount }, { count: monthCount }] =
    await Promise.all([
      db
        .from("applications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .gte("created_at", startToday),

      db
        .from("applications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .gte("created_at", startMonth),
    ]);

  const recentApplications =
    recentResult.data || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 md:p-10 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-gray-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Administrator
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Manage users, client profiles and job applications.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/users">
              <Button className="bg-white text-slate-950 hover:bg-gray-100">
                Manage Users
              </Button>
            </Link>

            <Link href="/admin/profiles">
              <Button className="bg-white/10 text-white border border-white/10 hover:bg-white/20">
                Profiles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main stats */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminStat
          label="Users"
          value={usersResult.count || 0}
          href="/admin/users"
        />

        <AdminStat
          label="Profiles"
          value={profilesResult.count || 0}
          href="/admin/profiles"
        />

        <AdminStat
          label="Applications"
          value={applicationsResult.count || 0}
          href="/applications"
        />

        <AdminStat
          label="Resumes"
          value={resumesResult.count || 0}
          href="/admin/resumes"
        />

        <AdminStat
          label="Today"
          value={todayCount || 0}
          href="/applications"
        />

        <AdminStat
          label="This Month"
          value={monthCount || 0}
          href="/applications"
        />
      </section>

      {/* Quick management */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Quick Management
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Common admin actions
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminAction
            href="/admin/users"
            title="Users"
            description="Create, disable and manage user access."
            icon="♙"
          />

          <AdminAction
            href="/admin/profiles"
            title="Client Profiles"
            description="Manage candidate profiles and resumes."
            icon="○"
          />

          <AdminAction
            href="/applications"
            title="Applications"
            description="Review and manage all applications."
            icon="↗"
          />

          <AdminAction
            href="/admin/resumes"
            title="Generated Resumes"
            description="Browse AI-generated resume versions."
            icon="▤"
          />
        </div>
      </section>

      {/* Recent */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">
              Recent Applications
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest activity across the platform
            </p>
          </div>

          <Link
            href="/applications"
            className="text-sm font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
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

                <th className="px-6 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {recentApplications.map((app: any) => (
                <tr
                  key={app.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-semibold">
                    {app.job_title || "Untitled"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {app.company || "Unknown"}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(app.created_at)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {!recentApplications.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center text-gray-500"
                  >
                    No applications yet.
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

function AdminStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition"
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="text-3xl font-bold tracking-tight mt-2">
        {value}
      </p>

      <div className="text-xs text-gray-400 mt-2">
        View details →
      </div>
    </Link>
  );
}

function AdminAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between">
        <div className="h-10 w-10 rounded-xl bg-gray-100 grid place-items-center">
          {icon}
        </div>

        <span className="text-gray-300 group-hover:text-gray-900">
          →
        </span>
      </div>

      <h3 className="font-semibold mt-5">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-6 mt-1">
        {description}
      </p>
    </Link>
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
