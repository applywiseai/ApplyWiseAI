# ApplyWise AI

AI-Powered Job Application & Resume Tailoring Platform.

## Architecture

- Next.js + TypeScript + Tailwind CSS
- Supabase Auth + PostgreSQL + private Storage
- OpenAI server-side API
- Server-side job extraction with `fetch` + JSDOM + Mozilla Readability
- Server-side PDF text extraction with `pdf-parse`
- Server-side ATS-friendly PDF generation with PDFKit
- Vercel deployment target

### Core flow

Admin signs in → creates user → creates client profile → uploads master PDF → assigns profile → user signs in → selects profile → pastes public job URL → server extracts page → OpenAI structures job → OpenAI tailors resume only from source facts → PDF generated → private Storage → application and resume version persisted → signed download.

## Database schema

### `app_users`
`id`, `email`, `full_name`, `role`, `is_active`, timestamps.

### `client_profiles`
Client identity, targets, skills, master resume storage path/name/text, soft-delete flag, timestamps.

### `user_profile_assignments`
Many-to-many mapping between users and client profiles.

### `applications`
Job URL, extracted job fields, raw text, status, creator/profile references, timestamps.

### `generated_resumes`
Application/profile/user references, private Storage path, filename, version, structured AI output, timestamp.

## File structure

```text
app/
  (protected)/
    dashboard/
    applications/
    profiles/
    admin/
  api/
    jobs/extract/
    resume/generate/
    admin/users/
    admin/profiles/
    admin/assignments/
    resumes/[id]/download/
    profiles/[id]/resume/
components/
lib/
supabase/migrations/
```

## Local setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/migrations/0001_initial.sql`.
3. Create an Authentication user for the first admin, then run `supabase/bootstrap-admin.sql` after replacing the email.
4. Copy `.env.example` to `.env.local`.
5. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
6. Run:
```bash
npm install
npm run dev
```
7. Open `http://localhost:3000`.

## Security

- OpenAI key and Supabase service-role key are server-only.
- Master and generated resumes are private Storage objects.
- Downloads are authorized server-side and returned as five-minute signed URLs.
- Supabase RLS prevents users from selecting unassigned profiles/applications.
- Normal users cannot access admin pages or admin APIs.
- PDF uploads are limited to 10 MB and validated as PDF.
- Job extraction does not bypass CAPTCHAs, authentication, paywalls, or anti-bot controls.

## Job extraction limitations

Only publicly accessible pages can be fetched. A blocked or client-rendered page may fail. The application never silently invents job data; it reports an extraction error.

## Deployment to GitHub + Vercel

```bash
git init
git add .
git commit -m "Initial ApplyWise AI application"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

Then import the repository into Vercel.

In Vercel Project Settings → Environment Variables, add all variables from `.env.example` for Production/Preview as appropriate. Redeploy after adding them.

## First admin

Use `supabase/bootstrap-admin.sql`. This requires the admin user to already exist in Supabase Auth. The bootstrap SQL promotes only that exact email.

Do not make all authenticated users admins.

## Testing checklist

- [ ] Admin login works.
- [ ] Non-admin is redirected away from admin routes.
- [ ] Admin creates a USER.
- [ ] Admin disables and re-enables a USER.
- [ ] Admin creates a client profile.
- [ ] Admin uploads a valid PDF <= 10 MB.
- [ ] Invalid/non-PDF upload is rejected.
- [ ] Master PDF text is persisted.
- [ ] Admin assigns a profile to a user.
- [ ] User sees only assigned profiles.
- [ ] User cannot select another profile by changing an ID in the request.
- [ ] Public job URL extraction works on an accessible page.
- [ ] Blocked job page produces a safe error.
- [ ] OpenAI job extraction returns structured fields.
- [ ] Resume tailoring refuses to invent unsupported facts via its system instruction.
- [ ] Generated PDF is a real PDF.
- [ ] Generated resume is stored privately.
- [ ] Version 2 is created rather than overwriting version 1.
- [ ] Application persists after refresh/logout/login.
- [ ] Signed downloads work and expire.
- [ ] Admin can view all applications/resumes.
- [ ] User cannot view another user's application unless their profile is assigned to them.
- [ ] `npm run build` passes.

## Free-tier note

Vercel, Supabase, and GitHub have free tiers subject to their current limits. OpenAI API usage is billed according to the selected model and current pricing; it should not be assumed to be permanently free.

## Production hardening before high-volume launch

Add rate limiting/WAF controls at the edge, background jobs for long-running AI/PDF tasks, audit logging, observability, malware scanning for uploaded files, and automated integration tests. These are deliberately not dependent on paid third-party services in the baseline deployment.
