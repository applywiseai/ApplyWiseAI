import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req:Request){try{await requireAdmin();const {user_id,profile_id}=await req.json();const db=createAdminClient();const {error}=await db.from("user_profile_assignments").upsert({user_id,profile_id},{onConflict:"user_id,profile_id"});if(error)throw error;return NextResponse.json({ok:true});}catch(e:any){return NextResponse.json({error:e.message},{status:400});}}
