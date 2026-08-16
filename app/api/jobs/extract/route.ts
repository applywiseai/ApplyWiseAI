
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchReadableJob } from "@/lib/job-extract";
import { extractJobWithAI } from "@/lib/openai";
import { canAccessProfile } from "@/lib/permissions";

const schema = z.object({ url:z.string().url().max(2048), profile_id:z.string().uuid() });

export async function POST(req:Request){
 try{
  const user=await apiUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=schema.parse(await req.json());
  if(!(await canAccessProfile(user,body.profile_id)))return NextResponse.json({error:"Profile access denied."},{status:403});
  const {rawText}=await fetchReadableJob(body.url);
  const job=await extractJobWithAI(rawText,body.url);
  const db=createAdminClient();
  const {data:application,error}=await db.from("applications").insert({
    profile_id:body.profile_id,created_by:user.id,url:body.url,company:job.company||"",job_title:job.jobTitle||"",
    location:job.location||"",salary:job.salary||"",employment_type:job.employmentType||"",description:job.description||"",
    responsibilities:job.responsibilities||[],requirements:job.requirements||[],skills:job.skills||[],
    preferred_skills:job.preferredSkills||[],experience_requirements:job.experienceRequirements||[],
    raw_text:rawText,status:"Job Extracted"
  }).select("id").single();
  if(error)throw error;
  return NextResponse.json({applicationId:application.id,job:{...job,raw_text:rawText,url:body.url}});
 }catch(e:any){
  console.error(e);
  return NextResponse.json({error:e instanceof z.ZodError?"Invalid URL or profile.":(e.message||"Unable to automatically read this job page.")},{status:422});
 }
}
