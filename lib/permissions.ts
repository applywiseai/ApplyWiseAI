import { createAdminClient } from "@/lib/supabase/admin";

export async function canAccessProfile(user: any, profileId: string) {
  if (user.role === "ADMIN") return true;
  const db = createAdminClient();
  const { data } = await db.from("user_profile_assignments").select("id").eq("user_id", user.id).eq("profile_id", profileId).maybeSingle();
  return !!data;
}

export async function canAccessApplication(user: any, applicationId: string) {
  const db = createAdminClient();
  const { data } = await db.from("applications").select("profile_id,created_by").eq("id", applicationId).single();
  if (!data) return false;
  if (user.role === "ADMIN") return true;
  if (data.created_by === user.id) return true;
  return canAccessProfile(user, data.profile_id);
}
