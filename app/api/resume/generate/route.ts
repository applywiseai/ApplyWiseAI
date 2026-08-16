import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessProfile } from "@/lib/permissions";
import { applicationSchema } from "@/lib/validation";
import { tailorResume } from "@/lib/openai";
import { buildResumePdf } from "@/lib/pdf";

export async function POST(req:Request){
 try{
  const user=await apiUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json(); if(!applicationSchema.safeParse({profile_id:body.profile_id,url:body.url}).success)return NextResponse.json({error:"Invalid request."},{status:400});
  if(!(await canAccessProfile(user,body.profile_id)))return NextResponse.json({error:"Profile access denied."},{status:403});
  const db=createAdminClient();
  const {data:profile}=await db.from("client_profiles").select("*").eq("id",body.profile_id).eq("is_deleted",false).single();
  if(!profile?.master_resume_text)return NextResponse.json({error:"Master resume is missing. An admin must upload a PDF first."},{status:422});
  const job=body.job; if(!job?.jobTitle && !job?.job_title)return NextResponse.json({error:"Job extraction data is missing."},{status:422});
  const applicationId = typeof body.application_id === "string" ? body.application_id : "";
  if(!applicationId)return NextResponse.json({error:"Application record is missing. Please extract the job again."},{status:422});
  const {data:app,error:appError}=await db.from("applications").select("*").eq("id",applicationId).eq("profile_id",profile.id).single();
  if(appError||!app || (user.role!=="ADMIN" && app.created_by!==user.id))return NextResponse.json({error:"Application access denied."},{status:403});
  await db.from("applications").update({
    company:job.company||app.company||"",job_title:job.jobTitle||job.job_title||app.job_title||"",location:job.location||app.location||"",
    salary:job.salary||app.salary||"",employment_type:job.employmentType||job.employment_type||app.employment_type||"",
    description:job.description||app.description||"",responsibilities:job.responsibilities||app.responsibilities||[],
    requirements:job.requirements||app.requirements||[],skills:job.skills||app.skills||[],
    preferred_skills:job.preferredSkills||job.preferred_skills||app.preferred_skills||[],
    experience_requirements:job.experienceRequirements||app.experience_requirements||[],raw_text:job.raw_text||app.raw_text||"",
    status:"Job Extracted"
  }).eq("id",app.id);
  const tailored=await tailorResume(profile.master_resume_text,profile,job);
  const pdf=await buildResumePdf(tailored);
  const versionRes=await db.from("generated_resumes").select("version").eq("application_id",app.id).order("version",{ascending:false}).limit(1).maybeSingle();
  const version=(versionRes.data?.version||0)+1;
  const filename=`${profile.name.replace(/[^a-z0-9]+/gi,"_")}_${(job.jobTitle||job.job_title||"Tailored_Resume").replace(/[^a-z0-9]+/gi,"_")}_v${version}.pdf`;
  const path=`${profile.id}/${app.id}/resume-v${version}.pdf`;
  const up=await db.storage.from("generated-resumes").upload(path,pdf,{contentType:"application/pdf",upsert:false});
  if(up.error)throw up.error;
  const {data:resume,error:rerr}=await db.from("generated_resumes").insert({application_id:app.id,profile_id:profile.id,created_by:user.id,file_path:path,filename,version,ai_resume_json:tailored}).select().single();
  if(rerr)throw rerr;
  await db.from("applications").update({status:"Resume Ready"}).eq("id",app.id);
  return NextResponse.json({applicationId:app.id,resumeId:resume.id});
 }catch(e:any){console.error(e);return NextResponse.json({error:"Resume generation failed. Please try again."},{status:500});}
}
