import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessProfile } from "@/lib/permissions";
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 try{const u=await apiUser();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;if(!(await canAccessProfile(u,id)))return NextResponse.json({error:"Forbidden"},{status:403});const db=createAdminClient();const {data}=await db.from("client_profiles").select("master_resume_file_url").eq("id",id).single();if(!data?.master_resume_file_url)return NextResponse.json({error:"Not found"},{status:404});const {data:signed,error}=await db.storage.from("master-resumes").createSignedUrl(data.master_resume_file_url,300);if(error)throw error;return NextResponse.redirect(signed.signedUrl);}catch(e:any){return NextResponse.json({error:"Download failed."},{status:500});}
}
