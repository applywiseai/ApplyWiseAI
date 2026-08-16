"use client";
import { useState } from "react";
import { Button, Card, Input, Label, Badge } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function NewApplication({profiles}:{profiles:any[]}){
 const [profileId,setProfileId]=useState(profiles[0]?.id||""); const [url,setUrl]=useState(""); const [job,setJob]=useState<any>(null); const [applicationId,setApplicationId]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [message,setMessage]=useState(""); const router=useRouter();
 async function extract(){setBusy(true);setError("");setMessage("");try{const r=await fetch("/api/jobs/extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,profile_id:profileId})});const j=await r.json();if(!r.ok)throw new Error(j.error);setJob(j.job);setApplicationId(j.applicationId);setMessage("Job extracted successfully.");}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function generate(){setBusy(true);setError("");setMessage("Extracting Job...");try{const r=await fetch("/api/resume/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile_id:profileId,application_id:applicationId,job,url})});const j=await r.json();if(!r.ok)throw new Error(j.error);setMessage("Tailored resume created.");router.push(`/applications/${j.applicationId}`);}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <div className="max-w-3xl"><h1 className="text-3xl font-bold mb-2">New Application</h1><p className="text-gray-500 mb-6">Create a targeted, ATS-friendly resume from a public job URL.</p>
 <div className="flex gap-2 mb-5 text-sm"><Badge>1. Profile</Badge><Badge>2. Job URL</Badge><Badge>3. Review & Generate</Badge></div>
 <Card className="space-y-5"><div><Label>Select Client Profile</Label><select className="input" value={profileId} onChange={e=>setProfileId(e.target.value)}>{profiles.map(p=><option key={p.id} value={p.id}>{p.name} — {p.email}</option>)}</select></div>
 <div><Label>Public Job URL</Label><Input placeholder="https://company.com/jobs/software-engineer" value={url} onChange={e=>setUrl(e.target.value)}/></div>
 <Button onClick={extract} disabled={busy||!profileId||!url}>{busy?"Extracting...":"Extract Job"}</Button>
 {error&&<p className="text-sm text-red-600">{error}</p>}{message&&<p className="text-sm text-green-700">{message}</p>}
 {job&&<div className="border-t pt-5 space-y-4"><div><h2 className="text-xl font-bold">{job.job_title||"Job Found"}</h2><p className="text-gray-500">{job.company||"Unknown company"} {job.location?`• ${job.location}`:""}</p></div><div><h3 className="font-semibold">Description</h3><p className="text-sm whitespace-pre-wrap mt-1">{job.description||"Not provided"}</p></div><div><h3 className="font-semibold">Requirements</h3><ul className="list-disc pl-5 text-sm">{(job.requirements||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div><div><h3 className="font-semibold">Skills</h3><p className="text-sm">{(job.skills||[]).join(" • ")||"Not provided"}</p></div><Button onClick={generate} disabled={busy}>{busy?"Creating Tailored Resume...":"Generate Tailored Resume"}</Button></div>}</Card></div>;
}
