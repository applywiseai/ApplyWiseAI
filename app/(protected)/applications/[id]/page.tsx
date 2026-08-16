import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessApplication } from "@/lib/permissions";
import { notFound } from "next/navigation";
import ApplicationActions from "@/components/application-actions";
import { Card, Badge } from "@/components/ui";

export default async function ApplicationPage({params}:{params:Promise<{id:string}>}){
 const u=await requireUser();const {id}=await params; if(!(await canAccessApplication(u,id))) return notFound();
 const db=createAdminClient(); const {data:a}=await db.from("applications").select("*,client_profiles(name,email,master_resume_filename)").eq("id",id).single(); if(!a)return notFound();
 const {data:resumes}=await db.from("generated_resumes").select("*").eq("application_id",id).order("version",{ascending:false});
 return <div><div className="flex justify-between items-start mb-6"><div><h1 className="text-3xl font-bold">{a.job_title||"Untitled Job"}</h1><p className="text-gray-500 mt-1">{a.company||"Unknown company"} {a.location?`• ${a.location}`:""}</p></div><Badge>{a.status}</Badge></div>
 <div className="grid lg:grid-cols-3 gap-5"><div className="lg:col-span-2 space-y-5"><Card><h2 className="font-bold text-lg mb-3">Job Information</h2><dl className="grid md:grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">Salary</dt><dd>{a.salary||"—"}</dd></div><div><dt className="text-gray-500">Employment Type</dt><dd>{a.employment_type||"—"}</dd></div></dl><h3 className="font-semibold mt-5">Description</h3><p className="whitespace-pre-wrap text-sm mt-1">{a.description||"—"}</p><h3 className="font-semibold mt-5">Responsibilities</h3><ul className="list-disc pl-5 text-sm">{(a.responsibilities||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul><h3 className="font-semibold mt-5">Requirements</h3><ul className="list-disc pl-5 text-sm">{(a.requirements||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></Card></div>
 <div className="space-y-5"><Card><h2 className="font-bold mb-3">Candidate</h2><p className="font-semibold">{a.client_profiles?.name}</p><p className="text-sm text-gray-500">{a.client_profiles?.email}</p><p className="text-sm mt-3">Master resume: {a.client_profiles?.master_resume_filename||"Not uploaded"}</p></Card><Card><h2 className="font-bold mb-3">Tailored Resumes</h2>{(resumes||[]).map((r:any)=><div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0"><span className="text-sm">Version {r.version}</span><a className="btn btn-secondary text-xs" href={`/api/resumes/${r.id}/download`}>Download</a></div>)}{!(resumes||[]).length&&<p className="text-sm text-gray-500">No generated resume yet.</p>}</Card><ApplicationActions id={id} status={a.status} admin={u.role==="ADMIN"}/><a className="btn btn-secondary w-full" target="_blank" href={a.url}>Open Job</a></div></div></div>;
}
