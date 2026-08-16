import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
export default async function Applications(){
 const u=await requireUser();const db=createAdminClient();
 let q=db.from("applications").select("id,job_title,company,location,status,created_at,client_profiles(name)").order("created_at",{ascending:false});
 if(u.role!=="ADMIN"){
   const {data:assigned}=await db.from("user_profile_assignments").select("profile_id").eq("user_id",u.id);
   const ids=(assigned||[]).map((x:any)=>x.profile_id);
   q=ids.length ? q.or(`created_by.eq.${u.id},profile_id.in.(${ids.join(",")})`) : q.eq("created_by",u.id);
 }
 const {data}=await q;
 return <div><div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Applications</h1><Link href="/applications/new" className="btn btn-primary">New Application</Link></div><Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3">Job Title</th><th>Company</th><th>Profile</th><th>Status</th><th>Created</th></tr></thead><tbody>{(data||[]).map((a:any)=><tr key={a.id} className="border-b last:border-0"><td className="py-3 font-semibold"><Link href={`/applications/${a.id}`} className="hover:underline">{a.job_title||"Untitled"}</Link></td><td>{a.company||"—"}</td><td>{a.client_profiles?.name||"—"}</td><td><Badge>{a.status}</Badge></td><td>{new Date(a.created_at).toLocaleDateString()}</td></tr>)}{!(data||[]).length&&<tr><td colSpan={5} className="py-8 text-center text-gray-500">No applications yet.</td></tr>}</tbody></table></div></Card></div>;
}
