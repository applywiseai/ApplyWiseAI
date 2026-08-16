import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";

export default async function Dashboard() {
  const user = await requireUser();
  const db = createAdminClient();

  const isAdmin = user.role === "ADMIN";

  const profilesQuery = isAdmin
    ? db
        .from("client_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
    : db
        .from("user_profile_assignments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

  const applicationsQuery = isAdmin
    ? db
        .from("applications")
        .select(
          "id,status,job_title,company,location,created_at,profile_id",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .limit(6)
    : db
        .from("applications")
        .select(
          "id,status,job_title,company,location,created_at,profile_id",
          { count: "exact" }
        )
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

  const resumesQuery = isAdmin
    ? db
        .from("generated_resumes")
        .select("id", { count: "exact", head: true })
    : db
        .from("generated_resumes")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id);

  const [
    { count: profileCount },
    { data: applications },
    { count: resumeCount },
  ] = await Promise.all([
    profilesQuery,
    applicationsQuery,
    resumesQuery,
  ]);

  const totalApplications = applications?.length || 0;

  const statusCounts = {
    active:
      applications?.filter(
        (a: any) =>
          !["Rejected", "Withdrawn"].includes(a.status)
      ).length || 0,

    interviews:
      applications?.filter(
        (a: any) => a.status === "Interview"
      ).length || 0,

    offers:
      applications?.filter(
        (a: any) => a.status === "Offer"
      ).length || 0,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 md:p-9 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ApplyWise AI
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {user.full_name}
            </h1>

            <p className="mt-2 max-w-xl text-sm md:text-base text-gray-400">
              Manage applications, client profiles and AI-powered
              tailored resumes from one place.
            </p>
          </div>

          <Link href="/applications/new">
            <Button className="bg-white text-slate-950 hover:bg-gray-100 px-6">
              + New Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={isAdmin ? "Client Profiles" : "Assigned Profiles"}
          value={profileCount || 0}
          icon="◎"
          description="Available profiles"
        />

        <StatCard
          title="Applications"
          value={applications?.length || 0}
          icon="↗"
          description="Recent applications"
        />

        <StatCard
          title="Resumes Generated"
          value={resumeCount || 0}
          icon="▤"
          description="AI tailored resumes"
        />

        <StatCard
          title="Interviews"
          value={statusCounts.interviews}
          icon="✓"
          description="Interview stage"
        />
      </section>

      {/* Quick actions */}
      <section className="grid md:grid-cols-3 gap-4">
        <QuickAction
          href="/applications/new"
          title="Create Application"
          description="Paste a public job URL and generate a tailored resume."
          icon="↗"
        />

        <QuickAction
          href="/applications"
          title="View Applications"
          description="Track your job applications and their current status."
          icon="▦"
        />

        <QuickAction
          href="/profiles"
          title={isAdmin ? "Manage Profiles" : "My Profiles"}
          description="View client information and master resumes."
          icon="○"
        />
      </section>

      {/* Recent applications */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b px-6 py-5">
          <div>
            <h2 className="font-semibold text-lg">
              Recent Applications
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Your latest application activity
            </p>
          </div>

          <Link
            href="/applications"
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {(applications || []).map((application: any) => (
                <tr
                  key={application.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {application.job_title || "Untitled Position"}
                    </Link>

                    {application.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        {application.location}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {application.company || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={application.status} />
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(application.created_at)}
                  </td>
                </tr>
              ))}

              {!applications?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-100 grid place-items-center text-gray-400 text-xl">
                      ▦
                    </div>

                    <p className="font-medium mt-4">
                      No applications yet
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Start by creating your first application.
                    </p>

                    <Link href="/applications/new">
                      <Button className="mt-4">
                        Create Application
                      </Button>
                    </Link>
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

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center text-lg font-semibold text-slate-700">
          {icon}
        </div>

        <span className="text-xs text-emerald-600 font-medium">
          Live
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-5">{title}</p>

      <p className="text-3xl font-bold tracking-tight mt-1">
        {value}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
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
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition"
    >
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl bg-gray-100 grid place-items-center font-semibold">
          {icon}
        </div>

        <span className="text-gray-300 group-hover:text-slate-900 transition">
          →
        </span>
      </div>

      <h3 className="font-semibold mt-5">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-1 leading-6">
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
