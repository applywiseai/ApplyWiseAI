import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "USER";
  is_active: boolean;
};

/**
 * Get the currently authenticated application user.
 *
 * React cache() deduplicates repeated calls during the same
 * server render/request.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("app_users")
    .select("id,email,full_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return data as AppUser;
});

/**
 * Require an active authenticated user.
 */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user || !user.is_active) {
    redirect("/login");
  }

  return user;
}

/**
 * Require an administrator.
 */
export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Get authenticated user for API routes.
 *
 * Returns null instead of redirecting.
 */
export const apiUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("app_users")
    .select("id,email,full_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    return null;
  }

  return data as AppUser;
});
