import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";
export default async function Resumes(){
 await requireAdmin();const db=createAdminClient();const {data}=await db.from("generated_resumes").select("*,client_profiles(name),applications(job_title,company)").order("created_at",{ascending:false});
 return <div><h1 className="text-3xl font-bold mb-6">Generated Resumes</h1><Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3">Client</th><th>Job</th><th>Version</th><th>Created</th><th>Download</th></tr></thead><tbody>{(data||[]).map((r:any)=><tr key={r.id} className="border-b last:border-0"><td className="py-3">{r.client_profiles?.name}</td><td>{r.applications?.job_title} — {r.applications?.company}</td><td>v{r.version}</td><td>{new Date(r.created_at).toLocaleDateString()}</td><td><a className="underline" href={`/api/resumes/${r.id}/download`}>Download PDF</a></td></tr>)}</tbody></table></div></Card></div>;
}
