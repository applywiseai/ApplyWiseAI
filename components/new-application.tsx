"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Badge } from "@/components/ui";

type Profile = {
  id: string;
  name: string;
  email?: string;
};

type Job = {
  job_title?: string;
  company?: string;
  location?: string;
  salary?: string;
  employment_type?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  preferred_skills?: string[];
  experience_requirements?: string[];
};

export default function NewApplication({
  profiles,
}: {
  profiles: Profile[];
}) {
  const router = useRouter();

  const [profileId, setProfileId] = useState(profiles[0]?.id || "");
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  async function extract() {
    if (!profileId) {
      setError("Please select a client profile.");
      return;
    }

    if (!url.trim()) {
      setError("Please paste a job URL.");
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError("Please enter a valid job URL.");
      return;
    }

    setBusy(true);
    setError("");
    setJob(null);

    try {
      const response = await fetch("/api/jobs/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          profile_id: profileId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to extract this job.");
      }

      setJob(data.job);
      setApplicationId(data.applicationId);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!job || !applicationId) {
      setError("Please extract the job first.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_id: profileId,
          application_id: applicationId,
          job,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Resume generation failed."
        );
      }

      router.push(`/applications/${data.applicationId}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Resume generation failed.");
      setBusy(false);
    }
  }

  const progress = busy
    ? [
        "Reading job page...",
        "Analyzing requirements...",
        "Matching candidate experience...",
        "Creating ATS-friendly resume...",
        "Generating PDF...",
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
            AI
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              New Application
            </h1>

            <p className="text-gray-500 mt-1">
              Create a targeted, ATS-friendly resume from a public job URL.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Step
          number="1"
          title="Profile"
          active={step === 1}
          completed={step > 1}
        />

        <Step
          number="2"
          title="Job URL"
          active={step === 2}
          completed={step > 2}
        />

        <Step
          number="3"
          title="Review & Generate"
          active={step === 3}
          completed={false}
        />
      </div>

      {/* Main card */}
      <Card className="overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Profile */}
          <div className="mb-7">
            <Label>Select Client Profile</Label>

            <select
              className="input mt-2"
              value={profileId}
              onChange={(e) => {
                setProfileId(e.target.value);
                setJob(null);
                setApplicationId(null);
                setStep(1);
              }}
              disabled={busy}
            >
              {profiles.length === 0 && (
                <option value="">No profiles available</option>
              )}

              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                  {profile.email ? ` — ${profile.email}` : ""}
                </option>
              ))}
            </select>

            {profiles.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                No client profiles are assigned to you yet.
              </p>
            )}
          </div>

          {/* URL */}
          <div className="mb-7">
            <Label>Public Job URL</Label>

            <div className="mt-2 flex flex-col md:flex-row gap-3">
              <Input
                type="url"
                placeholder="https://company.com/jobs/software-engineer"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                disabled={busy}
                className="flex-1"
              />

              <Button
                onClick={extract}
                disabled={
                  busy ||
                  !profileId ||
                  !url.trim() ||
                  profiles.length === 0
                }
                className="md:min-w-[150px]"
              >
                {busy ? "Reading..." : "Extract Job"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Use a publicly accessible job posting. Login-protected or
              CAPTCHA-protected pages cannot be automatically read.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="text-red-600 font-bold">!</div>

                <div>
                  <p className="font-semibold text-red-800">
                    Something went wrong
                  </p>

                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {busy && (
            <div className="mb-6 rounded-2xl border bg-gray-50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-slate-900 animate-spin" />

                <div>
                  <p className="font-semibold">
                    ApplyWise AI is working
                  </p>

                  <p className="text-sm text-gray-500">
                    Please keep this page open.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {progress.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-slate-900 text-white"
                          : "border border-gray-300"
                      }`}
                    >
                      {index === 0 ? "✓" : ""}
                    </div>

                    <span className="text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job result */}
          {job && !busy && (
            <div className="border-t pt-7">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>JOB FOUND</Badge>
                  </div>

                  <h2 className="text-2xl font-bold">
                    {job.job_title || "Job Title Not Found"}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {job.company || "Company not found"}

                    {job.location
                      ? ` • ${job.location}`
                      : ""}
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  Ready for AI analysis
                </div>
              </div>

              {/* Job metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
                <InfoBox
                  label="Location"
                  value={job.location}
                />

                <InfoBox
                  label="Employment Type"
                  value={job.employment_type}
                />

                <InfoBox
                  label="Salary"
                  value={job.salary}
                />
              </div>

              {/* Description */}
              <Section title="Job Description">
                <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                  {job.description || "Not provided"}
                </p>
              </Section>

              {/* Responsibilities */}
              {job.responsibilities?.length ? (
                <Section title="Responsibilities">
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {/* Requirements */}
              {job.requirements?.length ? (
                <Section title="Requirements">
                  <ul className="space-y-2">
                    {job.requirements.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {/* Skills */}
              {job.skills?.length ? (
                <Section title="Required Skills">
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full border bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              ) : null}

              {/* Generate */}
              <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Ready to tailor the resume?
                    </h3>

                    <p className="text-sm text-gray-300 mt-1">
                      ApplyWise AI will compare this job with the
                      selected candidate&apos;s master resume and create
                      a targeted PDF.
                    </p>
                  </div>

                  <Button
                    onClick={generate}
                    disabled={busy}
                    className="bg-white text-slate-900 hover:bg-gray-100 md:min-w-[220px]"
                  >
                    Generate Tailored Resume
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Step({
  number,
  title,
  active,
  completed,
}: {
  number: string;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : completed
          ? "border-gray-300 bg-gray-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
            active
              ? "bg-white text-slate-900"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {completed ? "✓" : number}
        </div>

        <span className="text-sm font-semibold">
          {title}
        </span>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="text-sm font-semibold mt-1">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t py-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
