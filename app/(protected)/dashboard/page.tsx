import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function Dashboard(){
  const user=await requireUser(); const db=createAdminClient();
  const profiles = user.role==="ADMIN"
    ? await db.from("client_profiles").select("id",{count:"exact",head:true})
    : await db.from("user_profile_assignments").select("id",{count:"exact",head:true}).eq("user_id",user.id);
  const apps = user.role==="ADMIN"
    ? await db.from("applications").select("id,status,job_title,company,created_at",{count:"exact"}).order("created_at",{ascending:false}).limit(5)
    : await db.from("applications").select("id,status,job_title,company,created_at",{count:"exact"}).eq("created_by",user.id).order("created_at",{ascending:false}).limit(5);
  const resumes = user.role==="ADMIN"
    ? await db.from("generated_resumes").select("id",{count:"exact",head:true})
    : await db.from("generated_resumes").select("id",{count:"exact",head:true}).eq("created_by",user.id);
  return <div><div className="flex items-center justify-between mb-7"><div><h1 className="text-3xl font-bold">Welcome, {user.full_name}</h1><p className="text-gray-500 mt-1">Manage job applications and tailored resumes.</p></div><Link className="btn btn-primary" href="/applications/new">New Application</Link></div>
  <div className="grid md:grid-cols-3 gap-4 mb-7"><Card><p className="text-sm text-gray-500">Assigned Profiles</p><p className="text-3xl font-bold mt-2">{profiles.count||0}</p></Card><Card><p className="text-sm text-gray-500">Applications</p><p className="text-3xl font-bold mt-2">{apps.count||0}</p></Card><Card><p className="text-sm text-gray-500">Resumes Generated</p><p className="text-3xl font-bold mt-2">{resumes.count||0}</p></Card></div>
  <Card><h2 className="font-bold text-lg mb-4">Recent Applications</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-3">Job</th><th>Company</th><th>Status</th><th>Created</th></tr></thead><tbody>{(apps.data||[]).map((a:any)=><tr key={a.id} className="border-b last:border-0"><td className="py-3"><Link className="font-semibold hover:underline" href={`/applications/${a.id}`}>{a.job_title||"Untitled"}</Link></td><td>{a.company||"—"}</td><td><Badge>{a.status}</Badge></td><td>{new Date(a.created_at).toLocaleDateString()}</td></tr>)}{!(apps.data||[]).length&&<tr><td colSpan={4} className="py-8 text-center text-gray-500">No applications yet.</td></tr>}</tbody></table></div></Card></div>;
}
