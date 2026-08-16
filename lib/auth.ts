import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppUser = { id: string; email: string; full_name: string; role: "ADMIN" | "USER"; is_active: boolean };

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("app_users").select("id,email,full_name,role,is_active").eq("id", user.id).single();
  return data as AppUser | null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.is_active) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function apiUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("app_users").select("id,email,full_name,role,is_active").eq("id", user.id).single();
  if (!data?.is_active) return null;
  return data as AppUser;
}
