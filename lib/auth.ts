import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "USER";
  is_active: boolean;
};

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
    .single();

  if (error || !data) return null;

  return data as AppUser;
});

export const requireUser = cache(async (): Promise<AppUser> => {
  const user = await getCurrentUser();

  if (!user || !user.is_active) {
    redirect("/login");
  }

  return user;
});

export const requireAdmin = cache(async (): Promise<AppUser> => {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
});

export async function apiUser(): Promise<AppUser | null> {
  const user = await getCurrentUser();

  if (!user || !user.is_active) {
    return null;
  }

  return user;
}
