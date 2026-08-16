import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";
import ProfileManager from "@/components/profile-manager";
export default async function Profiles(){
 await requireAdmin();const db=createAdminClient();const {data:profiles}=await db.from("client_profiles").select("*").eq("is_deleted",false).order("created_at",{ascending:false});const {data:users}=await db.from("app_users").select("id,full_name,email").eq("is_active",true).order("full_name");const {data:assignments}=await db.from("user_profile_assignments").select("*");
 return <div><h1 className="text-3xl font-bold mb-6">Client Profiles</h1><ProfileManager profiles={profiles||[]} users={users||[]} assignments={assignments||[]}/></div>;
}
