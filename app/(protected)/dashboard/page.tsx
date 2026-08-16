import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function Dashboard() {
  const user = await requireUser();
  const db = createAdminClient();

  const isAdmin = user.role === "ADMIN";

  const [
    profilesResult,
    appsResult,
    resumesResult,
  ] = await Promise.all([
    isAdmin
      ? db
          .from("client_profiles")
          .select("id", { count: "exact", head: true })
      : db
          .from("user_profile_assignments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),

    isAdmin
      ? db
          .from("applications")
          .select(
            "id,status,job_title,company,created_at",
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .limit(5)
      : db
          .from("applications")
          .select(
            "id,status,job_title,company,created_at",
            { count: "exact" }
          )
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(5),

    isAdmin
      ? db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
      : db
          .from("generated_resumes")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id),
  ]);

  const profileCount = profilesResult.count ?? 0;
  const applicationCount = appsResult.count ?? 0;
  const resumeCount = resumesResult.count ?? 0;
  const applications = appsResult.data ?? [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {isAdmin ? "Admin Dashboard" : "Your Workspace"}
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Welcome, {user.full_name}
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your job applications and tailored resumes.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md"
        >
          + New Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="p-1">
            <p className="text-sm font-medium text-gray-500">
              Assigned Profiles
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-4xl font-bold tracking-tight text-gray-950">
                {profileCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                👤
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Client profiles available to you
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="p-1">
            <p className="text-sm font-medium text-gray-500">
              Applications
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-4xl font-bold tracking-tight text-gray-950">
                {applicationCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                💼
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Total applications created
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="p-1">
            <p className="text-sm font-medium text-gray-500">
              Resumes Generated
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-4xl font-bold tracking-tight text-gray-950">
                {resumeCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                📄
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Tailored resumes created
            </p>
          </div>
        </Card>

      </div>

      {/* Quick action */}
      <Card className="overflow-hidden border-0 bg-gray-950 text-white shadow-lg">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-lg font-semibold">
              Ready to apply for a new job?
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Paste a public job URL and let ApplyWise AI build a targeted resume.
            </p>
          </div>

          <Link
            href="/applications/new"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
          >
            Create Application →
          </Link>
        </div>
      </Card>

      {/* Recent Applications */}
      <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-200">

        <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-950">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest job application activity
            </p>
          </div>

          <Link
            href="/applications"
            className="text-sm font-semibold text-gray-700 transition hover:text-gray-950"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[650px] text-sm">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                <th className="px-6 py-4 font-medium text-gray-500">
                  Job
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Company
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>

              {applications.map((application: any) => (
                <tr
                  key={application.id}
                  className="border-b border-gray-100 last:border-0 transition hover:bg-gray-50/70"
                >

                  <td className="px-6 py-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-gray-950 transition hover:text-gray-600"
                    >
                      {application.job_title || "Untitled Job"}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {application.company || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <Badge>
                      {application.status || "Draft"}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {new Date(
                      application.created_at
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                </tr>
              ))}

              {!applications.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto max-w-sm">

                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                        💼
                      </div>

                      <p className="font-semibold text-gray-900">
                        No applications yet
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Create your first application using a public job URL.
                      </p>

                      <Link
                        href="/applications/new"
                        className="mt-5 inline-flex items-center rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        Create Application
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
