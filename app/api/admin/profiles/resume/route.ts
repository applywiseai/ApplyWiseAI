import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import pdfParse from "pdf-parse";
export async function POST(req:Request){
 try{await requireAdmin();const fd=await req.formData();const file=fd.get("file");const profileId=String(fd.get("profile_id")||"");if(!(file instanceof File)||file.type!=="application/pdf")return NextResponse.json({error:"Only PDF files are accepted."},{status:400});if(file.size>10*1024*1024)return NextResponse.json({error:"PDF must be 10 MB or smaller."},{status:400});
 const buffer=Buffer.from(await file.arrayBuffer());const parsed=await pdfParse(buffer);if(!parsed.text.trim())return NextResponse.json({error:"Could not extract text from PDF."},{status:422});
 const db=createAdminClient();const path=`${profileId}/master.pdf`;const up=await db.storage.from("master-resumes").upload(path,buffer,{contentType:"application/pdf",upsert:true});if(up.error)throw up.error;const {error}=await db.from("client_profiles").update({master_resume_file_url:path,master_resume_filename:file.name,master_resume_text:parsed.text}).eq("id",profileId);if(error)throw error;return NextResponse.json({ok:true});
 }catch(e:any){console.error(e);return NextResponse.json({error:"Resume upload failed."},{status:500});}
}
