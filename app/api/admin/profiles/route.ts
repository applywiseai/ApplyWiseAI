import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validation";
export async function POST(req:Request){try{await requireAdmin();const b=profileSchema.parse(await req.json());const db=createAdminClient();const {data,error}=await db.from("client_profiles").insert(b).select().single();if(error)throw error;return NextResponse.json({id:data.id});}catch(e:any){return NextResponse.json({error:e.message},{status:400});}}
export async function PATCH(req:Request){try{await requireAdmin();const b=await req.json();const {id,...rest}=b;const data=profileSchema.parse(rest);const db=createAdminClient();const {error}=await db.from("client_profiles").update(data).eq("id",id);if(error)throw error;return NextResponse.json({id});}catch(e:any){return NextResponse.json({error:e.message},{status:400});}}
