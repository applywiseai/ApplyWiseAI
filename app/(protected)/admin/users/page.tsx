import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";
import UserManager from "@/components/user-manager";
export default async function Users(){
 await requireAdmin();const db=createAdminClient();const {data}=await db.from("app_users").select("*").order("created_at",{ascending:false});
 const {data:assignments}=await db.from("user_profile_assignments").select("user_id,client_profiles(id,name)");
 return <div><h1 className="text-3xl font-bold mb-6">Users</h1><UserManager users={data||[]} assignments={assignments||[]}/></div>;
}
