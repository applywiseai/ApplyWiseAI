import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";
export default async function Profiles(){
 const u=await requireUser(); const db=createAdminClient();
 const {data}=await db.from("user_profile_assignments").select("client_profiles(*)").eq("user_id",u.id);
 return <div><h1 className="text-3xl font-bold mb-6">My Profiles</h1><div className="grid md:grid-cols-2 gap-4">{(data||[]).map((x:any)=><Card key={x.client_profiles.id}><h2 className="font-bold text-lg">{x.client_profiles.name}</h2><p className="text-sm text-gray-500">{x.client_profiles.email}</p><p className="text-sm mt-3">{x.client_profiles.location||"Location not set"}</p></Card>)}{!(data||[]).length&&<Card><p className="text-gray-500">No profiles have been assigned to you.</p></Card>}</div></div>;
}
