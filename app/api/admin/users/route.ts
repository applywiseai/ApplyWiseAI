import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { userSchema } from "@/lib/validation";
export async function POST(req:Request){
 try{await requireAdmin();const body=userSchema.parse(await req.json());const db=createAdminClient();const {data,error}=await db.auth.admin.createUser({email:body.email,password:body.password,email_confirm:true,user_metadata:{full_name:body.full_name}});if(error)throw error;const {error:ie}=await db.from("app_users").insert({id:data.user.id,email:body.email,full_name:body.full_name,role:body.role,is_active:true});if(ie)throw ie;return NextResponse.json({id:data.user.id});}catch(e:any){return NextResponse.json({error:e.message||"Could not create user."},{status:400});}
}
