import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
export default async function AdminApplications(){
 await requireAdmin();const db=createAdminClient();const {data}=await db.from("applications").select("*,client_profiles(name),app_users!applications_created_by_fkey(full_name,email)").order("created_at",{ascending:false});
 return <div><h1 className="text-3xl font-bold mb-6">All Applications</h1><Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3">Job</th><th>Company</th><th>Client</th><th>User</th><th>Status</th><th>Created</th></tr></thead><tbody>{(data||[]).map((a:any)=><tr key={a.id} className="border-b last:border-0"><td className="py-3 font-semibold"><Link href={`/applications/${a.id}`} className="underline">{a.job_title||"Untitled"}</Link></td><td>{a.company||"—"}</td><td>{a.client_profiles?.name||"—"}</td><td>{a.app_users?.full_name||"—"}</td><td><Badge>{a.status}</Badge></td><td>{new Date(a.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></Card></div>;
}
