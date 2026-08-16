import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessApplication } from "@/lib/permissions";
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 try{const u=await apiUser();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const db=createAdminClient();const {data:r}=await db.from("generated_resumes").select("id,file_path,filename,application_id").eq("id",id).single();if(!r||!(await canAccessApplication(u,r.application_id)))return NextResponse.json({error:"Forbidden"},{status:403});const {data:s,error}=await db.storage.from("generated-resumes").createSignedUrl(r.file_path,300);if(error)throw error;return NextResponse.redirect(s.signedUrl);}catch(e:any){return NextResponse.json({error:"Download failed."},{status:500});}
}
