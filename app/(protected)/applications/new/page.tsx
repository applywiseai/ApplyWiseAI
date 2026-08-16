import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import NewApplication from "@/components/new-application";

export default async function NewApplicationPage(){
 const u=await requireUser(); const db=createAdminClient();
 let profiles:any[]=[];
 if(u.role==="ADMIN"){const {data}=await db.from("client_profiles").select("*").eq("is_deleted",false).order("name");profiles=data||[];}
 else {const {data}=await db.from("user_profile_assignments").select("client_profiles(*)").eq("user_id",u.id);profiles=(data||[]).map((x:any)=>x.client_profiles);}
 return <NewApplication profiles={profiles}/>;
}
