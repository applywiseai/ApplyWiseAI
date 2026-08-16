import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdmin();const {id}=await params;const db=createAdminClient();const {error}=await db.from("client_profiles").update({is_deleted:true}).eq("id",id);if(error)throw error;return NextResponse.json({ok:true});}catch(e:any){return NextResponse.json({error:e.message},{status:400});}}
