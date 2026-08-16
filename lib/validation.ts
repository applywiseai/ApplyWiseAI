import { z } from "zod";

export const urlSchema = z.object({ url: z.string().url().max(2048) });
export const profileSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().max(320),
  phone: z.string().max(60).optional().default(""),
  location: z.string().max(160).optional().default(""),
  linkedin: z.string().max(500).optional().default(""),
  portfolio: z.string().max(500).optional().default(""),
  target_roles: z.string().max(1000).optional().default(""),
  target_locations: z.string().max(1000).optional().default(""),
  target_industries: z.string().max(1000).optional().default(""),
  skills: z.string().max(4000).optional().default(""),
  summary: z.string().max(4000).optional().default("")
});
export const applicationSchema = z.object({
  profile_id: z.string().uuid(),
  url: z.string().url().max(2048)
});
export const userSchema = z.object({
  full_name: z.string().min(1).max(160),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["USER","ADMIN"]).default("USER")
});
